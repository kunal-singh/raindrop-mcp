import type { ResourceDefinition } from '../../../types/resource.types.js';

/**
 * All bookmarks resource definition
 */
export const allBookmarksResource: ResourceDefinition = {
  uri: 'raindrop://bookmarks/all',
  name: 'All Bookmarks',
  description: 'All your Raindrop.io bookmarks',
  mimeType: 'application/json',
};
