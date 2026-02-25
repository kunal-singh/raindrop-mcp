import type { ResourceDefinition } from '../../../types/resource.types';

export const collectionsResource: ResourceDefinition = {
  uri: 'raindrop://collections',
  name: 'Collections',
  description: 'All your Raindrop.io collections',
  mimeType: 'application/json',
};
