import type {
  PromptHandler,
  PromptResponse,
} from '../../../types/prompt.types';
import type { IRaindropClient } from '../../api/raindrop-client.interface';

export const weeklyDigestHandler: PromptHandler<IRaindropClient> = async (
  _name,
  args,
): Promise<PromptResponse> => {
  const { bookmarks: bookmarksRaw, period } = args as {
    bookmarks: string;
    period?: string;
  };

  const periodLabel = period ?? 'this week';
  const bookmarks: Array<{
    title: string;
    url: string;
    collection: string;
    tags: string[];
  }> = JSON.parse(bookmarksRaw);

  const bookmarkList = bookmarks
    .map(
      (b, i) =>
        `${i + 1}. [${b.collection}] "${b.title}" (${b.url})${b.tags.length > 0 ? ` — tags: ${b.tags.join(', ')}` : ''}`,
    )
    .join('\n');

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are helping compile a personal knowledge digest for ${periodLabel}. Write in a warm, conversational tone — this is a personal review, not a formal report.

Structure the digest as follows:
1. **Header**: A short title using the period label (e.g. "Digest — this week")
2. **Grouped sections**: Group bookmarks by collection first, then by inferred topic within each collection if there are multiple. For each group write a 2-3 sentence thematic summary that captures what the group is about and why it's interesting.
3. **Highlights**: End with a "Highlights" section that calls out the 2-3 most interesting or noteworthy items from across all groups, with a single sentence explaining why each stands out.

Bookmarks saved ${periodLabel}:
${bookmarkList}`,
        },
      },
    ],
  };
};

export const detectDuplicatesHandler: PromptHandler<IRaindropClient> = async (
  _name,
  args,
): Promise<PromptResponse> => {
  const { new_bookmark, existing_bookmarks: existingRaw } = args as {
    new_bookmark: string;
    existing_bookmarks: string;
  };

  const existing: Array<{ title: string; url: string; tags: string[] }> =
    JSON.parse(existingRaw);

  const existingList = existing
    .map(
      (b, i) =>
        `${i + 1}. "${b.title}" — ${b.url}${b.tags.length > 0 ? ` [tags: ${b.tags.join(', ')}]` : ''}`,
    )
    .join('\n');

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are a duplicate-detection assistant for a bookmark manager. The user wants to save a new bookmark and you need to check whether it duplicates or closely overlaps with anything they already have.

Classify any matches into exactly one of three tiers:
- **Exact**: Same URL, or clearly the same content published at a different URL (e.g. canonical vs AMP, HTTP vs HTTPS, minor slug change). Issue a strong do-not-save warning.
- **Near duplicate**: Same topic with substantially overlapping content (e.g. two articles covering the same library release, two tutorials teaching the same concept). Suggest the user review the existing bookmark before saving.
- **Related**: Topically similar but distinct enough to be genuinely worth keeping alongside the existing bookmark. Note the relationship but do not block saving.

Return your answer as a JSON array. Each element must have:
- \`title\`: string — title of the matching existing bookmark
- \`url\`: string — URL of the matching existing bookmark
- \`tier\`: "exact" | "near_duplicate" | "related"
- \`reason\`: string — a brief explanation of why this is considered a match and its tier

If no matches are found at any tier, return an empty array \`[]\` and include a short message: "No duplicates found — this bookmark appears to be unique in your collection."

New bookmark to check: "${new_bookmark}"

Existing bookmarks:
${existingList}`,
        },
      },
    ],
  };
};
