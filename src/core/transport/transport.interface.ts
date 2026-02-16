import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Transport interface for MCP protocol
 * Abstracts the communication layer (stdio, SSE, HTTP, etc.)
 */
export interface ITransport {
  /**
   * Connect the transport to an MCP server
   */
  connect(server: Server): Promise<void>;

  /**
   * Disconnect the transport (optional cleanup)
   */
  disconnect?(): Promise<void>;
}
