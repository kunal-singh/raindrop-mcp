import type { ToolHandler } from '../../../types/tool.types';
import type { IRaindropClient } from '../../api/raindrop-client.interface';
import { formatToolResponse } from '../../../lib/response-formatter';

/**
 * Get tags handler
 */
export const getTagsHandler: ToolHandler<IRaindropClient> = async (
  args,
  client,
) => {
  const result = await client.getTags(args.collectionId);
  return formatToolResponse(result);
};
