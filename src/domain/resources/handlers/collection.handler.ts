import type {
  ResourceHandler,
  ResourceContent,
} from '../../../types/resource.types';
import type { IRaindropClient } from '../../api/raindrop-client.interface';

export const collectionsHandler: ResourceHandler<IRaindropClient> = async (
  uri,
  client,
): Promise<ResourceContent> => {
  const result = await client.getCollections();

  return {
    uri,
    mimeType: 'application/json',
    text: JSON.stringify(result, null, 2),
  };
};
