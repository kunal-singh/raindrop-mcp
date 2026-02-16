import { loadConfig } from './config/environment.js';
import { RaindropClient } from './api/raindrop-client.js';
import { ToolRegistry } from './tools/registry.js';
import { ResourceRegistry } from './resources/registry.js';
import { MCPServerBuilder } from './core/builder.js';
import { createTransport } from './core/transport/index.js';
import { logger } from './lib/logger.js';

// Import tool definitions and handlers
import {
  searchBookmarksTool,
  createBookmarkTool,
  updateBookmarkTool,
  deleteBookmarkTool,
  listCollectionsTool,
  createCollectionTool,
  deleteCollectionTool,
  getTagsTool,
} from './tools/definitions/index.js';

import {
  searchBookmarksHandler,
  createBookmarkHandler,
  updateBookmarkHandler,
  deleteBookmarkHandler,
  listCollectionsHandler,
  createCollectionHandler,
  deleteCollectionHandler,
  getTagsHandler,
} from './tools/handlers/index.js';

// Import resource definitions and handlers
import { allBookmarksResource } from './resources/definitions/index.js';
import { allBookmarksHandler } from './resources/handlers/index.js';

/**
 * Bootstrap the MCP server
 * Orchestrates initialization of all components
 */
export async function bootstrap() {
  // Load and validate configuration
  logger.info('Loading configuration...');
  const config = loadConfig();

  // Create API client
  logger.info('Creating Raindrop client...');
  const client = new RaindropClient(config.raindropToken);

  // Create and register tools
  logger.info('Registering tools...');
  const toolRegistry = new ToolRegistry<RaindropClient>();

  toolRegistry.registerMany([
    // Bookmark tools
    { definition: searchBookmarksTool, handler: searchBookmarksHandler },
    { definition: createBookmarkTool, handler: createBookmarkHandler },
    { definition: updateBookmarkTool, handler: updateBookmarkHandler },
    { definition: deleteBookmarkTool, handler: deleteBookmarkHandler },

    // Collection tools
    { definition: listCollectionsTool, handler: listCollectionsHandler },
    { definition: createCollectionTool, handler: createCollectionHandler },
    { definition: deleteCollectionTool, handler: deleteCollectionHandler },

    // Tag tools
    { definition: getTagsTool, handler: getTagsHandler },
  ]);

  logger.info(`Registered ${toolRegistry.size} tools`);

  // Create and register resources
  logger.info('Registering resources...');
  const resourceRegistry = new ResourceRegistry<RaindropClient>();

  resourceRegistry.register({
    definition: allBookmarksResource,
    handler: allBookmarksHandler,
  });

  logger.info(`Registered ${resourceRegistry.size} resources`);

  // Create transport
  const transport = createTransport(config);

  // Build and connect server
  logger.info('Building MCP server...');
  const server = await MCPServerBuilder.create<RaindropClient>()
    .withConfig(config)
    .withClient(client)
    .withToolRegistry(toolRegistry)
    .withResourceRegistry(resourceRegistry)
    .withTransport(transport)
    .build();

  logger.info('MCP server started successfully');

  return server;
}
