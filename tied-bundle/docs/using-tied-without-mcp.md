# Using TIED without MCP

TIED is designed for **MCP-based generation and management**: the primary way to work with requirements, architecture, and implementation decisions is via the TIED MCP server (tools and resources). If you do not use MCP, this document describes the standalone workflow.

## Bootstrap

Run from your project root:

**Unix / Git Bash:**

```bash
./bootstrap_without_mcp.sh /path/to/project
```

Or use `./tied-install.sh /path/to/project` — you get the same result.

**Windows (Node 18+ required):**

```cmd
bootstrap_without_mcp.cmd
```

Or from a neighboring TIED checkout (PATHEXT resolves `copy_files` to `tied-install.cmd`):

```cmd
..\tied\copy_files
```

Both entry points delegate to the shared Node engine at `tools/bootstrap/copy-files.mjs`. Build the MCP server first: `cd mcp-server && npm install && npm run build`.

Your project will have a `tied-project/` directory with:

- **Methodology** (read-only): `tied-bundle/` contains index YAMLs and inherited detail files from TIED. Do not edit these; they are overwritten when you re-run `tied-install.sh` to refresh the methodology.
- **Project** (your data): `tied-project/requirements.yaml`, `tied-project/architecture-decisions.yaml`, `tied-project/implementation-decisions.yaml`, `tied-project/semantic-tokens.yaml`, and `tied-project/requirements/`, `tied-project/architecture-decisions/`, `tied-project/implementation-decisions/` hold only your project's tokens. These are never overwritten by `tied-install.sh`.
- **Guide and schema documents** (methodology help): `tied-bundle/docs/requirements.md`, `tied-bundle/docs/architecture-decisions.md`, `tied-bundle/docs/implementation-decisions.md`, `tied-bundle/docs/processes.md`, `tied-bundle/docs/semantic-tokens.md`, `tied-bundle/docs/detail-files-schema.md`, and related files under `tied-bundle/docs/`. `tied-install.sh` copies the canonical set from the TIED source tree’s `tied-bundle/docs/` into the client.

## Managing REQ/ARCH/IMPL

Add or edit entries **only in project YAML**, not in methodology YAML. Methodology YAML under `tied-bundle/` is read-only and is refreshed by re-running `tied-install.sh` from the TIED repo; it does not hold client-specific data.

- **Indexes**: Add or edit entries in **project** index files: `tied-project/requirements.yaml`, `tied-project/architecture-decisions.yaml`, `tied-project/implementation-decisions.yaml`. Each top-level key is a token (e.g. `REQ-TIED_SETUP`). Do not edit `tied-bundle/*.yaml`.
- **Detail files**: Add or edit YAML files in `tied-project/requirements/*.yaml`, `tied-project/architecture-decisions/*.yaml`, `tied-project/implementation-decisions/*.yaml`. One token per file; the top-level key must be the token id. Schema: [detail-files-schema.md](detail-files-schema.md).
- **Token registry**: Keep **project** `tied-project/semantic-tokens.yaml` updated when you add or rename tokens so the registry matches what you use in code and docs.

## Code and tests

Use `[REQ-*]`, `[ARCH-*]`, and `[IMPL-*]` in code comments and test names. Follow the traceability chain: requirements → architecture → implementation. See [ai-principles.md](./ai-principles.md) and [../../AGENTS.md](../../AGENTS.md) for the full methodology (`tied-bundle/docs/` and project root).

## Optional validation

If your project has a token validation script (e.g. `./scripts/validate_tokens.sh`), run it to check that the registry and references are in sync.

## Reference

- Guide docs in your project's `tied/` (e.g. `tied-bundle/docs/requirements.md`, `tied-bundle/docs/architecture-decisions.md`) explain structure and conventions.
- [ai-principles.md](./ai-principles.md) (under `tied-bundle/docs/`) and [AGENTS.md](../../AGENTS.md) at project root describe the methodology in full.
