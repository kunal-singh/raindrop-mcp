import type {
  PromptHandler,
  PromptResponse,
} from '../../../types/prompt.types';
import type { IRaindropClient } from '../../api/raindrop-client.interface';

export const augmentSearchQueryHandler: PromptHandler<IRaindropClient> = async (
  _name,
  args,
): Promise<PromptResponse> => {
  const { query } = args as { query: string };

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'Transform user search queries into optimised search terms for a bookmark manager. Strip filler words ("stuff about", "things related to", "the best", "some"), expand common abbreviations (ML → machine learning, AI → artificial intelligence, JS → JavaScript, TS → TypeScript, DX → developer experience, OSS → open source, LLM → large language model, RAG → retrieval augmented generation, NLP → natural language processing), and decompose compound queries into multiple focused terms. Return a JSON array of strings, most specific term first.',
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: 'Understood. I will strip filler words, expand abbreviations, decompose compound queries, and return a JSON array of optimised search strings, most specific first.',
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'Transform this query: "stuff about ML papers"',
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: '["machine learning papers", "machine learning research", "ML arxiv"]',
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'Transform this query: "AI papers for my presentation on transformers"',
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: '["transformer architecture", "attention mechanism", "artificial intelligence papers", "transformer model research"]',
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'Transform this query: "the best JS tools for building stuff"',
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: '["JavaScript build tools", "JavaScript developer tools", "frontend tooling", "JavaScript bundler"]',
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'Transform this query: "things related to RAG and LLM performance"',
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: '["retrieval augmented generation", "large language model performance", "RAG optimization", "LLM latency"]',
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Transform this query: "${query}"`,
        },
      },
    ],
  };
};

export const summariseBookmarksHandler: PromptHandler<IRaindropClient> = async (
  _name,
  args,
): Promise<PromptResponse> => {
  const { bookmarks: bookmarksRaw, focus } = args as {
    bookmarks: string;
    focus?: string;
  };

  const bookmarks: Array<{ title: string; url: string }> =
    JSON.parse(bookmarksRaw);

  const focusInstruction = focus ? ` Focus specifically on: ${focus}.` : '';

  if (bookmarks.length === 1 && bookmarks[0]) {
    const { title, url } = bookmarks[0];
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch the following URL and provide a rich, detailed summary of the content.${focusInstruction}

Your summary should cover:
1. Main argument or purpose of the content
2. Key takeaways (3-5 bullet points)
3. Relevance to the title: "${title}"
4. Any important caveats, limitations, or counterpoints

If you are unable to fetch the URL, summarise from the title alone and explicitly note that the summary is based only on the title due to a fetch failure.

URL: ${url}
Title: ${title}`,
          },
        },
      ],
    };
  }

  const selected = bookmarks.slice(0, 5);

  const bookmarkList = selected
    .map((b, i) => `${i + 1}. "${b.title}" — ${b.url}`)
    .join('\n');

  if (bookmarks.length > 5) {
    const skipped = bookmarks.slice(5);
    const skippedList = skipped.map((b) => `"${b.title}"`).join(', ');

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You provided ${bookmarks.length} bookmarks, but summaries are capped at 5. The following ${skipped.length} bookmark(s) have been omitted: ${skippedList}.

Please fetch each of the 5 selected URLs below and write one focused paragraph per link.${focusInstruction} If a URL fetch fails, note it inline with the reason and summarise from the title alone.

${bookmarkList}`,
          },
        },
      ],
    };
  }

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please fetch each of the following ${selected.length} URLs and write one focused paragraph per link.${focusInstruction} If a fetch fails for a specific URL, note it inline with the reason and summarise from the title alone instead.

${bookmarkList}`,
        },
      },
    ],
  };
};
