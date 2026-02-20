import type { ToolHandler } from '../../../types/tool.types.js';
import type { RaindropClient } from '../../../api/raindrop-client.js';
import { formatToolResponse } from '../../../lib/response-formatter.js';

/**
 * Get tags handler
 */
export const getTagsHandler: ToolHandler<RaindropClient> = async (
  args,
  client,
) => {
  const result = await client.getTags(args.collectionId);
  return formatToolResponse(result);
};
