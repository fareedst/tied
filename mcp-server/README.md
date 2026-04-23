# TIED YAML Index MCP Server

MCP server that exposes **tools** and **resources** for TIED YAML index files: requirements, architecture decisions, implementation decisions, and semantic tokens. Supports traceability queries (requirements ↔ decisions).

## Requirements

- Node.js 18+
- TIED project with YAML indexes (e.g. `tied/requirements.yaml`) or template repo with the same-named files at root (e.g. `requirements.yaml`)

**Template vs MCP:** At repo root the index files (e.g. `requirements.yaml`) are templates; in `tied/` they are the project indexes. The root files are minimal and foundational for non-MCP bootstrap (e.g. `copy_files.sh`). New REQ/ARCH/IMPL records can be added via MCP tools (`yaml_index_insert`, `yaml_detail_create`, `tied_token_create_with_detail`) or by copying the template block at the bottom of each index file or the template detail file (e.g. `requirements/REQ-IDENTIFIER.yaml`).

## Install

Run the install and build **from the TIED repository** (not from inside your project):

```bash
cd mcp-server
npm install
npm run build
```

The MCP server remains in the TIED repo; your project only references it via MCP configuration.

## Tests

Run `npm test` from the `mcp-server` directory. This builds the server and runs unit tests (feedback, yaml-loader, and others) and e2e tests. The e2e suite (`src/e2e/bootstrap-and-load.test.ts`) bootstraps a temp project with `copy_files.sh` and verifies the loader reads requirements and semantic-tokens indexes from the copied `tied/` directory.

## Configuration

- **`TIED_BASE_PATH`** (env): Directory containing the YAML index files. Defaults to `tied`. Resolved relative to the process working directory. For a template-only repo with files at project root, set to `.` or the repo root path.

### Path resolution

Path parameters on tools that accept file paths are resolved by the Node process: **absolute paths** are used as-is; **relative paths** are resolved relative to the **process current working directory** (typically the workspace root when the MCP server is started by the client). `TIED_BASE_PATH` is cwd-relative unless absolute.

## Tools

**Merge semantics:** `yaml_index_update` and `yaml_detail_update` merge each update into the existing row or detail record. Top-level scalars and **arrays** are replaced by the value in `updates`. Nested objects **`metadata`**, **`traceability`**, **`related_requirements`**, **`related_decisions`**, **`rationale`**, and **`implementation_approach`** are merged **one level** with the existing object (partial `metadata` no longer drops `metadata.created`). When **`metadata.last_updated`** or **`metadata.last_validated`** is an object on **both** sides, sub-keys merge one level (e.g. partial `reason` preserves `date` / `author`). Use **`impl_detail_set_essence_pseudocode`** for IMPL-only `essence_pseudocode` edits.

**`implementation_approach.details`:** Because `implementation_approach` merges one level, sending `implementation_approach: { details: [...] }` **replaces the entire `details` array**. Either send the **full** list every time (same as `cross_references`) or use **`yaml_detail_append_implementation_approach_details`** to append lines without dropping prior bullets. If your project duplicates `implementation_approach` on both the **index** row and the **detail** file, update both consistently.

**CLI / long sequences:** Each `tied-cli.sh` call is one MCP `tools/call`—prefer small JSON payloads, use `impl_detail_set_essence_pseudocode` for large IMPL pseudo-code, run **`tied_validate_consistency` once** after a batch of updates, and use **`yaml_updates_apply`** (optional `dry_run: true`) to preview or apply ordered steps in one server process.

**`tied-cli.sh` env limits:** The repo’s **`tied-cli.sh`** companion (`.cursor/skills/tied-yaml/scripts/`) passes tool arguments via a **temp file** (`TIED_CLI_ARGS_FILE`) whenever they are not exactly `{}`, so large **`tied_token_create_with_detail`** payloads are not subject to OS **`execve` environment size caps**. The stdio client builds JSON-RPC with **`JSON.stringify`**. Prefer **`@/path/to.json`** for the largest payloads.

| Tool | Purpose |
|------|---------|
| `yaml_index_read` | Read entire index or a single record; params: `index` (requirements \| architecture \| implementation \| semantic-tokens), optional `token`. **Index rows do not include `essence_pseudocode`;** use `yaml_detail_read` for IMPL pseudo-code bodies. |
| `yaml_index_list_tokens` | List all tokens in an index; optional `type` filter (REQ \| ARCH \| IMPL \| PROC) for semantic-tokens |
| `yaml_index_filter` | Filter records by field value; params: `index`, `field`, `value` |
| `yaml_index_validate` | Validate YAML syntax of all index files |
| `tied_validate_consistency` | Validate TIED index and detail consistency: token existence, REQ→ARCH→IMPL traceability, detail file content, IMPL `essence_pseudocode` token refs. Non-empty `essence_pseudocode` without any [REQ-]/[ARCH-]/[IMPL-] token comments is reported as `pseudocode[token].missing_token_comments` and fails the report ([PROC-IMPL_PSEUDOCODE_TOKENS]). Params: optional `include_detail_files` (default true), `include_pseudocode` (default true), `require_detail_record` (default true). Returns: `index`, `index_tokens`, `token_references`, `traceability`, `detail_files`, `pseudocode`, `ok`. Run before marking work complete. |
| `tied_config_get_base_path` | Return the effective TIED base path (resolved from TIED_BASE_PATH env or default `tied`) and the raw env value |
| `get_decisions_for_requirement` | Given a requirement token (e.g. REQ-TIED_SETUP), return all ARCH and IMPL that reference it |
| `get_requirements_for_decision` | Given a decision token (ARCH-X or IMPL-X), return all REQ it references (and full requirement records) |
| `yaml_index_insert` | Insert a new record; params: `index`, `token`, `record` (JSON string). Writes to the index file (e.g. `tied/requirements.yaml`). Fails if token already exists. |
| `yaml_index_update` | Update an existing record; merges `updates` into the token row (see merge semantics above). Params: `index`, `token`, `updates` (JSON string). Fails if token does not exist. |
| `yaml_updates_apply` | Ordered batch of detail/index merges in one process (same merge rules). Params: `steps` (array of detail steps with `kind`, `token`, `updates` object, or index steps with `kind`, `index`, `token`, `updates`), optional `dry_run` (previews `merged_preview` per step, no writes), optional `run_validate_consistency` (default true on write path: runs `tied_validate_consistency` after all steps; writes are not rolled back if validation fails). |
| `yaml_detail_read` | Read a single detail file by token (REQ-*, ARCH-*, or IMPL-*). Resolves path from index `detail_file` when present (hybrid .md/.yaml). Params: `token`. Returns the detail record; for .md returns `{ _raw_markdown, _format: "markdown" }`. Fails if token invalid or file missing. |
| `yaml_detail_read_many` | Read details for multiple tokens or all tokens of a type. Params: `tokens` (array, optional) and/or `type` (requirement \| architecture \| implementation). If only `type` is passed, returns all details for that type. Output: object keyed by token, value is detail record or `{ error: string }`. |
| `yaml_detail_list` | List tokens that have a detail file (from index `detail_file` and from .yaml/.md in the detail directory). Params: `type` (requirement \| architecture \| implementation). |
| `yaml_detail_create` | Create a new detail YAML file. Params: `token`, `record` (JSON string), optional `sync_index` (default true). Fails if file exists or token invalid. |
| `yaml_detail_update` | Update an existing detail file; merges `updates` into the REQ/ARCH/IMPL record (see merge semantics above). Params: `token`, `updates` (JSON string). Fails if no file. |
| `impl_detail_set_essence_pseudocode` | IMPL-* only: set `essence_pseudocode` and optionally `metadata.last_updated` without touching other detail fields. Params: `token`, `essence_pseudocode`, optional `metadata_last_updated` object (`date`, `author`, `reason`). |
| `yaml_detail_append_implementation_approach_details` | REQ-*, ARCH-*, or IMPL-* detail: append strings to `implementation_approach.details` without replacing the whole array. Params: `token`, `details_lines` (array of strings). |
| `citdp_record_write` | Write or replace a CITDP record YAML under `tied/citdp/` (e.g. `CITDP-REQ-FOO.yaml`). Params: `filename` (basename only, must match `CITDP-*.yaml`), `record` (JSON string of the **inner** document object, i.e. the value under the top-level key), optional `top_level_key` (default: stem without `.yaml`). Creates `citdp/` if missing. |
| `tied_verify` | After tests: set passed REQs to `Implemented` and passed IMPLs to `Active`. Defaults **do not** demote other tokens (`set_unpassed_*_to_planned` default false). Params: `passed_requirement_tokens`, `passed_impl_tokens`, optional booleans, optional **`dry_run`** (returns `would_update` without writing; omits tokens whose status would not change—empty list means a no-op write). |
| `yaml_detail_delete` | Delete a detail YAML file. Params: `token`, optional `sync_index` (default true to clear detail_file in index). |
| `tied_token_create_with_detail` | Create a new REQ, ARCH, or IMPL token with both index record and detail YAML in one step. Params: `token`, `index_record` (JSON string), `detail_record` (JSON string), optional `upsert_index` (default false). Sets `detail_file` on the index automatically. Fails if detail file already exists. |
| `tied_token_rename` | Rename a single semantic token across the TIED tree. Replaces the token in YAML indexes (semantic-tokens, requirements, architecture, implementation), detail files (keys, values, list items), and renames the detail file when present. Params: `old_token`, `new_token` (same prefix required), optional `dry_run` (list would-be changes), `include_markdown` (also replace in tied/processes.md). The implementation validates and pretty-prints modified YAML with `yq -i -P` when yq is available (one invocation per file; never pass multiple paths to a single `yq -i -P` command). Agents editing YAML by hand should use the global `lint_yaml` function per `processes.md` `[PROC-YAML_EDIT_LOOP]`. Returns `ok`, `files_modified`, `file_renamed`, `errors`. |
| `tied_import_summary` | Import/inspect an existing TIED directory: read YAML indexes and report tokens plus detail file presence (hybrid .md and .yaml). Params: optional `base_path`. Use to validate a reference TIED layout. |
| `tied_feedback_add` | Add a feedback entry (feature request, bug report, or methodology improvement). Creates or appends to `tied/feedback.yaml`. Params: `type` (feature_request \| bug_report \| methodology_improvement), `title`, `description`, optional `context` (JSON string), `include_report_snippet` (default true), optional `base_path`. Returns `ok`, `id`, `created_at`, and optionally `report_snippet` (markdown for pasting into a TIED issue). |
| `tied_feedback_export` | Export all feedback entries for reporting to the TIED project. Params: `format` (markdown \| json), optional `base_path`. Returns a string suitable for copy-paste into an issue or report. |
| `requirement_list_state_guide` | Client-supplied requirement list walk. First call: non-empty `requirements`; later: `current_state` = `continuation_state`. Returns one requirement object per step until **`id: end_requirement_list`**. For each item, use the agent REQ checklist (e.g. `tied/docs/agent-req-implementation-checklist.md`). See [tied/docs/requirement-list-state-guide-agent-workflow.md](../tied/docs/requirement-list-state-guide-agent-workflow.md). |

### Token rename

Use **`tied_token_rename`** to rename a semantic token everywhere: YAML indexes, detail files (keys, values, list items), and the detail filename. Same prefix is required (e.g. REQ-X → REQ-Y). Use `dry_run: true` to list files that would change; optional `include_markdown` updates `tied/processes.md`. The tool validates and pretty-prints with `yq -i -P` when yq is available (one `yq` process per modified file). For manual YAML edits, use `lint_yaml` per `processes.md` `[PROC-YAML_EDIT_LOOP]`.

### Feedback (report to TIED)

Projects and users can submit **feature requests**, **bug reports**, and **methodology improvement** suggestions via the feedback tools. Feedback is stored in `tied/feedback.yaml` under your project's TIED base path (versioned with the project). Use **`tied_feedback_add`** to add an entry and **`tied_feedback_export`** to produce markdown or JSON you can paste into a GitHub issue (or send to the TIED project) to report what would improve the TIED methodology. Each entry has an `id`, `type`, `title`, `description`, optional `context`, and `created_at`. See [REQ-FEEDBACK_TO_TIED], [ARCH-FEEDBACK_STORAGE], [IMPL-MCP_FEEDBACK_TOOLS].

### Hybrid layout (detail .md and .yaml)

When an index record has `detail_file` set (e.g. `requirements/REQ-URL_TAGS_DISPLAY.md` or `requirements/REQ-CODE_QUALITY.yaml`), the detail loader resolves that path first. If the file is **.md**, `yaml_detail_read` and detail resources return `{ _raw_markdown, _format: "markdown" }` (**read-only** through MCP; `yaml_detail_update` does not overwrite markdown). Listing includes tokens from the index and from the filesystem (both `.yaml` and `.md` in the detail directories). New and ongoing work should use **YAML** detail files (`yaml_detail_create`, `tied_token_create_with_detail`, or hand-authored YAML per `detail-files-schema.md`).

## Resources

Read-only resources (e.g. for LLM context). Detail files may be YAML or Markdown (hybrid layout); the loader uses the index `detail_file` when present and returns `_raw_markdown` for .md files.

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

**Enable in Cursor (recommended):** From the **client project** root, run `agent enable tied-yaml`. When Cursor prompts you to apply the project MCP configuration, **approve** the update. Type **`quit`** to exit the interactive `agent` session. (The file on disk alone does not always enable the server in the IDE until you do this.)

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

For a full example process of adding the TIED MCP to a project and invoking it in several passes (setup, bootstrap, establish REQ/ARCH/IMPL, maintain), see [tied/docs/adding-tied-mcp-and-invoking-passes.md](../tied/docs/adding-tied-mcp-and-invoking-passes.md).

## Run locally

```bash
# From mcp-server directory; uses parent dir for templates if TIED_BASE_PATH not set
TIED_BASE_PATH=.. node dist/index.js
```

The server uses stdio transport; it is intended to be started by an MCP client (e.g. Cursor), not run interactively.
