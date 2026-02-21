import type { ToolHandler } from '../../../types/tool.types';
import type { RaindropClient } from '../../api/raindrop-client';
import { formatToolResponse } from '../../../lib/response-formatter';

/**
 * List collections handler
 */
export const listCollectionsHandler: ToolHandler<RaindropClient> = async (
  args,
  client,
) => {
  const result = await client.getCollections();
  return formatToolResponse(result);
};

/**
 * Create collection handler
 */
export const createCollectionHandler: ToolHandler<RaindropClient> = async (
  args,
  client,
) => {
  const result = await client.createCollection({
    title: args.title,
    view: args.view,
    public: args.public,
  });
  return formatToolResponse(result);
};

/**
 * Delete collection handler
 */
export const deleteCollectionHandler: ToolHandler<RaindropClient> = async (
  args,
  client,
) => {
  const result = await client.deleteCollection(args.id);
  return formatToolResponse(result);
};
