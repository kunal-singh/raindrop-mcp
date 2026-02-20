import type { ToolDefinition, ToolResponse } from './tool.types.js';
import type { ResourceDefinition, ResourceResponse } from './resource.types.js';

/**
 * Provider interface for MCP tools
 * Core infrastructure depends on this interface, not concrete implementations
 */
export interface IToolProvider {
  listTools(): ToolDefinition[];
  executeTool(name: string, args: unknown): Promise<ToolResponse>;
  hasTools(): boolean;
}

/**
 * Provider interface for MCP resources
 * Core infrastructure depends on this interface, not concrete implementations
 */
export interface IResourceProvider {
  listResources(): ResourceDefinition[];
  readResource(uri: string): Promise<ResourceResponse>;
  hasResources(): boolean;
}

// Future extension point - uncomment when implementing prompts
// export interface IPromptProvider {
//   listPrompts(): PromptDefinition[];
//   getPrompt(name: string, args: unknown): Promise<PromptResponse>;
//   hasPrompts(): boolean;
// }
