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

### Path resolution

All path parameters (`requirements_path`, `architecture_path`, `implementation_path`, `output_base_path`, and `file_path` in the single-file conversion tools) are resolved by the Node process: **absolute paths** are used as-is; **relative paths** are resolved relative to the **process current working directory** (typically the workspace root when the MCP server is started by the client). `TIED_BASE_PATH` (and thus the default output when `output_base_path` is omitted) is also cwd-relative unless absolute.

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
| `convert_monolithic_requirements` | Convert STDD 1.0.0 monolithic `requirements.md` to TIED v1.5.0+ `requirements.yaml` + `requirements/REQ-*.md`. Params: `file_path` or `content`, optional `output_base_path`, `dry_run`, `overwrite`. |
| `convert_monolithic_architecture` | Convert monolithic `architecture-decisions.md` to `architecture-decisions.yaml` + `architecture-decisions/ARCH-*.md`. Same params. |
| `convert_monolithic_implementation` | Convert monolithic `implementation-decisions.md` to `implementation-decisions.yaml` + `implementation-decisions/IMPL-*.md`. Same params. |
| `convert_monolithic_all` | Run all three conversions; params: `requirements_path` / `architecture_path` / `implementation_path` and/or `requirements_content` / `architecture_content` / `implementation_content` (content overrides path), `output_base_path`, `dry_run`, `overwrite`, `token_format`. |

### Conversion tools (STDD 1.0.0 → TIED v1.5.0+)

These tools parse **monolithic** requirements and decisions files (single markdown files with all sections inline) and produce:

- A **YAML index** file (e.g. `requirements.yaml`) with one record per token
- **Detail markdown files** (e.g. `requirements/REQ-TIED_SETUP.md`) with standardized headers and migration footnote

**Input**: Either a `file_path` to the monolithic file or raw `content` (markdown string). For `convert_monolithic_all`, you can pass paths and/or raw content per document; when both are set for the same document, content overrides path. Colon-style tokens (`[REQ:*]`, `[ARCH:*]`, `[IMPL:*]`) are accepted by default and normalized to hyphen for output; pass `token_format: "hyphen"` to disable normalization and treat only hyphen-style tokens as valid.

**Output**: Writes under `output_base_path` (default: `tied` or `TIED_BASE_PATH`). Use `dry_run: true` to get a summary and would-be paths without writing. Use `overwrite: false` to skip writing detail files that already exist.

**Example** (dry run): Call `convert_monolithic_requirements` with `content` set to your monolithic requirements markdown and `dry_run: true` to see `tokens`, `index_path`, and `detail_paths`.

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
