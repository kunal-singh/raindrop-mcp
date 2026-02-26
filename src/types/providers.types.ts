import type { ToolDefinition, ToolResponse } from './tool.types';
import type { ResourceDefinition, ResourceResponse } from './resource.types';
import type { PromptDefinition, PromptResponse } from './prompt.types';

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

/**
 * Provider interface for MCP prompts
 * Core infrastructure depends on this interface, not concrete implementations
 */
export interface IPromptProvider {
  listPrompts(): PromptDefinition[];
  getPrompt(name: string, args: unknown): Promise<PromptResponse>;
  hasPrompts(): boolean;
}
