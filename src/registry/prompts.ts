import type {
  PromptDefinition,
  PromptRegistration,
  PromptResponse,
} from '../types/prompt.types';
import type { IPromptProvider } from '../types/providers.types';
import { HandlerError } from '../core/errors';

/**
 * Prompt registry for managing prompt definitions and handlers
 * Provides prompt discovery and retrieval
 */
export class PromptRegistry<TClient> implements IPromptProvider {
  private prompts = new Map<string, PromptRegistration<TClient>>();
  private client: TClient;

  constructor(client: TClient) {
    this.client = client;
  }

  /**
   * Register a prompt with its definition and handler
   */
  register(registration: PromptRegistration<TClient>): void {
    const name = registration.definition.name;

    if (this.prompts.has(name)) {
      throw new Error(`Prompt '${name}' is already registered`);
    }

    this.prompts.set(name, registration);
  }

  /**
   * Register multiple prompts at once
   */
  registerMany(registrations: PromptRegistration<TClient>[]): void {
    for (const registration of registrations) {
      this.register(registration);
    }
  }

  /**
   * List all registered prompt definitions
   */
  listPrompts(): PromptDefinition[] {
    return Array.from(this.prompts.values()).map((reg) => reg.definition);
  }

  /**
   * Get a prompt by name
   * @param name - Prompt name
   * @param args - Prompt arguments
   * @returns Prompt content
   */
  async getPrompt(name: string, args: unknown): Promise<PromptResponse> {
    const registration = this.prompts.get(name);

    if (!registration) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    try {
      return await registration.handler(name, args, this.client);
    } catch (error) {
      throw new HandlerError(
        `Prompt '${name}' retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        name,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Check if registry has any prompts
   */
  hasPrompts(): boolean {
    return this.prompts.size > 0;
  }

  /**
   * Get the number of registered prompts
   */
  get size(): number {
    return this.prompts.size;
  }
}
