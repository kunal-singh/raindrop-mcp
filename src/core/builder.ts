import { MCPServer } from './server';
import type { AppConfig } from '../types/config.types';
import type { ServerManifest } from '../types/manifest.types';
import type { ITransport } from './transport';

/**
 * Builder for constructing MCP servers with fluent API
 * Validates all dependencies are provided before building
 */
export class MCPServerBuilder {
  private config?: AppConfig;
  private manifest?: ServerManifest;
  private transport?: ITransport;

  private constructor() {}

  /**
   * Create a new server builder
   */
  static create(): MCPServerBuilder {
    return new MCPServerBuilder();
  }

  /**
   * Set the application configuration
   */
  withConfig(config: AppConfig): this {
    this.config = config;
    return this;
  }

  /**
   * Set the server manifest (tools, resources, etc.)
   */
  withManifest(manifest: ServerManifest): this {
    this.manifest = manifest;
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
  async build(): Promise<MCPServer> {
    // Validate all dependencies
    if (!this.config) {
      throw new Error('Config is required. Call withConfig() before build()');
    }
    if (!this.manifest) {
      throw new Error(
        'Manifest is required. Call withManifest() before build()',
      );
    }
    if (!this.transport) {
      throw new Error(
        'Transport is required. Call withTransport() before build()',
      );
    }

    // Create server
    const server = new MCPServer(
      this.config,
      this.manifest.tools,
      this.manifest.resources,
      this.manifest.prompts,
    );

    // Connect transport
    await this.transport.connect(server.getServer());

    return server;
  }
}
