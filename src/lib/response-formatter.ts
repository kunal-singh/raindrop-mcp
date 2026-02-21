import type { ToolResponse } from '../types/tool.types';
import { BaseError } from '../core/errors';

/**
 * Format successful tool response for MCP protocol
 * @param data - Response data from API or handler
 * @returns Formatted tool response
 */
export function formatToolResponse(data: unknown): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Format error response for MCP protocol
 * @param error - Error object
 * @returns Formatted error response
 */
export function formatErrorResponse(error: unknown): ToolResponse {
  let message: string;

  if (error instanceof BaseError) {
    message = `${error.name}: ${error.message}`;
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
    isError: true,
  };
}
