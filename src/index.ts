#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Raindrop.io API client
class RaindropClient {
  private baseUrl = "https://api.raindrop.io/rest/v1";
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Raindrop API error: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    return response.json();
  }

  // Get all collections
  async getCollections() {
    return this.request("/collections");
  }

  // Get raindrops from a collection
  async getRaindrops(
    collectionId: number = 0,
    options: {
      search?: string;
      sort?: string;
      page?: number;
      perpage?: number;
    } = {}
  ) {
    const params = new URLSearchParams();
    if (options.search) params.append("search", options.search);
    if (options.sort) params.append("sort", options.sort);
    if (options.page !== undefined) params.append("page", options.page.toString());
    if (options.perpage) params.append("perpage", options.perpage.toString());

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/raindrops/${collectionId}${query}`);
  }

  // Get a single raindrop
  async getRaindrop(id: number) {
    return this.request(`/raindrop/${id}`);
  }

  // Create a new raindrop
  async createRaindrop(data: {
    link: string;
    title?: string;
    excerpt?: string;
    tags?: string[];
    collection?: { $id: number };
  }) {
    return this.request("/raindrop", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update a raindrop
  async updateRaindrop(
    id: number,
    data: {
      title?: string;
      excerpt?: string;
      tags?: string[];
      collection?: { $id: number };
    }
  ) {
    return this.request(`/raindrop/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Delete a raindrop
  async deleteRaindrop(id: number) {
    return this.request(`/raindrop/${id}`, {
      method: "DELETE",
    });
  }

  // Get all tags
  async getTags(collectionId?: number) {
    const endpoint = collectionId
      ? `/tags/${collectionId}`
      : "/tags";
    return this.request(endpoint);
  }

  // Create a collection
  async createCollection(data: { title: string; view?: string; public?: boolean }) {
    return this.request("/collection", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Delete a collection
  async deleteCollection(id: number) {
    return this.request(`/collection/${id}`, {
      method: "DELETE",
    });
  }
}

// Initialize MCP server
const server = new Server(
  {
    name: "raindrop-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Get token from environment
const RAINDROP_TOKEN = process.env.RAINDROP_TOKEN;
if (!RAINDROP_TOKEN) {
  throw new Error("RAINDROP_TOKEN environment variable is required");
}

const raindrop = new RaindropClient(RAINDROP_TOKEN);

// Define available tools
const TOOLS: Tool[] = [
  {
    name: "search_bookmarks",
    description: "Search through bookmarks with optional filters",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (optional)",
        },
        collectionId: {
          type: "number",
          description: "Collection ID to search in (0 for all bookmarks, default: 0)",
        },
        sort: {
          type: "string",
          description: "Sort order: created, -created, title, -title, domain, -domain",
          enum: ["created", "-created", "title", "-title", "domain", "-domain"],
        },
        page: {
          type: "number",
          description: "Page number (starts at 0)",
        },
        perpage: {
          type: "number",
          description: "Results per page (max 50)",
        },
      },
    },
  },
  {
    name: "create_bookmark",
    description: "Create a new bookmark",
    inputSchema: {
      type: "object",
      properties: {
        link: {
          type: "string",
          description: "URL of the bookmark",
        },
        title: {
          type: "string",
          description: "Title of the bookmark",
        },
        excerpt: {
          type: "string",
          description: "Description or note",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags to categorize the bookmark",
        },
        collectionId: {
          type: "number",
          description: "Collection ID (optional, defaults to Unsorted)",
        },
      },
      required: ["link"],
    },
  },
  {
    name: "update_bookmark",
    description: "Update an existing bookmark",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Bookmark ID",
        },
        title: {
          type: "string",
          description: "New title",
        },
        excerpt: {
          type: "string",
          description: "New description",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "New tags",
        },
        collectionId: {
          type: "number",
          description: "Move to this collection",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_bookmark",
    description: "Delete a bookmark (moves to trash)",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Bookmark ID to delete",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "list_collections",
    description: "List all collections",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_collection",
    description: "Create a new collection",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Collection title",
        },
        view: {
          type: "string",
          description: "View type: list, simple, grid, masonry",
          enum: ["list", "simple", "grid", "masonry"],
        },
        public: {
          type: "boolean",
          description: "Make collection public",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "delete_collection",
    description: "Delete a collection",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Collection ID to delete",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_tags",
    description: "Get all available tags",
    inputSchema: {
      type: "object",
      properties: {
        collectionId: {
          type: "number",
          description: "Filter tags by collection (optional)",
        },
      },
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_bookmarks": {
        const result = await raindrop.getRaindrops(
          args.collectionId || 0,
          {
            search: args.query,
            sort: args.sort,
            page: args.page,
            perpage: args.perpage,
          }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "create_bookmark": {
        const data: any = { link: args.link };
        if (args.title) data.title = args.title;
        if (args.excerpt) data.excerpt = args.excerpt;
        if (args.tags) data.tags = args.tags;
        if (args.collectionId) data.collection = { $id: args.collectionId };

        const result = await raindrop.createRaindrop(data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "update_bookmark": {
        const data: any = {};
        if (args.title) data.title = args.title;
        if (args.excerpt) data.excerpt = args.excerpt;
        if (args.tags) data.tags = args.tags;
        if (args.collectionId) data.collection = { $id: args.collectionId };

        const result = await raindrop.updateRaindrop(args.id, data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "delete_bookmark": {
        const result = await raindrop.deleteRaindrop(args.id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_collections": {
        const result = await raindrop.getCollections();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "create_collection": {
        const result = await raindrop.createCollection({
          title: args.title,
          view: args.view,
          public: args.public,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "delete_collection": {
        const result = await raindrop.deleteCollection(args.id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_tags": {
        const result = await raindrop.getTags(args.collectionId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "raindrop://bookmarks/all",
      name: "All Bookmarks",
      description: "All your Raindrop.io bookmarks",
      mimeType: "application/json",
    },
  ],
}));

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "raindrop://bookmarks/all") {
    const result = await raindrop.getRaindrops(0, { perpage: 50 });
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Raindrop MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});