import type { ToolDefinition } from '../../../types/tool.types.js';

/**
 * Get tags tool definition
 */
export const getTagsTool: ToolDefinition = {
  name: 'get_tags',
  description: 'Get all available tags',
  inputSchema: {
    type: 'object',
    properties: {
      collectionId: {
        type: 'number',
        description: 'Filter tags by collection (optional)',
      },
    },
  },
};
