# Using TIED without MCP

TIED is designed for **MCP-based generation and management**: the primary way to work with requirements, architecture, and implementation decisions is via the TIED MCP server (tools and resources). If you do not use MCP, this document describes the standalone workflow.

## Bootstrap

Run from the TIED repository root:

```bash
./bootstrap_without_mcp.sh /path/to/project
```

Or use `./copy_files.sh /path/to/project` — you get the same result. Your project will have a `tied/` directory with:

- YAML indexes: `requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml`
- YAML detail files in `tied/requirements/`, `tied/architecture-decisions/`, `tied/implementation-decisions/`
- Guide documents: `requirements.md`, `architecture-decisions.md`, `implementation-decisions.md`, `commit-guidelines.md`, etc.

## Managing REQ/ARCH/IMPL

- **Indexes**: Add or edit entries in `tied/requirements.yaml`, `tied/architecture-decisions.yaml`, `tied/implementation-decisions.yaml`. Each top-level key is a token (e.g. `REQ-TIED_SETUP`).
- **Detail files**: Add or edit YAML files in `tied/requirements/*.yaml`, `tied/architecture-decisions/*.yaml`, `tied/implementation-decisions/*.yaml`. One token per file; the top-level key must be the token id. Schema: [../detail-files-schema.md](../detail-files-schema.md).
- **Token registry**: Keep `tied/semantic-tokens.yaml` updated when you add or rename tokens so the registry matches what you use in code and docs.

## Code and tests

Use `[REQ-*]`, `[ARCH-*]`, and `[IMPL-*]` in code comments and test names. Follow the traceability chain: requirements → architecture → implementation. See [../ai-principles.md](../ai-principles.md) and [../AGENTS.md](../AGENTS.md) for the full methodology.

## Optional validation

If your project has a token validation script (e.g. `./scripts/validate_tokens.sh`), run it to check that the registry and references are in sync.

## Reference

- Guide docs in your project's `tied/` (e.g. `tied/requirements.md`, `tied/architecture-decisions.md`) explain structure and conventions.
- [../ai-principles.md](../ai-principles.md) and [../AGENTS.md](../AGENTS.md) in the TIED repository describe the methodology in full.
