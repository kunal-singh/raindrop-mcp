import type {
  ResourceHandler,
  ResourceContent,
} from '../../../types/resource.types';
import type { IRaindropClient } from '../../api/raindrop-client.interface';

export const tagsHandler: ResourceHandler<IRaindropClient> = async (
  uri,
  client,
): Promise<ResourceContent> => {
  const result = await client.getTags();

  return {
    uri,
    mimeType: 'application/json',
    text: JSON.stringify(result, null, 2),
  };
};
