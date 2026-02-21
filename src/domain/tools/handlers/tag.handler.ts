import type { ToolHandler } from '../../../types/tool.types';
import type { RaindropClient } from '../../api/raindrop-client';
import { formatToolResponse } from '../../../lib/response-formatter';

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
