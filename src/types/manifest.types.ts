import type {
  IToolProvider,
  IResourceProvider,
  IPromptProvider,
} from './providers.types';

/**
 * Server manifest declaring all capabilities a specific MCP server provides
 * This is the contract between domain-specific configuration and core infrastructure
 */
export interface ServerManifest {
  tools: IToolProvider;
  resources: IResourceProvider;
  prompts?: IPromptProvider;
}
