import { MCPServer } from './server.js';
import { ToolRegistry } from '../tools/registry.js';
import { ResourceRegistry } from '../resources/registry.js';
import type { AppConfig } from '../types/config.types.js';
import type { ITransport } from './transport/index.js';

/**
 * Builder for constructing MCP servers with fluent API
 * Validates all dependencies are provided before building
 */
export class MCPServerBuilder<TClient> {
  private config?: AppConfig;
  private client?: TClient;
  private toolRegistry?: ToolRegistry<TClient>;
  private resourceRegistry?: ResourceRegistry<TClient>;
  private transport?: ITransport;

  private constructor() {}

  /**
   * Create a new server builder
   */
  static create<TClient>(): MCPServerBuilder<TClient> {
    return new MCPServerBuilder<TClient>();
  }

  /**
   * Set the application configuration
   */
  withConfig(config: AppConfig): this {
    this.config = config;
    return this;
  }

  /**
   * Set the API client
   */
  withClient(client: TClient): this {
    this.client = client;
    return this;
  }

  /**
   * Set the tool registry
   */
  withToolRegistry(registry: ToolRegistry<TClient>): this {
    this.toolRegistry = registry;
    return this;
  }

  /**
   * Set the resource registry
   */
  withResourceRegistry(registry: ResourceRegistry<TClient>): this {
    this.resourceRegistry = registry;
    return this;
  }

  /**
   * Set the transport
   */
  withTransport(transport: ITransport): this {
    this.transport = transport;
    return this;
  }

  /**
   * Build the MCP server
   * @throws {Error} If any required dependency is missing
   */
  async build(): Promise<MCPServer<TClient>> {
    // Validate all dependencies
    if (!this.config) {
      throw new Error('Config is required. Call withConfig() before build()');
    }
    if (!this.client) {
      throw new Error('Client is required. Call withClient() before build()');
    }
    if (!this.toolRegistry) {
      throw new Error(
        'Tool registry is required. Call withToolRegistry() before build()',
      );
    }
    if (!this.resourceRegistry) {
      throw new Error(
        'Resource registry is required. Call withResourceRegistry() before build()',
      );
    }
    if (!this.transport) {
      throw new Error(
        'Transport is required. Call withTransport() before build()',
      );
    }

    // Create server (non-null assertion safe due to validation above)
    const server = new MCPServer(
      this.config,
      this.client as NonNullable<TClient>,
      this.toolRegistry as ToolRegistry<NonNullable<TClient>>,
      this.resourceRegistry as ResourceRegistry<NonNullable<TClient>>,
    );

    // Connect transport
    await this.transport.connect(server.getServer());

    return server as MCPServer<TClient>;
  }
}
