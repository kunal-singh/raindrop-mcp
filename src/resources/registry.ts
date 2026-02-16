import type {
  ResourceDefinition,
  ResourceRegistration,
  ResourceResponse,
} from '../types/resource.types.js';
import { HandlerError } from '../core/errors/index.js';

/**
 * Resource registry for managing resource definitions and handlers
 * Provides resource discovery and fetching
 */
export class ResourceRegistry<TClient> {
  private resources = new Map<string, ResourceRegistration<TClient>>();

  /**
   * Register a resource with its definition and handler
   */
  register(registration: ResourceRegistration<TClient>): void {
    const uri = registration.definition.uri;

    if (this.resources.has(uri)) {
      throw new Error(`Resource '${uri}' is already registered`);
    }

    this.resources.set(uri, registration);
  }

  /**
   * Register multiple resources at once
   */
  registerMany(registrations: ResourceRegistration<TClient>[]): void {
    for (const registration of registrations) {
      this.register(registration);
    }
  }

  /**
   * List all registered resource definitions
   */
  listResources(): ResourceDefinition[] {
    return Array.from(this.resources.values()).map((reg) => reg.definition);
  }

  /**
   * Read a resource by URI
   * @param uri - Resource URI
   * @param client - API client instance
   * @returns Resource content
   */
  async readResource(uri: string, client: TClient): Promise<ResourceResponse> {
    const registration = this.resources.get(uri);

    if (!registration) {
      throw new Error(`Unknown resource: ${uri}`);
    }

    try {
      const content = await registration.handler(uri, client);
      return {
        contents: [content],
      };
    } catch (error) {
      // Wrap execution errors
      throw new HandlerError(
        `Resource '${uri}' read failed: ${error instanceof Error ? error.message : String(error)}`,
        uri,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Check if a resource is registered
   */
  hasResource(uri: string): boolean {
    return this.resources.has(uri);
  }

  /**
   * Get the number of registered resources
   */
  get size(): number {
    return this.resources.size;
  }
}
