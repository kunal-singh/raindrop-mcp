import type {
  PromptHandler,
  PromptResponse,
} from '../../../types/prompt.types';
import type { IRaindropClient } from '../../api/raindrop-client.interface';

export const matchCollectionHandler: PromptHandler<IRaindropClient> = async (
  _name,
  args,
): Promise<PromptResponse> => {
  const { collection_name, available_collections: collectionsRaw } = args as {
    collection_name: string;
    available_collections: string;
  };

  const collections: Array<{ id: number; title: string }> =
    JSON.parse(collectionsRaw);

  const collectionList = collections
    .map((c) => `  - ID ${c.id}: "${c.title}"`)
    .join('\n');

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are a collection-matching assistant for a bookmark manager. Your task is to match a fuzzy collection name provided by the user to the best match from the available collections list below.

Apply the following three-tier confidence model:

- **High confidence**: One collection is a clear match with no close competitors. Proceed silently — do not ask for confirmation.
- **Medium confidence**: A reasonable match exists but it is not obvious (e.g. partial name overlap, ambiguous abbreviation). Return the match but explicitly flag it for user confirmation before acting.
- **Low confidence**: No good match exists, or two collections are nearly equally plausible. Return the top 2-3 candidates and ask the user to clarify. Never guess.

Return your answer as a JSON object with exactly these fields:
- \`matchedId\`: number | null — the ID of the best-matched collection, or null if confidence is low and no single match can be chosen
- \`matchedTitle\`: string | null — the title of the best-matched collection, or null if confidence is low
- \`confidence\`: "high" | "medium" | "low"
- \`alternatives\`: array of { id: number, title: string } — populated when confidence is medium or low (top candidates); empty array when confidence is high
- \`message\`: string — a human-readable explanation of the match decision

Available collections:
${collectionList}`,
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Match this collection name: "${collection_name}"`,
        },
      },
    ],
  };
};

export const suggestTagsHandler: PromptHandler<IRaindropClient> = async (
  _name,
  args,
): Promise<PromptResponse> => {
  const {
    bookmark_title,
    existing_tags: tagsRaw,
    max_suggestions,
  } = args as {
    bookmark_title: string;
    existing_tags: string;
    max_suggestions?: string;
  };

  const existingTags: string[] = JSON.parse(tagsRaw);
  const maxCount = max_suggestions ? parseInt(max_suggestions, 10) : 5;

  const tagList =
    existingTags.length > 0
      ? existingTags.map((t) => `"${t}"`).join(', ')
      : '(none — this is the first bookmark)';

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are a tagging assistant for a personal bookmark manager. Your goal is to suggest relevant tags for a new bookmark while keeping the tag taxonomy clean.

Rules:
1. Analyse the bookmark title or URL for topics, technologies, domains, and themes.
2. Prefer reusing existing tags over creating new ones — only suggest a new tag when no existing tag covers the concept adequately.
3. Rank suggestions by relevance (most relevant first).
4. The combined total of existing tags matched plus new tags suggested must not exceed ${maxCount}.

Return your answer as a JSON object with exactly these fields:
- \`existingTags\`: string[] — tags selected from the existing list that apply to this bookmark
- \`newTags\`: string[] — new tags worth creating that aren't covered by existing tags

Existing tags: ${tagList}

Bookmark to tag: "${bookmark_title}"`,
        },
      },
    ],
  };
};
