import type {
  Prompt,
  GetPromptResult,
  PromptMessage,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Prompt definition matching MCP protocol Prompt type
 */
export type PromptDefinition = Prompt;

/**
 * Re-export PromptMessage for use in handlers
 */
export type { PromptMessage };

/**
 * Prompt response matching MCP protocol GetPromptResult type
 * Shape: { description?: string; messages: PromptMessage[] }
 */
export type PromptResponse = GetPromptResult;

/**
 * Generic prompt handler function
 * @template TClient - The API client type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PromptHandler<TClient = any> {
  (name: string, args: unknown, client: TClient): Promise<PromptResponse>;
}

/**
 * Prompt registration combining definition and handler
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PromptRegistration<TClient = any> {
  definition: PromptDefinition;
  handler: PromptHandler<TClient>;
}
