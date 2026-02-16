import { z } from 'zod';

/**
 * Zod schema for environment configuration
 */
export const ConfigSchema = z.object({
  raindropToken: z
    .string()
    .min(1, 'RAINDROP_TOKEN environment variable is required'),

  serverName: z.string().default('raindrop-mcp-server'),

  serverVersion: z.string().default('1.0.0'),

  logLevel: z.enum(['debug', 'info', 'error']).default('info'),

  transportType: z.enum(['stdio']).default('stdio'),
});

/**
 * Inferred TypeScript type from schema
 */
export type ConfigSchemaType = z.infer<typeof ConfigSchema>;
