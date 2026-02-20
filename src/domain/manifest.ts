import type { ServerManifest } from '../types/manifest.types.js';
import { ToolRegistry } from '../tools/registry.js';
import { ResourceRegistry } from '../resources/registry.js';
import type { RaindropClient } from '../api/raindrop-client.js';

// Tool definitions
import {
  searchBookmarksTool,
  createBookmarkTool,
  updateBookmarkTool,
  deleteBookmarkTool,
  listCollectionsTool,
  createCollectionTool,
  deleteCollectionTool,
  getTagsTool,
} from '../tools/definitions/index.js';

// Tool handlers
import {
  searchBookmarksHandler,
  createBookmarkHandler,
  updateBookmarkHandler,
  deleteBookmarkHandler,
  listCollectionsHandler,
  createCollectionHandler,
  deleteCollectionHandler,
  getTagsHandler,
} from '../tools/handlers/index.js';

// Resource definitions and handlers
import { allBookmarksResource } from '../resources/definitions/index.js';
import { allBookmarksHandler } from '../resources/handlers/index.js';

/**
 * Build the complete Raindrop.io MCP server manifest
 *
 * This function encapsulates all Raindrop-specific capability declarations.
 * To add a new Raindrop tool or resource, only this file needs to change.
 *
 * @param client - Raindrop API client instance
 * @returns Complete server manifest with all providers
 */
export function buildRaindropManifest(client: RaindropClient): ServerManifest {
  // Construct and populate tool registry
  const toolRegistry = new ToolRegistry(client);
  toolRegistry.registerMany([
    { definition: searchBookmarksTool, handler: searchBookmarksHandler },
    { definition: createBookmarkTool, handler: createBookmarkHandler },
    { definition: updateBookmarkTool, handler: updateBookmarkHandler },
    { definition: deleteBookmarkTool, handler: deleteBookmarkHandler },
    { definition: listCollectionsTool, handler: listCollectionsHandler },
    { definition: createCollectionTool, handler: createCollectionHandler },
    { definition: deleteCollectionTool, handler: deleteCollectionHandler },
    { definition: getTagsTool, handler: getTagsHandler },
  ]);

  // Construct and populate resource registry
  const resourceRegistry = new ResourceRegistry(client);
  resourceRegistry.register({
    definition: allBookmarksResource,
    handler: allBookmarksHandler,
  });

  return {
    tools: toolRegistry,
    resources: resourceRegistry,
    // prompts: promptRegistry,  // uncomment when prompts are implemented
  };
}
