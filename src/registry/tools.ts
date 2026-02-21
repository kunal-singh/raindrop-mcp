import type {
  ToolDefinition,
  ToolRegistration,
  ToolResponse,
} from '../types/tool.types';
import type { IToolProvider } from '../types/providers.types';
import { formatErrorResponse } from '../lib/response-formatter';
import { HandlerError } from '../core/errors/index';

/**
 * Tool registry for managing tool definitions and handlers
 * Provides tool discovery and execution routing
 */
export class ToolRegistry<TClient> implements IToolProvider {
  private tools = new Map<string, ToolRegistration<TClient>>();
  private client: TClient;

  constructor(client: TClient) {
    this.client = client;
  }

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
   * @returns Tool execution result
   */
  async executeTool(name: string, args: unknown): Promise<ToolResponse> {
    const registration = this.tools.get(name);

    if (!registration) {
      return formatErrorResponse(new Error(`Unknown tool: ${name}`));
    }

    try {
      const result = await registration.handler(args, this.client);
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
   * Check if registry has any tools
   */
  hasTools(): boolean {
    return this.tools.size > 0;
  }

  /**
   * Get the number of registered tools
   */
  get size(): number {
    return this.tools.size;
  }
}
