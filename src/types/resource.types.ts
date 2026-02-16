import type { Resource } from '@modelcontextprotocol/sdk/types.js';

/**
 * Resource definition matching MCP protocol Resource type
 */
export type ResourceDefinition = Resource;

/**
 * Resource content for MCP protocol
 */
export interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

/**
 * Generic resource handler function
 * @template TClient - The API client type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ResourceHandler<TClient = any> {
  (uri: string, client: TClient): Promise<ResourceContent>;
}

/**
 * Resource registration combining definition and handler
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ResourceRegistration<TClient = any> {
  definition: ResourceDefinition;
  handler: ResourceHandler<TClient>;
}

/**
 * MCP resource response format
 */
export interface ResourceResponse {
  contents: ResourceContent[];
}
