import type {
  ResourceHandler,
  ResourceContent,
} from '../../../types/resource.types';
import type { RaindropClient } from '../../api/raindrop-client';

/**
 * All bookmarks resource handler
 */
export const allBookmarksHandler: ResourceHandler<RaindropClient> = async (
  uri,
  client,
): Promise<ResourceContent> => {
  const result = await client.getRaindrops(0, { perpage: 50 });

  return {
    uri,
    mimeType: 'application/json',
    text: JSON.stringify(result, null, 2),
  };
};
