# Using Raindrop MCP as a Template

This guide explains how to use this refactored Raindrop MCP server as a template for creating new MCP servers.

## Quick Start

### Option 1: Manual Adaptation (Recommended for learning)

1. **Copy the template structure**
   ```bash
   cp -r raindrop-mcp my-new-mcp
   cd my-new-mcp
   ```

2. **Update package.json**
   - Change `name` to your project name
   - Update `description`
   - Update `author`
   - Adjust `bin` name if needed

3. **Replace API client**
   - Delete `src/api/raindrop-client.ts`
   - Create `src/api/{your-service}-client.ts` extending `HttpClientBase`
   - Implement your API methods

4. **Define your tools**
   - Edit/replace files in `src/tools/definitions/`
   - Follow the existing pattern for JSON schemas

5. **Implement tool handlers**
   - Edit/replace files in `src/tools/handlers/`
   - Use your new API client
   - Use `formatToolResponse()` for consistent output

6. **Define your resources** (if needed)
   - Edit/replace files in `src/resources/definitions/`
   - Edit/replace files in `src/resources/handlers/`

7. **Update bootstrap.ts**
   - Import your client, tools, and resources
   - Register them in the registries

8. **Update config**
   - Edit `src/config/schema.ts` for your env variables
   - Update `src/config/server-metadata.ts` with your server name/version

9. **Build and test**
   ```bash
   pnpm install
   pnpm build
   YOUR_API_TOKEN=xxx node dist/main.js
   ```

### Option 2: Future - Code Generation (Coming Soon)

Once the CLI tool is built:

```bash
npx create-mcp-server \
  --name github-mcp \
  --api-base https://api.github.com \
  --auth-type bearer \
  --tools repos:list,repos:create,issues:list
```

## File-by-File Guide

### Files to Keep (Template Level)

These files should work with minimal or no changes:

#### ✅ Core Infrastructure

- **src/core/server.ts** - No changes needed
- **src/core/builder.ts** - No changes needed
- **src/core/transport/** - No changes needed (unless adding new transports)
- **src/core/errors/** - No changes needed (extend if you need custom errors)

#### ✅ Utilities

- **src/lib/response-formatter.ts** - No changes needed
- **src/lib/logger.ts** - No changes needed

#### ✅ Base Types

- **src/types/tool.types.ts** - No changes needed
- **src/types/resource.types.ts** - No changes needed
- **src/types/api.types.ts** - Might need extension

#### 🔧 Entry Points (Minor changes)

- **src/main.ts** - No changes needed
- **src/bootstrap.ts** - Update imports and registrations

#### 🔧 Configuration (Adjust for your API)

- **src/config/schema.ts** - Update for your env variables
- **src/config/environment.ts** - Usually no changes needed
- **src/config/server-metadata.ts** - Update name and version

### Files to Replace (Domain Specific)

#### 🔄 API Client (Complete replacement)

**src/api/{your-service}-client.ts**

```typescript
import { HttpClientBase } from "./http-client.base.js";

export class GitHubClient extends HttpClientBase {
  constructor(token: string) {
    super("https://api.github.com", token);
  }

  async listRepos(username: string) {
    return this.request(`/users/${username}/repos`);
  }

  async createIssue(owner: string, repo: string, title: string, body: string) {
    return this.request(`/repos/${owner}/${repo}/issues`, {
      method: "POST",
      body: JSON.stringify({ title, body }),
    });
  }
}
```

#### 🔄 Tool Definitions (Replace schemas)

**src/tools/definitions/repos.tools.ts**

```typescript
import type { ToolDefinition } from "../../types/tool.types.js";

export const listReposTool: ToolDefinition = {
  name: "list_repos",
  description: "List repositories for a GitHub user",
  inputSchema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "GitHub username",
      },
    },
    required: ["username"],
  },
};
```

#### 🔄 Tool Handlers (Replace implementation)

**src/tools/handlers/repos.handler.ts**

```typescript
import type { ToolHandler } from "../../types/tool.types.js";
import type { GitHubClient } from "../../api/github-client.js";
import { formatToolResponse } from "../../lib/response-formatter.js";

export const listReposHandler: ToolHandler<GitHubClient> = async (
  args,
  client,
) => {
  const result = await client.listRepos(args.username);
  return formatToolResponse(result);
};
```

#### 🔄 Resources (Optional - replace if needed)

Follow the same pattern as tools:
1. Define resource metadata in `src/resources/definitions/`
2. Implement handlers in `src/resources/handlers/`

## Common Patterns

### Pattern 1: Simple GET API

```typescript
// Client method
async getItem(id: number) {
  return this.request(`/items/${id}`);
}

// Tool definition
export const getItemTool: ToolDefinition = {
  name: "get_item",
  description: "Get item by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "Item ID" },
    },
    required: ["id"],
  },
};

// Handler
export const getItemHandler: ToolHandler<MyClient> = async (args, client) => {
  const result = await client.getItem(args.id);
  return formatToolResponse(result);
};
```

### Pattern 2: POST with Body

```typescript
// Client method
async createItem(data: { name: string; value: number }) {
  return this.request("/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Tool definition
export const createItemTool: ToolDefinition = {
  name: "create_item",
  description: "Create a new item",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Item name" },
      value: { type: "number", description: "Item value" },
    },
    required: ["name", "value"],
  },
};

// Handler
export const createItemHandler: ToolHandler<MyClient> = async (
  args,
  client,
) => {
  const result = await client.createItem({
    name: args.name,
    value: args.value,
  });
  return formatToolResponse(result);
};
```

### Pattern 3: Query Parameters

```typescript
// Client method
async searchItems(query: string, limit?: number) {
  return this.request("/items/search", {
    params: { q: query, limit },
  });
}

// Tool definition
export const searchItemsTool: ToolDefinition = {
  name: "search_items",
  description: "Search for items",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      limit: { type: "number", description: "Max results" },
    },
    required: ["query"],
  },
};

// Handler
export const searchItemsHandler: ToolHandler<MyClient> = async (
  args,
  client,
) => {
  const result = await client.searchItems(args.query, args.limit);
  return formatToolResponse(result);
};
```

### Pattern 4: Custom Error Handling

```typescript
// In handler
try {
  const result = await client.dangerousOperation();
  return formatToolResponse(result);
} catch (error) {
  if (error instanceof APIError && error.statusCode === 404) {
    // Return user-friendly error
    return formatToolResponse({ message: "Item not found" });
  }
  // Re-throw for registry to handle
  throw error;
}
```

## Registration Checklist

After creating tools/resources, update `src/bootstrap.ts`:

```typescript
// 1. Import definitions
import {
  listReposTool,
  createIssueTool,
} from "./tools/definitions/index.js";

// 2. Import handlers
import {
  listReposHandler,
  createIssueHandler,
} from "./tools/handlers/index.js";

// 3. Import your client
import { GitHubClient } from "./api/github-client.js";

// 4. Create client instance
const client = new GitHubClient(config.githubToken);

// 5. Register tools
toolRegistry.registerMany([
  { definition: listReposTool, handler: listReposHandler },
  { definition: createIssueTool, handler: createIssueHandler },
]);

// 6. Update builder generic type
const server = await MCPServerBuilder.create<GitHubClient>()
  .withClient(client)
  // ... rest of builder
  .build();
```

## Environment Variables

Update `src/config/schema.ts`:

```typescript
export const ConfigSchema = z.object({
  githubToken: z
    .string()
    .min(1, "GITHUB_TOKEN environment variable is required"),
  
  serverName: z.string().default("github-mcp-server"),
  serverVersion: z.string().default("1.0.0"),
  logLevel: z.enum(["debug", "info", "error"]).default("info"),
  transportType: z.enum(["stdio"]).default("stdio"),
});
```

Update `src/types/config.types.ts`:

```typescript
export interface AppConfig {
  githubToken: string;  // Changed from raindropToken
  serverName: string;
  serverVersion: string;
  logLevel: "debug" | "info" | "error";
  transportType: "stdio";
}
```

## Testing Your New MCP Server

1. **Build**
   ```bash
   pnpm build
   ```

2. **Test with MCP Inspector**
   ```bash
   GITHUB_TOKEN=your_token pnpm inspector
   ```

3. **Test manually**
   ```bash
   GITHUB_TOKEN=your_token node dist/main.js
   ```

4. **Configure in MCP client** (e.g., Claude Desktop)
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "node",
         "args": ["/path/to/dist/main.js"],
         "env": {
           "GITHUB_TOKEN": "your_token"
         }
       }
     }
   }
   ```

## Advanced Customization

### Adding New Transport Types

1. Create `src/core/transport/{transport-name}.transport.ts`
2. Implement `ITransport` interface
3. Update `src/core/transport/factory.ts`
4. Update config schema to include new transport type

### Adding Custom Error Types

1. Create new error class in `src/core/errors/`
2. Extend `BaseError` or appropriate subclass
3. Export from `src/core/errors/index.ts`
4. Use in your API client or handlers

### Adding Middleware/Interceptors

The current architecture doesn't have explicit middleware, but you can add it:

1. Create `src/core/middleware/` folder
2. Define middleware interface
3. Update registries to support middleware chain
4. Example: logging, rate limiting, caching

## Common Pitfalls

### ❌ Wrong: Mixing concerns

```typescript
// Don't put API logic in handlers
export const handler = async (args, client) => {
  const response = await fetch("https://api.example.com/data");
  return formatToolResponse(await response.json());
};
```

### ✅ Right: Separation of concerns

```typescript
// API logic in client
class MyClient extends HttpClientBase {
  async getData() {
    return this.request("/data");
  }
}

// Handler just calls client
export const handler = async (args, client) => {
  const result = await client.getData();
  return formatToolResponse(result);
};
```

### ❌ Wrong: Not using formatToolResponse

```typescript
export const handler = async (args, client) => {
  const result = await client.getData();
  return { data: result }; // Wrong format!
};
```

### ✅ Right: Always use formatter

```typescript
export const handler = async (args, client) => {
  const result = await client.getData();
  return formatToolResponse(result); // Correct!
};
```

## Migration Checklist

When adapting this template:

- [ ] Update package.json (name, description, author)
- [ ] Replace API client in src/api/
- [ ] Update config schema for your env variables
- [ ] Update server metadata
- [ ] Create tool definitions for your API
- [ ] Create tool handlers
- [ ] Create resource definitions (if needed)
- [ ] Create resource handlers (if needed)
- [ ] Update bootstrap.ts imports and registrations
- [ ] Update README.md with your server info
- [ ] Test with MCP Inspector
- [ ] Configure in MCP client

## Need Help?

Common issues:

1. **Build errors**: Check that all imports use `.js` extension
2. **Runtime errors**: Check that client is properly registered in bootstrap
3. **Tools not showing**: Verify registration in bootstrap.ts
4. **Auth errors**: Check that env variable is set correctly

## Contributing Back to Template

If you find improvements that would benefit all MCP servers:

1. Extract domain-specific code into template-level abstractions
2. Document new patterns in this guide
3. Consider contributing back to the template repository

---

✨ Happy building! Create awesome MCP servers with this template.
