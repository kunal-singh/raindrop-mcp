import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool definition matching MCP protocol Tool type
 */
export type ToolDefinition = Tool;

/**
 * Generic tool handler function
 * @template TClient - The API client type
 * @template TArgs - The tool arguments type
 * @template TResult - The return type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ToolHandler<TClient = any, TArgs = any, TResult = any> {
  (args: TArgs, client: TClient): Promise<TResult>;
}

/**
 * Tool registration combining definition and handler
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ToolRegistration<TClient = any> {
  definition: ToolDefinition;
  handler: ToolHandler<TClient>;
}

/**
 * MCP tool response format
 */
export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}
