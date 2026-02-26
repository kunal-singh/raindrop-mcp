import type { PromptDefinition } from '../../../types/prompt.types';

export const weeklyDigestPrompt: PromptDefinition = {
  name: 'weekly_digest',
  description:
    'Take a list of recently saved bookmarks and produce a grouped digest organised by collection or topic. Each group gets a short thematic summary. Ends with a "Highlights" section for the 2-3 most interesting items.',
  arguments: [
    {
      name: 'bookmarks',
      description:
        'JSON array of { title: string, url: string, collection: string, tags: string[] }',
      required: true,
    },
    {
      name: 'period',
      description: 'Time period label e.g. "this week", "last 7 days"',
      required: false,
    },
  ],
};

export const detectDuplicatesPrompt: PromptDefinition = {
  name: 'detect_duplicates',
  description:
    'Take a URL or topic the user wants to save and a list of existing bookmarks, and identify likely duplicates or near-duplicates. Returns matches ranked by similarity with a brief explanation. Distinguishes between exact URL matches, same content at a different URL, and topically similar but distinct resources.',
  arguments: [
    {
      name: 'new_bookmark',
      description: 'URL or description of what the user wants to save',
      required: true,
    },
    {
      name: 'existing_bookmarks',
      description:
        'JSON array of { title: string, url: string, tags: string[] }',
      required: true,
    },
  ],
};
