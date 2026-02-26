import type { PromptDefinition } from '../../../types/prompt.types';

export const augmentSearchQueryPrompt: PromptDefinition = {
  name: 'augment_search_query',
  description:
    'Transform a raw user query into an optimised set of search terms for use with the search_bookmarks tool. Strips filler words, expands abbreviations, and decomposes compound queries into focused terms.',
  arguments: [
    {
      name: 'query',
      description: 'The raw user query as typed',
      required: true,
    },
  ],
};

export const summariseBookmarksPrompt: PromptDefinition = {
  name: 'summarise_bookmarks',
  description:
    'Take a list of bookmark URLs and titles and return structured summaries. Single link gets a rich detailed summary; multiple links (capped at 5) get one concise paragraph each. Fetch failures are noted inline. If the list exceeds 5 links, the user is told upfront and which ones were selected.',
  arguments: [
    {
      name: 'bookmarks',
      description: 'JSON array of { title: string, url: string }',
      required: true,
    },
    {
      name: 'focus',
      description: 'Specific angle or question to focus the summary on',
      required: false,
    },
  ],
};
