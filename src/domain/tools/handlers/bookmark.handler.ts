import type { ToolHandler } from '../../types/tool.types.js';
import type { RaindropClient } from '../../api/raindrop-client.js';
import { formatToolResponse } from '../../lib/response-formatter.js';

/**
 * Search bookmarks handler
 */
export const searchBookmarksHandler: ToolHandler<RaindropClient> = async (
  args,
  client,
) => {
  const result = await client.getRaindrops(args.collectionId || 0, {
    search: args.query,
    sort: args.sort,
    page: args.page,
    perpage: args.perpage,
  });
  return formatToolResponse(result);
};

/**
 * Create bookmark handler
 */
export const createBookmarkHandler: ToolHandler<RaindropClient> = async (
  args,
  client,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { link: args.link };
  if (args.title) data.title = args.title;
  if (args.excerpt) data.excerpt = args.excerpt;
  if (args.tags) data.tags = args.tags;
  if (args.collectionId) data.collection = { $id: args.collectionId };

  const result = await client.createRaindrop(data);
  return formatToolResponse(result);
};

/**
 * Update bookmark handler
 */
export const updateBookmarkHandler: ToolHandler<RaindropClient> = async (
  args,
  client,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (args.title) data.title = args.title;
  if (args.excerpt) data.excerpt = args.excerpt;
  if (args.tags) data.tags = args.tags;
  if (args.collectionId) data.collection = { $id: args.collectionId };

  const result = await client.updateRaindrop(args.id, data);
  return formatToolResponse(result);
};

/**
 * Delete bookmark handler
 */
export const deleteBookmarkHandler: ToolHandler<RaindropClient> = async (
  args,
  client,
) => {
  const result = await client.deleteRaindrop(args.id);
  return formatToolResponse(result);
};
