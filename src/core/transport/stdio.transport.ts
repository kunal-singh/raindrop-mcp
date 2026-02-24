import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Server } from '@modelcontextprotocol/sdk/server';
import type { ITransport } from './transport.interface';

/**
 * Stdio transport implementation for MCP protocol
 * Communicates via standard input/output streams
 */
export class StdioTransport implements ITransport {
  private transport: StdioServerTransport;

  constructor() {
    this.transport = new StdioServerTransport();
  }

  async connect(server: Server): Promise<void> {
    await server.connect(this.transport);
  }

  async disconnect(): Promise<void> {
    // Stdio transport doesn't require explicit cleanup
    // This method is here for interface compliance
  }
}
