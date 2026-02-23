import type { ServerManifest } from '../types/manifest.types';
import { ToolRegistry } from '../registry/tools';
import { ResourceRegistry } from '../registry/resources';
import type { IRaindropClient } from './api/raindrop-client.interface';
import { CachedRaindropClient } from './api/cached-raindrop-client';
import { logger } from '../lib/logger';

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
} from './tools/definitions';

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
} from './tools/handlers';

// Resource definitions and handlers
import { allBookmarksResource } from './resources/definitions';
import { allBookmarksHandler } from './resources/handlers';

/**
 * Build the complete Raindrop.io MCP server manifest
 *
 * This function encapsulates all Raindrop-specific capability declarations.
 * To add a new Raindrop tool or resource, only this file needs to change.
 *
 * @param client - Raindrop API client instance
 * @returns Complete server manifest with all providers
 */
export function buildRaindropManifest(client: IRaindropClient): ServerManifest {
  const cachedClient = new CachedRaindropClient(client);

  // Construct and populate tool registry
  const toolRegistry = new ToolRegistry(cachedClient);
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
  const resourceRegistry = new ResourceRegistry(cachedClient);
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

/**
 * Pre-warm the cache by fetching all cacheable endpoints at startup.
 * Failures are non-fatal — the cache will populate lazily on first request.
 *
 * @param client - Must be a CachedRaindropClient instance for warming to have effect
 */
export async function primeCache(client: IRaindropClient): Promise<void> {
  const endpoints = [
    { name: 'collections', fn: () => client.getCollections() },
    { name: 'tags', fn: () => client.getTags() },
    { name: 'bookmarks', fn: () => client.getRaindrops(0, { perpage: 50 }) },
  ];

  await Promise.allSettled(
    endpoints.map(async ({ name, fn }) => {
      try {
        await fn();
        logger.info(`Cache warmed: ${name}`);
      } catch (error) {
        logger.warn(
          `Cache warm failed for ${name}, will populate on first request`,
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
      }
    }),
  );
}
