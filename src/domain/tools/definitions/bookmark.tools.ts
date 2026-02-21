import type { ToolDefinition } from '../../../types/tool.types';

/**
 * Search bookmarks tool definition
 */
export const searchBookmarksTool: ToolDefinition = {
  name: 'search_bookmarks',
  description: 'Search through bookmarks with optional filters',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (optional)',
      },
      collectionId: {
        type: 'number',
        description:
          'Collection ID to search in (0 for all bookmarks, default: 0)',
      },
      sort: {
        type: 'string',
        description:
          'Sort order: created, -created, title, -title, domain, -domain',
        enum: ['created', '-created', 'title', '-title', 'domain', '-domain'],
      },
      page: {
        type: 'number',
        description: 'Page number (starts at 0)',
      },
      perpage: {
        type: 'number',
        description: 'Results per page (max 50)',
      },
    },
  },
};

/**
 * Create bookmark tool definition
 */
export const createBookmarkTool: ToolDefinition = {
  name: 'create_bookmark',
  description: 'Create a new bookmark',
  inputSchema: {
    type: 'object',
    properties: {
      link: {
        type: 'string',
        description: 'URL of the bookmark',
      },
      title: {
        type: 'string',
        description: 'Title of the bookmark',
      },
      excerpt: {
        type: 'string',
        description: 'Description or note',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags to categorize the bookmark',
      },
      collectionId: {
        type: 'number',
        description: 'Collection ID (optional, defaults to Unsorted)',
      },
    },
    required: ['link'],
  },
};

/**
 * Update bookmark tool definition
 */
export const updateBookmarkTool: ToolDefinition = {
  name: 'update_bookmark',
  description: 'Update an existing bookmark',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Bookmark ID',
      },
      title: {
        type: 'string',
        description: 'New title',
      },
      excerpt: {
        type: 'string',
        description: 'New description',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'New tags',
      },
      collectionId: {
        type: 'number',
        description: 'Move to this collection',
      },
    },
    required: ['id'],
  },
};

/**
 * Delete bookmark tool definition
 */
export const deleteBookmarkTool: ToolDefinition = {
  name: 'delete_bookmark',
  description: 'Delete a bookmark (moves to trash)',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Bookmark ID to delete',
      },
    },
    required: ['id'],
  },
};
