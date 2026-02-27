# raindrop-mcp

[![CI](https://github.com/kunal-singh/raindrop-mcp/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kunal-singh/raindrop-mcp/actions/workflows/ci.yml)

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that gives AI assistants full access to your [Raindrop.io](https://raindrop.io) bookmarks — search, save, organise, and summarise, all through natural conversation.

---

## Why raindrop-mcp?

Most Raindrop MCP servers give you raw API access and call it done. This one goes further.

**Prompts** are the standout feature. They teach your AI how to *think* about your bookmarks — not just fetch them. Before searching, the AI rewrites your query into better terms. Before saving, it checks for duplicates and suggests tags that fit your existing taxonomy. It can summarise entire reading lists, match fuzzy collection names, and produce weekly digests — all from plain-language requests.

**Caching** keeps things fast and API-friendly. Collections are cached locally with a TTL, so repeated requests don't hammer the Raindrop API or burn through your rate limits.

---

## Getting started

**Requirements:** Node.js ≥ 22, pnpm (or npm), a Raindrop.io account.

**Get your Raindrop API token:** Log in → [Settings → Integrations → API](https://app.raindrop.io/settings/integrations) → create or copy your token.

**Install:**
```bash
git clone https://github.com/kunal-singh/raindrop-mcp.git
cd raindrop-mcp
pnpm install && pnpm build
```

---

<details>
<summary><strong>Configure your MCP client</strong></summary>

The server communicates over stdio. Point your MCP client at the built binary and pass your token via environment variable.

### Claude Desktop

Edit your config file:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

### Cursor

Add to `.cursor/mcp.json` or Cursor Settings → MCP:

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

### Any other MCP client

| Option | Value |
|--------|-------|
| Command | `node` |
| Args | `/path/to/raindrop-mcp/dist/main.js` |
| Env | `RAINDROP_TOKEN=your-api-token` |

Optional: set `LOG_LEVEL` to `debug`, `info`, or `error` (default: `info`).

</details>

---

## Tools

Direct actions your AI can take on your Raindrop account.

### Bookmarks

| Tool | Parameters |
|------|-----------|
| `search_bookmarks` | `query`, `collectionId`, `sort`, `page`, `perpage` |
| `create_bookmark` | `link` *(required)*, `title`, `excerpt`, `tags`, `collectionId` |
| `update_bookmark` | `id` *(required)*, `title`, `excerpt`, `tags`, `collectionId` |
| `delete_bookmark` | `id` *(required)* |

### Collections

| Tool | Parameters |
|------|-----------|
| `list_collections` | — |
| `create_collection` | `title` *(required)*, `view`, `public` |
| `delete_collection` | `id` *(required)* |

### Tags

| Tool | Parameters |
|------|-----------|
| `get_tags` | `collectionId` |

---

## Resources

The server exposes your Raindrop data as readable resources that the AI can pull in for context:

- **`raindrop://bookmarks/all`** — all your bookmarks
- **Collections** — your collection list (cached, auto-refreshed)
- **Tags** — your full tag taxonomy (cached, auto-refreshed)

---

## Prompts

> This is where raindrop-mcp goes beyond a simple API wrapper.

Prompts are intelligent workflows that guide the AI through multi-step tasks — applying domain logic, transforming inputs, and returning structured outputs. You trigger them with natural language; the AI handles the rest.

---

### `augment_search_query`

Rewrites your rough query into optimised search terms before hitting the API. Strips filler words, expands abbreviations (ML → machine learning, JS → JavaScript), and decomposes compound queries.

**Use it when:** Simple searches are returning poor results.

```
Use augment_search_query for "stuff I saved about making apps faster"
```
```
I'm looking for my notes on distributed systems — augment my query first, then search
```
```
Find "that react hooks thing I bookmarked"
```

---

### `summarise_bookmarks`

Fetches and summarises bookmark content. A single link gets a rich, detailed summary. Multiple links (up to 5) each get a focused paragraph. Fetch failures are noted inline, and if you send more than 5, it tells you which ones it picked.

**Single link:**
```
Summarise this for me: { "title": "Attention Is All You Need", "url": "https://arxiv.org/abs/1706.03762" }
```

**Multiple links:**
```
Search my AI bookmarks in the Machine Learning collection, then summarise the top 5
```
```
Find my bookmarks tagged "system-design" and summarise them, focusing on scalability patterns
```

**Over-limit (tests the cap):**
```
Get all my bookmarks from the Frontend collection and summarise them all
```

---

### `match_collection`

Resolves a fuzzy or informal collection name to the right one. Behaviour scales with confidence — obvious matches proceed silently, uncertain matches get flagged, and ambiguous ones surface the top candidates for you to choose.

| Confidence | Behaviour |
|-----------|-----------|
| High | Proceeds silently — one clear match |
| Medium | Returns match, flags for confirmation |
| Low | Lists 2–3 candidates, asks you to choose |

```
Save https://github.com/vitejs/vite to my JavaScript tools collection
```
```
Save this to my "dev stuff" collection
```
```
Save https://arxiv.org/abs/1706.03762 to my papers folder
```

---

### `suggest_tags`

Looks at your existing tag taxonomy and suggests which tags fit a new bookmark — prioritising reuse over clutter. Only proposes new tags when nothing existing fits.

```
I'm saving https://css-tricks.com/a-guide-to-flexbox/ — suggest tags for it
```
```
Suggest tags for "PostgreSQL indexing strategies for large tables", reuse my existing tags as much as possible
```
```
I'm saving something about "fine-tuning LLMs on custom datasets" — what tags should I use?
```

---

### `weekly_digest`

Groups recently saved bookmarks by collection or topic, writes a short thematic summary per group, and closes with a "Highlights" section for the 2–3 most interesting items.

```
Get all my bookmarks from the last 7 days and give me a weekly digest
```
```
Run weekly_digest on everything I saved this week in my Research and AI collections
```
```
I want a digest of my recent saves for February 2026
```

---

### `detect_duplicates`

Checks whether a URL or topic you're about to save already exists in your bookmarks. Classifies matches as **Exact** (same URL or content), **Near duplicate** (substantially overlapping), or **Related** (topically similar but distinct).

```
Before I save https://martinfowler.com/articles/microservices.html, check if I already have something like it
```
```
I want to bookmark something about "React performance optimisation" — do I already have duplicates?
```
```
Check for duplicates before saving: "Clean Code by Robert Martin summary"
```

---

### Chained workflows

The real power comes from combining prompts in a single request. If a chain breaks, it usually means one prompt's output format doesn't match the next prompt's expected input — a useful signal for debugging.

**Search → Summarise:**
```
Search for my bookmarks about "ML infrastructure", augment the query first, then summarise the top 5 focusing on production deployment
```

**Full save workflow:**
```
I want to save https://roadmap.sh/system-design to my architecture collection — check for duplicates first, suggest tags, then save it if it's not a duplicate and match the collection name
```

**Digest → Analysis:**
```
Give me a digest of everything in my AI collection this week, then tell me what tags are most common across those bookmarks
```

> **Tip:** Verify each prompt in isolation before chaining. If a chain fails, the error will point to which step needs adjustment.

---

## Development

```bash
pnpm install
pnpm dev        # Watch mode
pnpm build      # Production build
pnpm clean      # Remove dist/
pnpm inspect    # Run MCP Inspector for debugging
```

## License

MIT
