#!/usr/bin/env node

import { bootstrap } from './bootstrap';
import { logger } from './lib/logger';

/**
 * Main entry point
 * Calls bootstrap with error handling
 */
async function main() {
  try {
    await bootstrap();
  } catch (error) {
    logger.error('Fatal error during startup', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
