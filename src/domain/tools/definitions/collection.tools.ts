import type { ToolDefinition } from '../../../types/tool.types';

/**
 * List collections tool definition
 */
export const listCollectionsTool: ToolDefinition = {
  name: 'list_collections',
  description: 'List all collections',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

/**
 * Create collection tool definition
 */
export const createCollectionTool: ToolDefinition = {
  name: 'create_collection',
  description: 'Create a new collection',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Collection title',
      },
      view: {
        type: 'string',
        description: 'View type: list, simple, grid, masonry',
        enum: ['list', 'simple', 'grid', 'masonry'],
      },
      public: {
        type: 'boolean',
        description: 'Make collection public',
      },
    },
    required: ['title'],
  },
};

/**
 * Delete collection tool definition
 */
export const deleteCollectionTool: ToolDefinition = {
  name: 'delete_collection',
  description: 'Delete a collection',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Collection ID to delete',
      },
    },
    required: ['id'],
  },
};
