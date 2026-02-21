import { ConfigSchema } from './schema';
import type { AppConfig } from '../types/config.types';
import { SERVER_METADATA } from './server-metadata';

/**
 * Load and validate configuration from environment variables
 * @throws {Error} If configuration is invalid
 * @returns Validated application configuration
 */
export function loadConfig(): AppConfig {
  const rawConfig = {
    raindropToken: process.env.RAINDROP_TOKEN,
    serverName: SERVER_METADATA.name,
    serverVersion: SERVER_METADATA.version,
    logLevel: process.env.LOG_LEVEL,
    transportType: process.env.TRANSPORT_TYPE,
  };

  try {
    const validated = ConfigSchema.parse(rawConfig);
    return validated as AppConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Configuration validation failed: ${error.message}`);
    }
    throw error;
  }
}
