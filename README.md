# raindrop-mcp

[![CI](https://github.com/kunal-singh/raindrop-mcp/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kunal-singh/raindrop-mcp/actions/workflows/ci.yml)

A Model Context Protocol (MCP) server for [Raindrop.io](https://raindrop.io), giving AI assistants the ability to search, create, update, and manage your Raindrop bookmarks and collections.

## Requirements

- **Node.js** ≥ 22.0.0
- **pnpm** (recommended) or npm
- A [Raindrop.io](https://raindrop.io) account and API token

## Getting Your Raindrop API Token

1. Log in to [Raindrop.io](https://raindrop.io)
2. Go to [Integration → API](https://app.raindrop.io/settings/integrations)
3. Create a new token or copy your existing one

## Installation

```bash
git clone https://github.com/kunal-singh/raindrop-mcp.git
cd raindrop-mcp
pnpm install
pnpm build
```

## Configure Your MCP Client

The server speaks MCP over stdio. Add it to your client by pointing to the built binary and passing `RAINDROP_TOKEN` in the environment.

### Claude Desktop

Add this to your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "raindrop": {
      "command": "/path/to/node",
      "args": ["/path/to/raindrop-mcp/dist/main.js"],
      "env": {
        "RAINDROP_TOKEN": "your-raindrop-api-token"
      }
    }
  }
}
```

Replace:

- `/path/to/node` with your Node.js binary (e.g. `~/.nvm/versions/node/v22.15.0/bin/node` or `node`)
- `/path/to/raindrop-mcp` with the actual path to this repo
- `your-raindrop-api-token` with your Raindrop API token

### Cursor

Add this to Cursor's MCP settings (e.g. `.cursor/mcp.json` or Cursor Settings → MCP):

```json
{
  "mcpServers": {
    "raindrop": {
      "command": "node",
      "args": ["/path/to/raindrop-mcp/dist/main.js"],
      "env": {
        "RAINDROP_TOKEN": "your-raindrop-api-token"
      }
    }
  }
}
```

### Generic MCP Clients

Any MCP client that supports stdio can use:

| Option  | Value                                    |
| ------- | ---------------------------------------- |
| Command | `node` (or full path to Node binary)     |
| Args    | `["/path/to/raindrop-mcp/dist/main.js"]` |
| Env     | `RAINDROP_TOKEN=your-api-token`          |

Optional env vars:

- `LOG_LEVEL` — `debug`, `info`, or `error` (default: `info`)

## Available Tools

### Bookmarks

| Tool               | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| `search_bookmarks` | Search bookmarks with optional filters (query, collection, sort, pagination) |
| `create_bookmark`  | Create a new bookmark with URL, title, excerpt, tags, and collection         |
| `update_bookmark`  | Update an existing bookmark by ID                                            |
| `delete_bookmark`  | Delete a bookmark (moves to trash)                                           |

**`search_bookmarks` parameters:**

- `query` (string, optional) — Search text
- `collectionId` (number, optional) — Collection to search in (0 = all, default: 0)
- `sort` — `created`, `-created`, `title`, `-title`, `domain`, `-domain`
- `page` (number) — Page index (0-based)
- `perpage` (number) — Results per page (max 50)

**`create_bookmark` parameters:**

- `link` (required) — URL of the bookmark
- `title` (string, optional) — Title
- `excerpt` (string, optional) — Description or note
- `tags` (string[], optional) — Tags
- `collectionId` (number, optional) — Collection ID (defaults to Unsorted)

**`update_bookmark` parameters:**

- `id` (required) — Bookmark ID
- `title`, `excerpt`, `tags`, `collectionId` (optional) — New values

**`delete_bookmark` parameters:**

- `id` (required) — Bookmark ID to delete

### Collections

| Tool                | Description               |
| ------------------- | ------------------------- |
| `list_collections`  | List all collections      |
| `create_collection` | Create a new collection   |
| `delete_collection` | Delete a collection by ID |

**`create_collection` parameters:**

- `title` (required) — Collection name
- `view` (optional) — `list`, `simple`, `grid`, or `masonry`
- `public` (boolean, optional) — Make collection public

**`delete_collection` parameters:**

- `id` (required) — Collection ID to delete

### Tags

| Tool       | Description                                     |
| ---------- | ----------------------------------------------- |
| `get_tags` | Get all tags, optionally filtered by collection |

**`get_tags` parameters:**

- `collectionId` (number, optional) — Restrict to a collection

## Resources

| Resource URI               | Description                        |
| -------------------------- | ---------------------------------- |
| `raindrop://bookmarks/all` | All your Raindrop bookmarks (JSON) |

## Prompts

Prompts are structured templates that guide the AI to perform specific tasks with your bookmarks. Use them when a simple tool call isn't enough — they teach the model how to transform inputs, apply domain logic, and return well-structured outputs.

### `augment_search_query`

**When to use:** Before calling `search_bookmarks` when a simple search is returning poor results. Transforms raw queries into optimised search terms by stripping filler words, expanding abbreviations (ML → machine learning, JS → JavaScript, etc.), and decomposing compound queries.

```
Use the augment_search_query prompt with query "stuff I saved about making apps faster"
```

```
Use augment_search_query for "that react hooks thing I bookmarked"
```

```
I'm looking for my notes on distributed systems, use augment_search_query first then search
```

### `summarise_bookmarks`

Takes a list of bookmark URLs and titles and returns structured summaries. Single link gets a rich detailed summary; multiple links (capped at 5) get one concise paragraph each. Fetch failures are noted inline. If the list exceeds 5 links, you're told upfront which ones were selected.

**Single link:**

```
Summarise this bookmark for me: { "title": "Attention Is All You Need", "url": "https://arxiv.org/abs/1706.03762" }
```

```
Use summarise_bookmarks on my top result from searching "transformer architecture", focus on practical applications
```

**Multiple links:**

```
Search for my AI bookmarks in the Machine Learning collection, then summarise the top 5
```

```
Find my bookmarks tagged "system-design" and give me a summarise_bookmarks on them, I want to focus on scalability patterns
```

**Over-limit scenario (tests the cap behaviour):**

```
Get all my bookmarks from the Frontend collection and summarise them all
```

This should trigger the 5-link cap message and tell you which ones were selected.

### `match_collection`

Takes a fuzzy collection name and finds the best match from your collections. Behaviour is tiered by confidence:

- **High confidence** — One clear match, no close competitors: proceeds silently
- **Medium confidence** — Reasonable match but not obvious: returns match but flags for confirmation
- **Low confidence** — No good match or two equally plausible: returns top 2–3 candidates and asks you to choose

**High confidence (should proceed silently):**

```
Save https://github.com/vitejs/vite to my JavaScript tools collection
```

If you only have one collection with JavaScript-related content, this should match without asking.

**Medium confidence (should confirm):**

```
Save this to my "dev stuff" collection
```

Intentionally vague — should match something reasonable but flag it.

**Low confidence (should ask):**

```
Save https://arxiv.org/abs/1706.03762 to my papers folder
```

If you have both "Research Papers" and "AI Papers" collections, this should surface both and ask you to choose.

### `suggest_tags`

Suggests which existing tags apply to a new bookmark plus any new tags worth creating. Prioritises reusing existing tags to keep your taxonomy clean.

```
I'm saving https://css-tricks.com/snippets/css/a-guide-to-flexbox/, suggest tags for it
```

```
Suggest tags for a bookmark titled "PostgreSQL indexing strategies for large tables" — I want to reuse my existing tags as much as possible
```

```
I'm saving a new bookmark about "fine-tuning LLMs on custom datasets", what tags should I use?
```

### `weekly_digest`

Produces a grouped digest of recently saved bookmarks, organised by collection or topic. Each group gets a short thematic summary; ends with a "Highlights" section for the 2–3 most interesting items.

```
Get all my bookmarks from the last 7 days and give me a weekly digest
```

```
Run weekly_digest on everything I saved this week in my Research and AI collections
```

```
I want a digest of my recent saves, period is "February 2026"
```

### `detect_duplicates`

Checks whether a URL or topic you want to save duplicates or closely overlaps with existing bookmarks. Classifies matches as **Exact** (same URL/content), **Near duplicate** (substantially overlapping), or **Related** (topically similar but distinct).

```
Before I save https://martinfowler.com/articles/microservices.html, check if I already have something like it
```

```
I want to bookmark something about "React performance optimisation", do I already have duplicates?
```

```
Check for duplicates before saving this: "Clean Code by Robert Martin summary"
```

### Chained workflows

These combine multiple prompts in a single request — the most powerful usage pattern. If chained workflows break, it often indicates a misalignment between one prompt's output format and the next prompt's expected input.

```
Search for my bookmarks about "ML infrastructure", augment the query first, then summarise the top 5 results focusing on production deployment
```

Chains `augment_search_query` → `search_bookmarks` → `summarise_bookmarks`.

```
I want to save https://roadmap.sh/system-design to my architecture collection — check for duplicates first, suggest tags, then save it if it's not a duplicate and match the collection name
```

Chains `detect_duplicates` → `suggest_tags` → `match_collection` → `create_bookmark`.

```
Give me a digest of everything in my AI collection this week, then tell me what tags are most common across those bookmarks
```

Chains `weekly_digest` → `suggest_tags` in analytical mode.

**Tip:** Verify each prompt works in isolation before trying chained workflows. If a chain breaks, it will tell you which prompt's output format needs adjustment.

## Development

```bash
pnpm install
pnpm dev          # Watch mode
pnpm build        # Production build
pnpm clean        # Remove dist/
pnpm inspect      # Run MCP inspector for debugging
```

## License

MIT
