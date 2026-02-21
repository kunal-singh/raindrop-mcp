import type { ITransport } from './transport.interface';
import { StdioTransport } from './stdio.transport';
import type { AppConfig } from '../../types/config.types';

/**
 * Factory for creating transport instances based on configuration
 */
export function createTransport(config: AppConfig): ITransport {
  switch (config.transportType) {
    case 'stdio':
      return new StdioTransport();
    default:
      throw new Error(`Unsupported transport type: ${config.transportType}`);
  }
}
