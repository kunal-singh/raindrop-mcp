import type {
  ToolDefinition,
  ToolRegistration,
  ToolResponse,
} from '../types/tool.types.js';
import { formatErrorResponse } from '../lib/response-formatter.js';
import { HandlerError } from '../core/errors/index.js';

/**
 * Tool registry for managing tool definitions and handlers
 * Provides tool discovery and execution routing
 */
export class ToolRegistry<TClient> {
  private tools = new Map<string, ToolRegistration<TClient>>();

  /**
   * Register a tool with its definition and handler
   */
  register(registration: ToolRegistration<TClient>): void {
    const toolName = registration.definition.name;

    if (this.tools.has(toolName)) {
      throw new Error(`Tool '${toolName}' is already registered`);
    }

    this.tools.set(toolName, registration);
  }

  /**
   * Register multiple tools at once
   */
  registerMany(registrations: ToolRegistration<TClient>[]): void {
    for (const registration of registrations) {
      this.register(registration);
    }
  }

  /**
   * List all registered tool definitions
   */
  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((reg) => reg.definition);
  }

  /**
   * Execute a tool by name
   * @param name - Tool name
   * @param args - Tool arguments
   * @param client - API client instance
   * @returns Tool execution result
   */
  async executeTool(
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any,
    client: TClient,
  ): Promise<ToolResponse> {
    const registration = this.tools.get(name);

    if (!registration) {
      return formatErrorResponse(new Error(`Unknown tool: ${name}`));
    }

    try {
      const result = await registration.handler(args, client);
      return result;
    } catch (error) {
      // Wrap execution errors
      const handlerError = new HandlerError(
        `Tool '${name}' execution failed: ${error instanceof Error ? error.message : String(error)}`,
        name,
        error instanceof Error ? error : undefined,
      );
      return formatErrorResponse(handlerError);
    }
  }

  /**
   * Check if a tool is registered
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get the number of registered tools
   */
  get size(): number {
    return this.tools.size;
  }
}
