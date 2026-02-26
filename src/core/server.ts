import { Server } from '@modelcontextprotocol/sdk/server';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type {
  IToolProvider,
  IResourceProvider,
  IPromptProvider,
} from '../types/providers.types';
import type { AppConfig } from '../types/config.types';
import { logger } from '../lib/logger';

/**
 * MCP Server wrapper with lifecycle management
 * Handles request routing to providers
 * Core infrastructure - knows nothing about specific API implementations
 */
export class MCPServer {
  private server: Server;
  private toolProvider: IToolProvider;
  private resourceProvider: IResourceProvider;
  private promptProvider?: IPromptProvider;

  constructor(
    config: AppConfig,
    toolProvider: IToolProvider,
    resourceProvider: IResourceProvider,
    promptProvider?: IPromptProvider,
  ) {
    this.toolProvider = toolProvider;
    this.resourceProvider = resourceProvider;
    this.promptProvider = promptProvider;

    // Initialize MCP SDK server
    this.server = new Server(
      {
        name: config.serverName,
        version: config.serverVersion,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
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
        tools: this.toolProvider.listTools(),
      };
    });

    // Execute a tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.debug('Handling CallTool request', { name, args });

      const result = await this.toolProvider.executeTool(name, args || {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any; // SDK will validate the shape
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.debug('Handling ListResources request');
      return {
        resources: this.resourceProvider.listResources(),
      };
    });

    // Read a resource
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const { uri } = request.params;
        logger.debug('Handling ReadResource request', { uri });

        const result = await this.resourceProvider.readResource(uri);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result as any; // SDK will validate the shape
      },
    );

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      logger.debug('Handling ListPrompts request');
      return {
        prompts: this.promptProvider?.listPrompts() ?? [],
      };
    });

    // Get a prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.debug('Handling GetPrompt request', { name, args });

      if (!this.promptProvider) {
        throw new Error(`Unknown prompt: ${name}`);
      }

      const result = await this.promptProvider.getPrompt(name, args ?? {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any; // SDK will validate the shape
    });
  }

  /**
   * Get the underlying SDK server instance
   */
  getServer(): Server {
    return this.server;
  }
}
