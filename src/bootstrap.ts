import { loadConfig } from './config/environment.js';
import { RaindropClient } from './api/raindrop-client.js';
import { buildRaindropManifest } from './domain/manifest.js';
import { MCPServerBuilder } from './core/builder.js';
import { createTransport } from './core/transport/index.js';
import { logger } from './lib/logger.js';

/**
 * Bootstrap the MCP server
 * Pure infrastructure wiring - domain capabilities defined in manifest
 */
export async function bootstrap() {
  logger.info('Loading configuration...');
  const config = loadConfig();

  logger.info('Creating Raindrop client...');
  const client = new RaindropClient(config.raindropToken);

  logger.info('Building server manifest...');
  const manifest = buildRaindropManifest(client);

  logger.info('Creating transport...');
  const transport = createTransport(config);

  logger.info('Building MCP server...');
  const server = await MCPServerBuilder.create()
    .withConfig(config)
    .withManifest(manifest)
    .withTransport(transport)
    .build();

  logger.info('MCP server started successfully');

  return server;
}
