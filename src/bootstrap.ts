import { loadConfig } from './config/environment';
import { RaindropClient } from './domain/api/raindrop-client';
import { CachedRaindropClient } from './domain/api/cached-raindrop-client';
import { buildRaindropManifest, primeCache } from './domain/manifest';
import { MCPServerBuilder } from './core/builder';
import { createTransport } from './core/transport/index';
import { logger } from './lib/logger';

/**
 * Bootstrap the MCP server
 * Pure infrastructure wiring - domain capabilities defined in manifest
 */
export async function bootstrap() {
  logger.info('Loading configuration...');
  const config = loadConfig();

  logger.info('Creating Raindrop client...');
  const client = new RaindropClient(config.raindropToken);
  const cachedClient = new CachedRaindropClient(client);

  logger.info('Building server manifest...');
  const manifest = buildRaindropManifest(cachedClient);

  logger.info('Warming cache...');
  await primeCache(cachedClient);

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
