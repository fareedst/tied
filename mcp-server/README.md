# TIED YAML Index MCP Server

MCP server that exposes **tools** and **resources** for TIED YAML index files: requirements, architecture decisions, implementation decisions, and semantic tokens. Supports traceability queries (requirements ↔ decisions).

## Requirements

- Node.js 18+
- TIED project with YAML indexes (e.g. `tied/requirements.yaml`) or template repo with `*.template.yaml` at root

**Template vs MCP:** The root `*.template.yaml` files are minimal and foundational for non-MCP bootstrap (e.g. `copy_files.sh`). New REQ/ARCH/IMPL records can be added via MCP tools (`yaml_index_insert`, `yaml_detail_create`, conversion tools) or by copying the template block at the bottom of each index file or the template detail file (e.g. `requirements.template/REQ-IDENTIFIER.yaml`).

## Install

Run the install and build **from the TIED repository** (not from inside your project):

```bash
cd mcp-server
npm install
npm run build
```

The MCP server remains in the TIED repo; your project only references it via MCP configuration.

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
| `yaml_detail_read` | Read a single detail YAML file by token (REQ-*, ARCH-*, or IMPL-*). Params: `token`. Returns the detail record. Fails if token invalid or file missing. |
| `yaml_detail_read_many` | Read details for multiple tokens or all tokens of a type. Params: `tokens` (array, optional) and/or `type` (requirement \| architecture \| implementation). If only `type` is passed, returns all details for that type. Output: object keyed by token, value is detail record or `{ error: string }`. |
| `yaml_detail_list` | List tokens that have a detail YAML file. Params: `type` (requirement \| architecture \| implementation). |
| `yaml_detail_create` | Create a new detail YAML file. Params: `token`, `record` (JSON string), optional `sync_index` (default true). Fails if file exists or token invalid. |
| `yaml_detail_update` | Update an existing detail file by merging top-level fields. Params: `token`, `updates` (JSON string). Fails if no file. |
| `yaml_detail_delete` | Delete a detail YAML file. Params: `token`, optional `sync_index` (default true to clear detail_file in index). |
| `tied_token_create_with_detail` | Create a new REQ, ARCH, or IMPL token with both index record and detail YAML in one step. Params: `token`, `index_record` (JSON string), `detail_record` (JSON string), optional `upsert_index` (default false). Sets `detail_file` on the index automatically. Fails if detail file already exists. |
| `convert_monolithic_requirements` | Convert STDD 1.0.0 monolithic `requirements.md` to TIED v1.5.0+ `requirements.yaml` + `requirements/REQ-*.yaml`. Params: `file_path` or `content`, optional `output_base_path`, `dry_run`, `overwrite`. |
| `convert_monolithic_architecture` | Convert monolithic `architecture-decisions.md` to `architecture-decisions.yaml` + `architecture-decisions/ARCH-*.yaml`. Same params. |
| `convert_monolithic_implementation` | Convert monolithic `implementation-decisions.md` to `implementation-decisions.yaml` + `implementation-decisions/IMPL-*.yaml`. Same params. |
| `convert_monolithic_all` | Run all three conversions; params: `requirements_path` / `architecture_path` / `implementation_path` and/or `requirements_content` / `architecture_content` / `implementation_content` (content overrides path), `output_base_path`, `dry_run`, `overwrite`, `token_format`. |

### Conversion tools (STDD 1.0.0 → TIED v1.5.0+)

These tools parse **monolithic** requirements and decisions files (single markdown files with all sections inline) and produce:

- A **YAML index** file (e.g. `requirements.yaml`) with one record per token
- **Detail YAML files** (e.g. `requirements/REQ-TIED_SETUP.yaml`) per token; schema in `detail-files-schema.md`

**Input**: Either a `file_path` to the monolithic file or raw `content` (markdown string). For `convert_monolithic_all`, you can pass paths and/or raw content per document; when both are set for the same document, content overrides path. Colon-style tokens (`[REQ:*]`, `[ARCH:*]`, `[IMPL:*]`) are accepted by default and normalized to hyphen for output; pass `token_format: "hyphen"` to disable normalization and treat only hyphen-style tokens as valid.

**Output**: Writes under `output_base_path` (default: `tied` or `TIED_BASE_PATH`). Use `dry_run: true` to get a summary and would-be paths without writing. Use `overwrite: false` to skip writing detail files that already exist.

**Example** (dry run): Call `convert_monolithic_requirements` with `content` set to your monolithic requirements markdown and `dry_run: true` to see `tokens`, `index_path`, and `detail_paths`.

**Run conversion from CLI** (without MCP): This repo includes sample monolithic files in `monolithic-samples/` and a script to run the same conversion logic from the command line. From repo root: `node scripts/run-convert-stdd-to-tied.mjs` (optional `--dry-run`). Output is written to `tied-converted/`. After conversion, update `semantic-tokens.yaml` (or `semantic-tokens.template.yaml`) with any new tokens and keep guide docs in sync with the templates.

## Resources

Read-only resources (e.g. for LLM context). Detail files are YAML under `requirements/`, `architecture-decisions/`, and `implementation-decisions/`; these tools and resources operate on that YAML.

- `tied://requirements` — full requirements.yaml
- `tied://architecture-decisions` — full architecture-decisions.yaml
- `tied://implementation-decisions` — full implementation-decisions.yaml
- `tied://semantic-tokens` — full semantic-tokens.yaml
- `tied://requirement/{token}` — single requirement record (e.g. REQ-TIED_SETUP)
- `tied://decision/{token}` — single ARCH or IMPL record
- `tied://requirement/{token}/detail` — full detail YAML content for a requirement (REQ-*)
- `tied://decision/{token}/detail` — full detail YAML content for an architecture or implementation decision (ARCH-* or IMPL-*)
- `tied://details/requirements` — all requirement detail records (token → detail object)
- `tied://details/architecture` — all architecture decision detail records
- `tied://details/implementation` — all implementation decision detail records

## Cursor Integration

Configure MCP in your **development project** (the project where you ran `copy_files.sh` and have a `tied/` directory). Use your project's MCP config (e.g. `.cursor/mcp.json` in the project, or Cursor Settings → MCP with that project as the workspace).

- **args**: Must be the **absolute path to the TIED repo's** `mcp-server/dist/index.js` (e.g. `/path/to/tied/mcp-server/dist/index.js`), not a path inside your project.
- **TIED_BASE_PATH**: Must be your **project's** tied directory — absolute path (e.g. `/path/to/your/project/tied`) or relative to the workspace root (e.g. `tied` or `./tied` when your project root is the workspace).

```json
{
  "mcpServers": {
    "tied-yaml": {
      "command": "node",
      "args": ["/path/to/tied/mcp-server/dist/index.js"],
      "env": {
        "TIED_BASE_PATH": "/path/to/your/project/tied"
      }
    }
  }
}
```

**Example:** TIED repo at `~/repos/tied`, development project at `~/projects/myapp`. Use `args`: `["/Users/you/repos/tied/mcp-server/dist/index.js"]` and `TIED_BASE_PATH`: `/Users/you/projects/myapp/tied` (or `tied` if the workspace is `myapp` and you use a relative path).

Replace `/path/to/tied` and `/path/to/your/project/tied` with your actual paths.

For a full example process of adding the TIED MCP to a project and invoking it in several passes (setup, bootstrap, establish REQ/ARCH/IMPL, maintain), see [docs/adding-tied-mcp-and-invoking-passes.md](../docs/adding-tied-mcp-and-invoking-passes.md).

## Run locally

```bash
# From mcp-server directory; uses parent dir for templates if TIED_BASE_PATH not set
TIED_BASE_PATH=.. node dist/index.js
```

The server uses stdio transport; it is intended to be started by an MCP client (e.g. Cursor), not run interactively.
