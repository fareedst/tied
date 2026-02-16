# Monolithic STDD samples for MCP conversion

These files are **sample monolithic** STDD 1.0.0 documents used to demonstrate and test the MCP conversion tools (STDD → TIED).

- **requirements.md** – Requirements with `## [REQ-*]` / `### [REQ-*]` sections
- **architecture-decisions.md** – Architecture decisions with `## N. Title [ARCH-*]` or `## Title [ARCH-*]`
- **implementation-decisions.md** – Implementation decisions with `## N. Title [IMPL-*]`

## Usage

- **Via MCP (Cursor)**: With the tied-yaml MCP server configured, call `convert_monolithic_requirements`, `convert_monolithic_architecture`, `convert_monolithic_implementation` with `file_path` set to these files (e.g. `monolithic-samples/requirements.md`), or use `convert_monolithic_all` with the three paths.
- **Via script**: From repo root run `node scripts/run-convert-stdd-to-tied.mjs` (optional `--dry-run`). Output is written to `tied-converted/`.

Output is written under `output_base_path` (default: `tied` or `TIED_BASE_PATH`). Use `dry_run: true` to preview tokens and paths without writing.
