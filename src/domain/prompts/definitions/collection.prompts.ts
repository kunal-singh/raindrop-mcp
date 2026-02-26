import type { PromptDefinition } from '../../../types/prompt.types';

export const matchCollectionPrompt: PromptDefinition = {
  name: 'match_collection',
  description:
    'Take a fuzzy collection name and find the best match from available collections. Tiered by confidence: high (one clear match) proceeds silently; medium (reasonable but not obvious match) flags for confirmation; low (no good match or two equally plausible) returns top 2-3 candidates and asks for clarification.',
  arguments: [
    {
      name: 'collection_name',
      description: 'The fuzzy collection name from the user',
      required: true,
    },
    {
      name: 'available_collections',
      description: 'JSON array of { id: number, title: string }',
      required: true,
    },
  ],
};

export const suggestTagsPrompt: PromptDefinition = {
  name: 'suggest_tags',
  description:
    'Take the URL or title of a new bookmark and the existing tag list, and suggest which existing tags apply plus any new tags worth creating. Prioritises reusing existing tags to keep the taxonomy clean. Returns tags ranked by relevance.',
  arguments: [
    {
      name: 'bookmark_title',
      description: 'Title or URL of the bookmark being saved',
      required: true,
    },
    {
      name: 'existing_tags',
      description: 'JSON array of current tag strings',
      required: true,
    },
    {
      name: 'max_suggestions',
      description: 'Maximum tags to suggest, defaults to 5',
      required: false,
    },
  ],
};
