import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { ToolRegistry } from '../tools/registry.js';
import type { ResourceRegistry } from '../resources/registry.js';
import type { AppConfig } from '../types/config.types.js';
import { logger } from '../lib/logger.js';

/**
 * MCP Server wrapper with lifecycle management
 * Handles request routing to registries
 */
export class MCPServer<TClient> {
  private server: Server;
  private client: TClient;
  private toolRegistry: ToolRegistry<TClient>;
  private resourceRegistry: ResourceRegistry<TClient>;

  constructor(
    config: AppConfig,
    client: TClient,
    toolRegistry: ToolRegistry<TClient>,
    resourceRegistry: ResourceRegistry<TClient>,
  ) {
    this.client = client;
    this.toolRegistry = toolRegistry;
    this.resourceRegistry = resourceRegistry;

    // Initialize MCP SDK server
    this.server = new Server(
      {
        name: config.serverName,
        version: config.serverVersion,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP protocol request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Handling ListTools request');
      return {
        tools: this.toolRegistry.listTools(),
      };
    });

    // Execute a tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.debug('Handling CallTool request', { name, args });

      const result = await this.toolRegistry.executeTool(
        name,
        args || {},
        this.client,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any; // SDK will validate the shape
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.debug('Handling ListResources request');
      return {
        resources: this.resourceRegistry.listResources(),
      };
    });

    // Read a resource
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const { uri } = request.params;
        logger.debug('Handling ReadResource request', { uri });

        const result = await this.resourceRegistry.readResource(
          uri,
          this.client,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result as any; // SDK will validate the shape
      },
    );
  }

  /**
   * Get the underlying SDK server instance
   */
  getServer(): Server {
    return this.server;
  }
}
