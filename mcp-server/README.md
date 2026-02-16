# TIED YAML Index MCP Server

MCP server that exposes **tools** and **resources** for TIED YAML index files: requirements, architecture decisions, implementation decisions, and semantic tokens. Supports traceability queries (requirements ↔ decisions).

## Requirements

- Node.js 18+
- TIED project with YAML indexes (e.g. `tied/requirements.yaml`) or template repo with `*.template.yaml` at root

## Install

```bash
cd mcp-server
npm install
npm run build
```

## Configuration

- **`TIED_BASE_PATH`** (env): Directory containing the YAML index files. Defaults to `tied`. Resolved relative to the process working directory. For a template-only repo with files at project root, set to `.` or the repo root path.

## Tools

| Tool | Purpose |
|------|---------|
| `yaml_index_read` | Read entire index or a single record; params: `index` (requirements \| architecture \| implementation \| semantic-tokens), optional `token` |
| `yaml_index_list_tokens` | List all tokens in an index; optional `type` filter (REQ \| ARCH \| IMPL \| PROC) for semantic-tokens |
| `yaml_index_filter` | Filter records by field value; params: `index`, `field`, `value` |
| `yaml_index_validate` | Validate YAML syntax of all index files |
| `get_decisions_for_requirement` | Given a requirement token (e.g. REQ-TIED_SETUP), return all ARCH and IMPL that reference it |
| `get_requirements_for_decision` | Given a decision token (ARCH-X or IMPL-X), return all REQ it references (and full requirement records) |
| `yaml_index_insert` | Insert a new record; params: `index`, `token`, `record` (JSON string). Writes to the index file (e.g. `tied/requirements.yaml`). Fails if token already exists. |
| `yaml_index_update` | Update an existing record by merging top-level fields; params: `index`, `token`, `updates` (JSON string). Fails if token does not exist. |

## Resources

Read-only resources (e.g. for LLM context):

- `tied://requirements` — full requirements.yaml
- `tied://architecture-decisions` — full architecture-decisions.yaml
- `tied://implementation-decisions` — full implementation-decisions.yaml
- `tied://semantic-tokens` — full semantic-tokens.yaml
- `tied://requirement/{token}` — single requirement record (e.g. REQ-TIED_SETUP)
- `tied://decision/{token}` — single ARCH or IMPL record

## Cursor Integration

Add the server to Cursor MCP settings (e.g. in Cursor Settings → MCP, or your MCP config file):

```json
{
  "mcpServers": {
    "tied-yaml": {
      "command": "node",
      "args": ["/path/to/stdd/mcp-server/dist/index.js"],
      "env": {
        "TIED_BASE_PATH": "/path/to/your/project/tied"
      }
    }
  }
}
```

For a project that uses a `tied/` directory: set `TIED_BASE_PATH` to that directory (or leave unset to use default `tied` relative to the workspace). The server is typically run with the workspace root as the current working directory.

For this template repo (YAML at repo root), use:

```json
"env": {
  "TIED_BASE_PATH": "/path/to/stdd"
}
```

Replace `/path/to/stdd` and `/path/to/your/project/tied` with your actual paths.

## Run locally

```bash
# From mcp-server directory; uses parent dir for templates if TIED_BASE_PATH not set
TIED_BASE_PATH=.. node dist/index.js
```

The server uses stdio transport; it is intended to be started by an MCP client (e.g. Cursor), not run interactively.
