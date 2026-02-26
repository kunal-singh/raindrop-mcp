import type { Prompt } from '@modelcontextprotocol/sdk/types.js';

/**
 * Resource definition matching MCP protocol Resource type
 */
export type PromptDefinition = Prompt;

/**
 * Resource content for MCP protocol
 */
export interface PromptContent {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/**
 * Generic resource handler function
 * @template TClient - The API client type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PromptHandler<TClient = any> {
  (name: string, args: unknown, client: TClient): Promise<PromptContent>;
}

/**
 * Prompt registration combining definition and handler
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PromptRegistration<TClient = any> {
  definition: PromptDefinition;
  handler: PromptHandler<TClient>;
}

/**
 * MCP resource response format
 */
export interface PromptResponse {
  contents: PromptContent[];
}
