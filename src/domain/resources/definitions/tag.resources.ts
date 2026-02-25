import type { ResourceDefinition } from '../../../types/resource.types';

export const tagsResource: ResourceDefinition = {
  uri: 'raindrop://tags',
  name: 'Tags',
  description: 'All your Raindrop.io tags',
  mimeType: 'application/json',
};
