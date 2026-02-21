import type { ServerMetadata } from '../types/config.types';

/**
 * Static server metadata
 * In a production setup, these would be derived from package.json at build time
 */
export const SERVER_METADATA: ServerMetadata = {
  name: 'raindrop-mcp-server',
  version: '1.0.0',
};
