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
