import { BaseError } from './base-error';

/**
 * Tool execution errors
 */
export class ToolError extends BaseError {
  constructor(
    message: string,
    public readonly toolName?: string,
  ) {
    super(message, 'TOOL_ERROR');
  }
}

/**
 * Tool argument validation errors
 */
export class ValidationError extends ToolError {
  constructor(message: string, toolName?: string) {
    super(message, toolName);
    this.name = 'ValidationError';
  }
}

/**
 * Tool handler execution errors
 */
export class HandlerError extends ToolError {
  constructor(
    message: string,
    toolName?: string,
    public override readonly cause?: Error,
  ) {
    super(message, toolName);
    this.name = 'HandlerError';
  }
}
