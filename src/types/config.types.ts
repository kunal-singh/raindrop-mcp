/**
 * Application configuration interface
 */
export interface AppConfig {
  /** Raindrop.io API token */
  raindropToken: string;

  /** Server name for MCP protocol */
  serverName: string;

  /** Server version */
  serverVersion: string;

  /** Log level for application logging */
  logLevel: 'debug' | 'info' | 'error';

  /** Transport type (currently only stdio) */
  transportType: 'stdio';
}

/**
 * Server metadata
 */
export interface ServerMetadata {
  name: string;
  version: string;
}
