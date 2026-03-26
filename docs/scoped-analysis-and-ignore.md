# Scoped Analysis Roots + Ignore Patterns

This repo supports scoped filesystem walks for automated TIED analysis (token discovery, gap reports, and impact preview) so runs only consider the intended roots and skip irrelevant paths.

## Configuration

### Roots: `.tiedanalysis.yaml`
Optional project config file at repo root (cwd-relative unless absolute):

- `roots`: optional array of explicit analysis roots (empty or omitted falls back to defaults)
- `default_roots`: optional array of root kinds:
  - `project_root`: uses `process.cwd()` as the default root
  - `TIED_BASE_PATH`: uses `TIED_BASE_PATH` resolved via MCP server config
- `ignore_file`: ignore patterns file path (default: `.tiedignore`)
- `follow_symlinks`: boolean (default: `false`)
- `token_scan`: optional limits for token scans (`include_extensions`, `max_file_bytes`, `max_files`)
- `traceability_gap`: optional settings for mode `traceability_gap_report` (see below)

Boundary: if an empty root list is provided, analysis falls back to `default_roots`.

### Ignore patterns: `.tiedignore`
Gitignore-style patterns (same syntax family as `.gitignore`) used to exclude paths from analysis filesystem walks.

## Symlink Policy

`follow_symlinks: false` skips:
- symlinked roots (if a root itself is a symlink)
- symlinked entries encountered during traversal

When `follow_symlinks: true`, traversal follows symlinks.

## MCP Tool

Invoke the MCP tool:

- `tied_scoped_analysis_run`

Modes:
- `walk_summary`: roots + skip counts only
- `token_scan`: discover `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]` tokens in eligible files
- `gap_report`: tokens discovered in the walk but missing from `semantic-tokens.yaml` (via `TIED_BASE_PATH`)
- `traceability_gap_report`: three-dimensional traceability vs the scoped walk (same roots/ignore as other modes):
  - **Registry**: same as `gap_report` (`registry_gaps.missing_tokens`)
  - **REQ → tests**: project REQ index entries with no `[REQ-*]` occurrence in files classified as tests
  - **REQ → production**: project REQ index entries with no `[REQ-*]` occurrence in files classified as production (non-test, non-methodology content)
  - **IMPL → tests** (optional): project IMPL index entries with no `[IMPL-*]` in test files; set `dimensions.impl_without_test: true` to enable. Block-level IMPL pseudocode-to-test mapping is not implemented here (may be added later per project rules).
- `impact_preview`: maps discovered tokens to impacted TIED decisions (uses the same scoped walk)

### `traceability_gap` configuration (optional)

Under `.tiedanalysis.yaml`:

- `dimensions.req_without_test` (default `true`): when `false`, skip the REQ→test dimension.
- `dimensions.req_without_implementation` (default `true`): when `false`, skip the REQ→production dimension.
- `dimensions.impl_without_test` (default `false`): when `true`, enable IMPL→test gaps.
- `test_file.path_contains` / `test_file.basename_suffixes`: classify paths as test files (defaults cover common patterns such as `__tests__`, `.test.ts`, `.spec.ts`).
- `methodology_path_markers` (default includes `tied/methodology/`): paths containing these substrings are not counted as production implementation for REQ→production (documentation under methodology is read-only per `[PROC-TIED_METHODOLOGY_READONLY]`).
- `exclude_methodology_only_records` (default `true`): REQ/IMPL tokens that exist only in the methodology index are omitted from gap lists and listed under `methodology_only.requirements_excluded` / `implementation_excluded`.
- `strict` (default `false`): when `true`, `exit_policy.suggested_exit_code` is `1` if any enabled dimension reports a gap.

MCP tool argument `traceability_strict` (optional boolean), when set, overrides `traceability_gap.strict` for the same exit policy.

### CI exit codes

- Default: **`traceability_gap_report.exit_policy.suggested_exit_code` is `0`** unless `strict` is true and there are gaps.
- **`npm run traceability-gap -- --strict`** (from `mcp-server/`): prints the full JSON report and exits with `suggested_exit_code` (non-zero only when strict and at least one dimension gap exists). Registry-only gaps do not change the exit code in this version; enable strict when you want CI to fail on missing REQ↔test or REQ↔production markers. Threshold-based policies may be added later.

## Effective Summary Output

Every run returns:
- `summary.roots_used`: effective analysis roots used for the walk
- `summary.ignore_source`: `file` / `inline` / `file_and_inline` (with `path` when applicable)
- `summary.skipped_paths_count`: count of paths skipped (ignored by patterns and/or skipped symlinks)
- `summary.followed_symlinks`: boolean reflecting symlink policy

