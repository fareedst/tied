# TIED Methodology Changelog

All notable changes to the TIED (Token-Integrated Engineering & Development) methodology will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **MCP tool `tied_token_rename`** — Rename a single semantic token across the TIED tree (YAML indexes, detail files, and detail file name). Params: `old_token`, `new_token` (same prefix required), optional `dry_run`, `include_markdown` (tied/processes.md). Modified YAML is pretty-printed with `yq -i -P` when available. Returns `ok`, `files_modified`, `file_renamed`, `errors`. mcp-server: new module `token-rename.ts` (`renameSemanticToken`); unit tests `token-rename.test.ts`; test script updated to run token-rename tests.
- **`[PROC-TIED_FIRST_IMPLEMENTATION]` TIED-first implementation procedure** — When REQ/ARCH/IMPL are already authored or updated in TIED and tests/code are pending, agents follow a variant of the agent checklist: S02–S03 define change and impact from the **updated** TIED (desired = new design, current = prior tests/code); S04–S06 are verify-only (completeness and IMPL block token comments); S07–S16 unchanged. New document `docs/tied-first-implementation-procedure.md` with entry-point semantics, step modifiers, strict TDD from new IMPL, three-way alignment and LEAP, and flow diagram. Registered in `processes.md` and `semantic-tokens.yaml`. Agent checklist updated with new entry point "TIED prepared; tests/code not updated" and mandatory order (IMPL pseudo-code → RED tests → code).
- **MCP write tools: JSON or YAML input** — `yaml_index_insert`, `yaml_index_update`, `yaml_detail_create`, `yaml_detail_update`, and `tied_token_create_with_detail` now accept **JSON or YAML** strings for record/updates/detail_record/index_record. New module `parse-content.ts` (`parseRecordOrYaml`: try JSON then YAML; reject null/array/primitive). Unit tests in `parse-content.test.ts`.
- **Safe YAML emission for TIED writes** — New module `yaml-dump.ts` (`safeDump` with `forceQuotes: true`, `quotingType: '"'`) so string values containing `:` (e.g. in satisfaction criteria) are double-quoted and parse correctly. All TIED YAML writes in the MCP server (yaml-loader, detail-loader, feedback, convert runner and detail-markdown-to-yaml) now use `safeDump` instead of `yaml.dump`.
- **LEAP (Logic Elevation And Propagation)** `[PROC-LEAP]` — Canonical process in `tied/processes.md`: when code or tests diverge from IMPL, update the stack in reverse order (IMPL → ARCH → REQ) in the same work item; work may start at any layer but must apply up and down the stack for completion. Code is valid only when all tests pass and all requirements are met. README: new "LEAP (for non-programmers)" and "TIED traceability walkthrough" (R/A/I chain, pseudo-code block example, how TIED with LEAP develops tests/code/E2E and closes the loop).
- **IMPL pseudo-code token comments (most critical)** `[PROC-IMPL_PSEUDOCODE_TOKENS]` — Every block in IMPL `essence_pseudocode` must have a comment naming REQ/ARCH/IMPL and how the block implements them; top-level and sub-block rules documented in AGENTS.md, ai-principles.md, implementation-decisions.md, and processes.md. Registered in `semantic-tokens.yaml`.
- **Client inheritance of LEAP R+A+I** — All TIED projects inherit a core set of REQ/ARCH/IMPL and PROC tokens via `copy_files.sh` from `templates/` (methodology-enforcing tokens and detail files). Agents refer to `templates/` in the TIED repo for structure and sample records; same filename at repo root (template) vs `tied/` (project index). `copy_files.sh`: index YAMLs and detail dirs copied from `templates/` when present, else repo root; guide `.md` files always from root.
- **Inherited tokens documentation** — `processes.md`: new "Inherited tokens (TIED/LEAP methodology)" subsection; `semantic-tokens.md`: new "Inherited tokens" section listing REQ/ARCH/IMPL/PROC inherited set and reference to `templates/`.
- **Consistency validation: missing IMPL token comments** — `tied_validate_consistency` now reports `missing_token_comments` when IMPL `essence_pseudocode` is non-empty but contains no [REQ-]/[ARCH-]/[IMPL-] token comments, and fails the report (`[PROC-IMPL_PSEUDOCODE_TOKENS]`). MCP server: `consistency-validator.ts` and tool description updated; docs (adding-tied-mcp, mcp-server/README) updated.
- **TIED.md** — "Costs and Trade-offs"; "Documentation Structure in TIED Projects"; "Bugs vs Requirements: How to Think About Them"; "Configuring AI Agents (for project maintainers)". ai-principles.md reference updated.
- **docs/ai-agent-tied-mcp-usage.md** — New "1.1 YAML detail storage, MCP, and cognitive load" (rationale for working from IMPL pseudo-code vs scanning source).
- **E2E test** — `bootstrap-and-load.test.ts` asserts inherited token `REQ-MODULE_VALIDATION`; comments updated for core methodology (inherited LEAP R+A+I).
- **Unified agent requirement implementation checklist** (`[PROC-AGENT_REQ_CHECKLIST]`) — Primary step-by-step procedure for every new REQ or change to the tested system. Document: `docs/agent-req-implementation-checklist.md`. Unifies CITDP, TIED dev cycle, IMPL_CODE_TEST_SYNC, LEAP, and validation into one executable checklist with entry points (new requirement, change, TIED-prepared implementation pending, bug fix) and variant for TIED-first implementation. AGENTS.md, ai-principles.md, processes.md (PROC-TIED_DEV_CYCLE, PROC-CITDP, PROC-IMPL_CODE_TEST_SYNC), docs/impl-code-test-linkage.md, docs/implementation-order.md, and docs/new-feature-process.md updated to reference it.
- **scripts/extract_queries.rb** — Extracts `<user_query>` bodies from YAML (e.g. agent transcripts), deduplicates, and prints one query per line.

### Changed

- **AGENTS.md** — TIED data access (MCP-first): added that writing TIED YAML via MCP ensures valid output (e.g. values with `:` quoted); direct file edits often produce invalid YAML.
- **docs/agent-req-implementation-checklist.md** — Mandatory order line (IMPL pseudo-code → RED tests → code); new entry point "TIED prepared; tests/code not updated" and variant subsection linking to `docs/tied-first-implementation-procedure.md` (`[PROC-TIED_FIRST_IMPLEMENTATION]`).
- **docs/ai-agent-tied-mcp-usage.md** — Added guidance to avoid direct edits to `tied/**/*.yaml` for writes; use MCP write tools so the server emits valid YAML.
- **MCP tool descriptions** — Read/write tool descriptions updated to mention using MCP for TIED updates (valid YAML) and to state that record/updates parameters accept "JSON or YAML" where applicable.
- **AGENTS.md** — Methodology background pointer (TIED.md, docs/LEAP.md); bootstrap includes `implementation-decisions.md` and [PROC-IMPL_PSEUDOCODE_TOKENS]; new Core TIED Obligations: IMPL pseudo-code token comments, LEAP, implementation order (tests first, code via TDD, glue, E2E, closing the loop); TIED data access reworded to "MCP-first" with MCP usage guidance; Client inheritance of LEAP R+A+I and `templates/`; checklists updated (IMPL block comments, LEAP reverse-order update); Key Files table (templates/, processes.md row); removed separate docs/ai-agent-tied-mcp-usage.md row. Last Updated 2026-03-05.
- **README.md** — `copy_files.sh` step describes core methodology (inherited LEAP R+A+I) from `templates/`; Example Workflow condensed to capture intent → design → review → implement (tests first, TDD, glue, E2E, close loop) → close the loop; references to docs/new-feature-process.md and AGENTS.md; prepare_readme_demo.sh and Query Examples wording; Methodology Documentation list (docs/LEAP.md, docs/implementation-order.md, ai-principles.md); removed "Visual Guides" section (new-requirement-timeline, traceability-graph, task-token-alignment).
- **ai-principles.md** — Title "AI Agent Principles & Operations"; purpose and methodology background pointer to TIED.md; structure condensed (Core Principles, Change Impact Tracking, Development Process, Work Planning, Checklist, Related Documents, Critical Reminders); IMPL pseudo-code token comments and LEAP/MCP/TIED data access integrated; long Documentation Structure, Semantic Token System, and Bugs vs Requirements sections replaced with shorter operational rule; Critical Reminders add [PROC-IMPL_PSEUDOCODE_TOKENS]. Last Updated 2026-03-05.
- **processes.md** — PROC-TIED_DEV_CYCLE expanded to 10 steps: tests-first, Author TIED docs ([PROC-IMPL_PSEUDOCODE_TOKENS]), Add and align tests, Implement to tests (TDD), Implement minimal glue, Add E2E tests, Validate and close test gaps, Sync TIED, Update README/CHANGELOG, Write commit message; mandatory implementation order (tests first → TDD → glue → E2E → validate/sync) stated explicitly.
- **docs/new-feature-process.md** — Flow diagram renumbered (Implement via TDD, glue, E2E, validate, sync, release); E2E as required step after glue; phase table and governing process updated for 10-step PROC-TIED_DEV_CYCLE; reference to `tied/processes.md` for agent-executable procedure.
- **Template file naming** — Removed `.template` infix from TIED template files; same filename is used at repo root (template) and in `tied/` (project index). Location distinguishes use.
  - Renamed: `requirements.template.md` → `requirements.md`, `requirements.template.yaml` → `requirements.yaml`, and similarly for `architecture-decisions`, `implementation-decisions`, `processes`, `semantic-tokens`, `tasks` (`.md` and `.yaml` where applicable).
  - **copy_files.sh**: Copies root files into `tied/` with the same filename (no suffix stripping). Detail-file examples are copied from repo-root `requirements/`, `architecture-decisions/`, and `implementation-decisions/` (no `.template` suffix).
  - **mcp-server/src/yaml-loader.ts**: Resolves index path as `{basePath}/{index}.yaml` then `cwd/{index}.yaml`; removed `TEMPLATE_FILES` fallbacks.
  - **Docs**: README, AGENTS.md, ai-principles.md, TIED.md, ANNOUNCEMENT.md, migrate-*.md, and mcp-server references updated to the new names and location semantics.
  - **mcp-server**: Added `yaml-loader.test.ts` (unit tests for `getBasePath` and `resolveIndexPath` preferring base then cwd); exported `clearBasePathCache()` for tests. `copy_files.sh`: hooks copy is conditional on source existing so bootstrap works without `.cursor/hooks.json`.
  - **mcp-server**: E2E tests in `src/e2e/bootstrap-and-load.test.ts` — run `copy_files.sh` into a temp dir, set `TIED_BASE_PATH` to `tied/`, then assert the loader reads `requirements` and `semantic-tokens` indexes from the copied files. Included in `npm test`.
- **AGENTS.md** — Implementation order expanded to 6 steps (unit tests, unit code via TDD, composition tests, composition code via TDD, E2E with justification, closing the loop); `[PROC-YAML_EDIT_LOOP]` added to MCP usage and checklists; language-specific lint gate checklist item added during/after work.
- **ai-principles.md** — Principle 9 (Separation of Concerns): E2E-only reworded; event bindings composition-testable. Principle 11: entry-point wiring composition-tested. Phase 3 mandatory order: 6 steps with lint gates. YAML edit loop in change-impact checklist.
- **processes.md** — `[PROC-TEST_STRATEGY]`: new composition-tests-cover-bindings principle; E2E-only requires named platform constraint. `[PROC-YAML_DB_OPERATIONS]`: `[PROC-YAML_EDIT_LOOP]` subsection (controlling loop for YAML create/edit/validate/use). `[PROC-TIED_DEV_CYCLE]`: 11 steps; steps 3–7 governed by TDD inner loop (RED-GREEN-REFACTOR with lint gate); unit vs. composition distinction; E2E requires justification; managed vs. unmanaged code scope.
- **semantic-tokens.md** — Minor formatting fix.
- **processes.md** — CITDP procedure document reference updated from `docs/CITDP-v1.0.0.md` to `docs/agent-req-implementation-checklist.md` (`[PROC-AGENT_REQ_CHECKLIST]`).

### Added

- **MCP feedback tools** ([REQ-FEEDBACK_TO_TIED], [ARCH-FEEDBACK_STORAGE], [IMPL-MCP_FEEDBACK_TOOLS]) — Projects and users can submit feature requests, bug reports, and methodology improvement suggestions and export them for reporting to the TIED project.
  - **`tied_feedback_add`**: Add a feedback entry (type: feature_request | bug_report | methodology_improvement) with title, description, optional context. Creates or appends to `tied/feedback.yaml`. Returns ok, id, created_at, and optionally a copy-paste-ready markdown snippet for a TIED issue.
  - **`tied_feedback_export`**: Export all feedback entries as markdown or JSON for copy-paste into an issue or report.
  - **Storage**: Single file `{TIED_BASE_PATH}/feedback.yaml` with top-level `entries` array; each entry has id, type, title, description, optional context, created_at (ISO 8601).
  - **TIED docs**: New requirement REQ-FEEDBACK_TO_TIED, architecture decision ARCH-FEEDBACK_STORAGE, implementation decision IMPL-MCP_FEEDBACK_TOOLS with detail files and essence_pseudocode; tokens registered in semantic-tokens.yaml and index files.
  - **mcp-server**: New module `src/feedback.ts` (load/append/export) and unit tests `src/feedback.test.ts`; tool descriptors in `mcp-server/tool-descriptors/`.
  - **Docs**: mcp-server/README.md updated with feedback tools table and "Feedback (report to TIED)" subsection; main README MCP API line updated.

- **New feature process (`[PROC-NEW_FEATURE]`)** — Top-level procedure for implementing a new feature from a user prompt.
  - **docs/new-feature-process.md**: Flow diagram (user prompt → commit), governing process and tied-yaml MCP usage, step-by-step procedure aligned with PROC-TIED_DEV_CYCLE, and post-implementation steps (sync REQ/ARCH/IMPL, unit/e2e tests, README/CHANGELOG, commit). Direct YAML edits must be documented and validated with `yq -i -P`.
  - **tied/processes.md**: New section `[PROC-NEW_FEATURE]` referencing the full procedure and diagram.
  - **tied/semantic-tokens.yaml**: Registered `PROC-NEW_FEATURE`.
  - **CONTRIBUTING.md**: Commit message guidelines (one session commit; reference main REQ/ARCH/IMPL tokens).

- **Test strategy and E2E-only minimization** ([PROC-TEST_STRATEGY], [REQ-MODULE_VALIDATION])
  - **processes.template.md**: New process `[PROC-TEST_STRATEGY]` — Test strategy and coverage (minimize untested code). Principles: E2E is expensive; unit + integration cover logic; IMPL–test alignment; coverage gates; minimize E2E-only code. Activities: run coverage and coverage-gap report; document E2E-only IMPLs with `e2e_only_reason` or `test_coverage_note`.
  - **processes.template.md**: New process `[PROC-TIED_DEV_CYCLE]` — TIED development cycle (session workflow). Nine steps: Plan from TIED; Author TIED docs (pseudo-code + tokens); Add and align tests; Implement to tests (TDD); Implement minimal glue; Validate and close test gaps; Sync TIED to code and tests; Update README and CHANGELOG; Write commit message. Supports traceability and token audit/validation.
  - **implementation-decisions.template.md**: Optional IMPL schema fields `testability` (`unit` | `integration` | `e2e_only`) and `e2e_only_reason` (required when `testability` is `e2e_only`). New section **Testability classification and E2E-only code**: classify code paths, document E2E-only reasons, entry-point logic must be extracted or justified. Traceability-to-tests bullet: optional block comments for test level (e.g. `# unit-testable:`, `# E2E-only:`).
  - **requirements.template.md**: New principle **Testability and E2E-only minimization** — minimize code only measurable from E2E/manual testing; logic in testable modules unless justified; references [REQ-MODULE_VALIDATION] and [PROC-TEST_STRATEGY].
  - **semantic-tokens.template.yaml**: Registered `PROC-TEST_STRATEGY` and `PROC-TIED_DEV_CYCLE`.
  - **README.md**: Key Principles §6 for test strategy and E2E minimization; processes.template.md description updated to list new process tokens.

- **IMPL pseudo-code as source of consistent logic** — Documentation and implementation-decision template now treat IMPL `essence_pseudocode` as the **authoritative source of consistent logic** for implementation; logical and flow issues must be resolved there before writing tests or code.
  - **AGENTS.md**: Under Documentation-First Flow, added that all implementation issues (logical and flow) are addressed in IMPL pseudo-code before tests or code; `essence_pseudocode` is the source of consistent logic.
  - **ai-principles.md**: Stated that IMPL pseudo-code is where logical/flow issues are resolved before tests or code; added to session acknowledgment and Pseudo-Code section that issues must be resolved in IMPL pseudo-code first.
  - **implementation-decisions.template.md**:
    - Intro and **Mandatory essence_pseudocode** section: every IMPL detail file must include `essence_pseudocode`; use for collision detection, Algol-style notation, one action per step, traceability to tests.
    - **Preferred vocabulary for essence_pseudocode**: INPUT, OUTPUT, DATA, CONTROL, ON/WHEN, SEND/BROADCAST/RETURN, IF/ELSE, UPPER_SNAKE procedure names, FOR/WHILE, error/failure patterns, AWAIT/Promise for async.
    - **Expressing sequence and structure**: numbered steps, contract block (Contract:, INPUT/OUTPUT/DATA/CONTROL).
    - **Template and stub pseudo-code**: when status is Template use a stub; when Active, pseudo-code must be complete.
    - **Managed code and block token rules**: REQ/ARCH/IMPL token comments in blocks of managed code (including pseudo-code in TIED detail YAML); block and nested-block rules, selective token naming.
    - **Minimal example** of `essence_pseudocode` with token comment, contract, procedure, and preferred keywords.
    - **Collision detection using essence_pseudocode**: process for comparing IMPL pseudo-code when IMPLs are composed or share code paths; checklist table for key composition pairs (e.g. IMPL-STORAGE_INDEX, IMPL-BOOKMARK_ROUTER, IMPL-MESSAGE_HANDLING, IMPL-BADGE_REFRESH, IMPL-FILE_STORAGE_*, IMPL-CONFIG_*).
  - Schema reference for `essence_pseudocode` updated to point to the new mandatory and vocabulary sections.

- **MCP tool `tied_config_get_base_path`**: Reports the effective TIED base path (resolved from `TIED_BASE_PATH` or default `tied`) and the raw env value. Use to verify server configuration or debug path resolution. Documented in `mcp-server/README.md` and MCP setup docs.

- **AI agent directive for TIED data access** (`docs/ai-agent-tied-mcp-usage.md`): Instructs AI agents to use the TIED MCP server as the **primary** interface for reading and writing TIED data; direct file access is permitted only when no MCP tool supports the operation (such cases are candidates for new tools). Document also states that TIED is the db that controls/directs the build—significant code is created in TIED first, then implemented with TDD. Referenced from `AGENTS.md` (Core TIED Obligations and Key Files).

- **Validation for TIED data**: Documented for both AI agents and users:
  - **`yaml_index_validate`** (MCP): Validates YAML syntax of all index files under `TIED_BASE_PATH`; run after index edits to ensure parseability.
  - **Token validation**: Use project scripts (e.g. `./scripts/validate_tokens.sh`) together with `yaml_index_validate` for full data validation (syntax + token registry and traceability) before considering a pass complete. README and [docs/adding-tied-mcp-and-invoking-passes.md](docs/adding-tied-mcp-and-invoking-passes.md) updated to describe this workflow.

- **YAML detail files for REQ, ARCH, and IMPL** [TIED spec update]: Individual token detail files are now YAML (replacing Markdown) so transformations (validation, merge, report generation, MCP tools) can operate on them.
  - **Schema**: New `detail-files-schema.md` describes the YAML structure for `requirements/REQ-*.yaml`, `architecture-decisions/ARCH-*.yaml`, and `implementation-decisions/IMPL-*.yaml` (one token per file, top-level key = token id; fields aligned with index for merge/validation).
  - **Templates**: Added YAML detail files in `requirements.template/` (REQ-TIED_SETUP, REQ-MODULE_VALIDATION, REQ-IDENTIFIER), `architecture-decisions.template/` (ARCH-TIED_STRUCTURE, ARCH-MODULE_VALIDATION, ARCH-EXAMPLE_DECISION), `implementation-decisions.template/` (IMPL-TIED_FILES, IMPL-MODULE_VALIDATION).
  - **Indexes**: All `detail_file` paths in `requirements.template.yaml`, `architecture-decisions.template.yaml`, `implementation-decisions.template.yaml`, and `semantic-tokens.template.yaml` now reference `.yaml` (e.g. `requirements/REQ-TIED_SETUP.yaml`).
  - **Docs**: AGENTS.md Key Files table and ai-principles.md Related Documents updated to describe detail files as YAML and to reference `detail-files-schema.md`; processes.template.md and guide templates (requirements, architecture-decisions, implementation-decisions) use `.yaml` in examples.
  - **Bootstrap**: `copy_files.sh` copies `*.yaml` detail files from template directories into `tied/` and copies `detail-files-schema.md` into `tied/` when present.
  - **Legacy**: Existing `.md` detail files in template directories are unchanged and can remain for reference; indexes and scripts now treat YAML as the canonical detail format.

- **TIED YAML MCP Server** (`mcp-server/`): Model Context Protocol server for programmatic access to TIED YAML indexes
  - **Tools**: Read, list tokens, filter by field, validate YAML; traceability tools `get_decisions_for_requirement` and `get_requirements_for_decision`; write tools `yaml_index_insert`, `yaml_index_update`
  - **Resources**: Read-only URIs for full indexes (`tied://requirements`, `tied://architecture-decisions`, `tied://implementation-decisions`, `tied://semantic-tokens`) and single records (`tied://requirement/{token}`, `tied://decision/{token}`)
  - **Configuration**: `TIED_BASE_PATH` environment variable for index location; supports `tied/` layout and template-only repos
  - **Cursor**: Documented MCP config for Cursor IDE in `mcp-server/README.md`

- **MCP Server: REQ/ARCH/IMPL detail access and create-with-detail**
  - **Batch detail read**: New tool `yaml_detail_read_many` — request details by token list and/or by type (requirement | architecture | implementation); returns a map of token → detail record or `{ error }`.
  - **Create token with details**: New tool `tied_token_create_with_detail` — create a new REQ, ARCH, or IMPL in one call: writes index record (with `detail_file`) and detail YAML file; optional `upsert_index` to merge into existing index.
  - **Resources**: New read-only URIs for all details by type: `tied://details/requirements`, `tied://details/architecture`, `tied://details/implementation` (each returns token → detail object).
  - **Docs**: `mcp-server/README.md` updated with new tools and resources; conversion section now refers to detail YAML (not markdown).

- **MCP Server: Hybrid layout (detail .md and .yaml)** — support for reference-style TIED projects where index `detail_file` points to either `.md` or `.yaml` per token
  - **Detail path resolution**: Loader resolves path from index `detail_file` when present; falls back to `{subdir}/{token}.yaml` then `{subdir}/{token}.md` so hybrid layouts work without changing indexes.
  - **Markdown detail reading**: For `.md` detail files, `loadDetail()` returns `{ _raw_markdown, _format: "markdown" }`; tools and resources expose this so MCP can read reference projects that keep some tokens in Markdown.
  - **Listing**: `listDetailTokens(type)` now includes tokens from the index (where `detail_file` is set) and from the filesystem (both `.yaml` and `.md` in the detail directory).
  - **Update guard**: `yaml_detail_update` returns an error when the detail file is Markdown (edit `.md` files directly).
  - **Import/inspect tool**: New tool `tied_import_summary` — optional `base_path`; reads requirements/architecture/implementation YAML indexes and reports token counts and which `detail_file` paths exist (for validating or inspecting an existing TIED directory).
  - **Docs**: `mcp-server/README.md` updated with “Hybrid layout” section and `tied_import_summary`; detail read/list descriptions updated.

- **`[PROC-CITDP]` Change Impact and Test Design Procedure** — 8-step procedure for analyzing, planning, testing, and implementing behavior changes; integrates with `[PROC-TIED_DEV_CYCLE]`, `[PROC-LEAP]`, `[PROC-TEST_STRATEGY]`, `[PROC-YAML_EDIT_LOOP]`; produces YAML analysis record. Defined in `processes.md`.

- **`[PROC-IMPL_CODE_TEST_SYNC]` IMPL-to-Code-and-Tests Linkage** — 33-step checklist (9 phases A-I) for discovering, analyzing, documenting, and synchronizing IMPL pseudo-code with managed code and tests; enforces three-way alignment (pseudo-code / tests / code) from unit TDD through composition and E2E. Defined in `processes.md`; registered in `semantic-tokens.yaml`.

- **`[PROC-SWIFT_BUILD]` Swift Build and Validation Process** — Build, test, run, and validation commands for Swift applications; lint/type-check gate for `[PROC-TIED_DEV_CYCLE]` inner loop. Defined in `processes.md`; registered in `semantic-tokens.yaml`.

- **`[PROC-YAML_EDIT_LOOP]`** — Controlling loop for creating or editing TIED YAML: edit, validate with `yq -i -P`, use only after validation passes. Defined in `processes.md` under `[PROC-YAML_DB_OPERATIONS]`.

- **docs/impl-code-test-linkage.md** — Practical guide for three-way alignment (IMPL pseudo-code / tests / code); 9 phases with worked examples, LEAP micro-cycle, and process diagram. Process token: `[PROC-IMPL_CODE_TEST_SYNC]`.

- **docs/methodology-diagrams.md** — 6 mermaid diagrams covering TIED traceability stack with LEAP propagation, three development phases, PROC-TIED_DEV_CYCLE session workflow, TDD inner loop (RED-GREEN-REFACTOR), CITDP procedure, and YAML edit loop.

### Changed

- **Monolithic-to-TIED conversion (REQ, ARCH, IMPL)** – improved migration in `mcp-server/src/convert/` for lossless conversion from STDD-style monolithic markdown to TIED YAML indexes and detail files:
  - **Requirements**
    - Section regex allows optional numbering (e.g. `### 2. [REQ-...]`); end-of-string lookahead fixed so section bodies are no longer truncated at newlines.
    - "Next bold label" parsing: each labeled field’s value runs until the next `**Label**`/`**Label**:`, preserving multi-line Satisfaction Criteria, Validation Criteria, and Implementation Notes.
    - Same-line values (e.g. `**Priority: P0 (Critical)**`) and rest-of-line values (e.g. `**Description**: text`) both captured; backtick-only lines (e.g. `` `[PROC:TOKEN_AUDIT]`: ``) not treated as field values.
    - Trailing colon stripped from normalized keys so `**Rationale:**` maps to `rationale`.
    - Detail files: Implementation Notes section when present; "Original section (from monolithic source)" collapsible block with full body for fidelity.
    - YAML records: optional `implementation_notes` when present.
  - **Architecture**
    - Section regex allows decimal numbering (e.g. `## 4.1`, `## 14.1.`); optional `[REQ-*]`/`[IMPL-*]` after `[ARCH-*]`.
    - `### Decision: ...` block extracted; then "next bold label" parsing for Rationale, Alternatives Considered, Implementation (and Implementation Plan), Token Coverage, Implementation Status.
    - Detail files: Status from parsed content; Token Coverage section from source when present; "Original section" block; Alternatives Considered shows "—" when empty.
    - Fallback regex uses `(?![\s\S])` for end-of-string.
    - YAML records: `token_coverage` and status from source when present.
  - **Implementation**
    - Section regex allows `N.`, `2a.`, `8.1.`-style numbering; header may contain `[ARCH-*]` `[REQ-*]` `[IMPL-*]` refs.
    - `### Decision: ...` and `### Implementation Approach: ...` blocks extracted; "next bold label" parsing for Rationale, Code Markers, Token Coverage, Validation Evidence, Implementation Details.
    - Detail files: Decision, Rationale, Implementation Approach, Implementation Details, Code Markers, Token Coverage, Validation Evidence; Status from source; "Original section" block.
    - YAML records: `token_coverage`, `code_markers`, `validation_evidence`; `implementation_approach.details` from Implementation Details; status and decision used when present.
  - **Shared**
    - Colon-style tokens (`[REQ:*]`, `[ARCH:*]`, `[IMPL:*]`) normalized to hyphen before parsing when `token_format` is `"both"` or `"colon"`.
    - REQ, ARCH, and IMPL conversions now use the same parsing and fidelity patterns so all captured info is preserved in both detail YAML and index.
    - Detail output is now YAML only (REQ-*.yaml, ARCH-*.yaml, IMPL-*.yaml); index `detail_file` paths reference .yaml.

## [2.2.0] - 2026-02-23

### Changed

- **Documentation and version alignment**: All methodology version references updated to TIED 2.2.0 (README.md, conversation.template.md, tasks.template.md). Removed redundant document version line from ai-principles.md. mcp-server/README.md: fixed broken CLI/samples paragraph (CLI script and sample files not yet in repo; use MCP conversion tools); conversion tools description now references TIED 2.x output format.

## [2.1.0] - 2026-02-09

### Changed

- **Task Tracking Now Optional**: Task tracking via `tasks.md` is no longer mandatory in the TIED methodology
  - **Rationale**: The core value of TIED is in the **traceability chain** (requirements → architecture → implementation → tests → code) maintained through semantic tokens and YAML indexes, not in task tracking artifacts. Agents can naturally maintain planning state in-session (e.g., conversation-based todo lists) or document work breakdown directly in `implementation-decisions`, making a separate task file redundant.
  - **Benefits**:
    - Less ceremony: No need to "plan in tasks.md before implementation," update subtasks, or remove completed subtasks
    - Single source of truth: Traceability stays in the token chain and decision logs
    - Agent-native workflow: Agents already break work into steps and track progress in-conversation
    - Simpler bootstrap: Session start no longer requires reviewing tasks.md
    - Fewer artifacts: One less template and one less file to create per project
  - **What Changed**:
    - `AGENTS.md`: Removed "Review tasks.md" from session bootstrap, removed Task Management section, removed tasks.md from all checklists and Key Files table
    - `ai-principles.md`: Renamed Phase 2 from "Pseudo-Code → Tasks" to "Planning Implementation", removed Task Tracking System section, updated all checklists to remove tasks.md references
    - Template files: Removed tasks.md from `REQ-TIED_SETUP`, architecture structure, and all YAML indexes
    - `tasks.template.md`: Added prominent note that it's optional as of TIED 2.1.0
    - Token audit/validation results: Now logged only in `implementation-decisions` (previously logged in both tasks.md and implementation-decisions)
  - **What Stayed the Same**:
    - All semantic token types: `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`, `[TEST-*]`, `[PROC-*]`
    - Documentation-first flow: expand requirements, record ARCH/IMPL decisions immediately, then implement
    - Module validation mandate: validate modules independently before integration
    - Priority order: Tests > Code > Basic Functions > Infrastructure
    - Token audit and validation processes (only logging location changed)
  - **Migration**: Projects currently using `tasks.md` can continue using it - it's simply no longer required. Projects can also switch to in-session planning or document work breakdown in `implementation-decisions.yaml`. No breaking changes to existing workflows.
  - **Optional Use**: Projects that benefit from a shared task list for human visibility can continue using `tasks.template.md`

### Removed

- Mandatory task tracking from methodology requirements
- `tasks.md` references from AGENTS.md session bootstrap and all operational checklists
- Task Tracking System section from ai-principles.md (replaced with optional work planning note)
- `tasks.md` from required file lists in templates (REQ-TIED_SETUP, ARCH-TIED_STRUCTURE, implementation setup)

### Note

- This release represents a minor version bump (2.0.0 → 2.1.0) because while task tracking was previously positioned as mandatory, the methodology's core value proposition - semantic token traceability - remains unchanged. Making task tracking optional simplifies the methodology without removing functionality, as agents and teams can still choose to use `tasks.md` if desired.

---

## [2.0.0] - 2026-02-08

### Changed

- **Methodology Rename**: Renamed from STDD (Semantic Token-Driven Development) to TIED (Token-Integrated Engineering & Development)
  - **Rationale**: The new name better captures the methodology's core value proposition: semantic tokens "tie" code to intent, making it impossible to modify code without confronting related context. The term "integrated" emphasizes how tokens are woven throughout the development lifecycle, while "engineering & development" broadens the scope beyond just "development" to include the full engineering process.
  - **Breaking Changes**:
    - Methodology name changed throughout all documentation
    - Repository recommended directory structure changed from `stdd/` to `tied/`
    - GitHub repository URL changed from `github.com/fareedst/stdd` to `github.com/fareedst/tied`
    - File renames: `STDD.md` → `TIED.md`, `stdd-language-spec.md` → `tied-language-spec.md`
    - Token identifiers updated: `REQ-STDD_SETUP` → `REQ-TIED_SETUP`, `ARCH-STDD_STRUCTURE` → `ARCH-TIED_STRUCTURE`
  - **Preserved**:
    - All semantic token types remain unchanged: `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`, `[TEST-*]`, `[PROC-*]`
    - The semantic token mechanism and traceability system remain unchanged
    - All methodology principles, processes, and workflows remain unchanged
    - Version history preserved (this is v2.0.0, building on v1.5.0)
  - **Migration**: Existing TIED projects should update their documentation references from "STDD" to "TIED" and rename their `stdd/` directory to `tied/`. The methodology itself remains functionally identical.

### Note

- This release represents a major version bump (1.5.0 → 2.0.0) due to the breaking changes in terminology and directory structure. However, the core methodology, semantic token system, and all technical features remain unchanged from v1.5.0.

---

## [1.5.0] - 2026-02-07

### Added

- **Structured YAML Schema** [v1.5.0 Schema Enhancement]: Restructured all three YAML index files to use machine-parseable structured fields instead of markdown-formatted string blobs
  - **traceability field**: Now a structured map with separate lists for `architecture[]`, `implementation[]`, `tests[]`, and `code_annotations[]` (previously markdown-formatted string)
  - **rationale field**: Now a structured map with `why`, `problems_solved[]`, and `benefits[]` (previously plain string)
  - **satisfaction_criteria** (requirements): Now a list of structured items with `criterion` and optional `metric` (previously markdown-formatted string)
  - **validation_criteria** (requirements): Now a list of structured items with `method` and `coverage` (previously markdown-formatted string)
  - **alternatives_considered** (architecture): Now a list of structured items with `name`, `pros[]`, `cons[]`, and `rejected_reason` (previously markdown-formatted string)
  - **implementation_approach** (architecture/implementation): Now a structured map with `summary` and `details[]` (previously markdown-formatted string)
  - **code_markers → code_locations** (implementation): Renamed and restructured with `files[]` and `functions[]` lists with structured metadata (previously markdown-formatted string)
  - **metadata field**: Grouped flat fields (`created`, `last_updated`, `last_validated`, `last_validator`) into structured maps with date/author/reason/result sub-fields
  - Enables direct field access: `yq '.REQ-X.traceability.architecture[]'` instead of parsing markdown text
  - Enables structured queries: `yq '.REQ-X.satisfaction_criteria[].criterion'`
  - Better validation and tool integration support

- **YAML Database Indexes** [PROC-YAML_DB_OPERATIONS]: Transformed all three index files from Markdown tables to YAML database files for improved programmatic access and append-only semantics
  - `requirements.template.yaml` - YAML database with all requirement records (replaces Markdown tables in requirements.template.md)
  - `architecture-decisions.template.yaml` - YAML database with all architecture decision records (replaces Markdown tables in architecture-decisions.template.md)
  - `implementation-decisions.template.yaml` - YAML database with all implementation decision records (replaces Markdown tables in implementation-decisions.template.md)
  - Each YAML file includes comprehensive header documentation and template blocks for easy appending
  - Schema tailored per type with structured fields (see Structured YAML Schema above)
  - Append-only design: copy template block from bottom, paste at end, fill fields
  - Enables programmatic querying with `yq`, `grep`, Python `yaml.safe_load()`, and other YAML tools

- **YAML Operations Process Documentation** [PROC-YAML_DB_OPERATIONS]: Comprehensive process guide in `processes.template.md`
  - Appending new records (manual and scripted) with v1.5.0 structured schema
  - Reading specific records (`yq`, `grep`, Python)
  - Filtering by status/priority
  - Validating YAML syntax
  - Listing all tokens
  - Checking cross-references with structured traceability fields
  - Querying structured content (satisfaction criteria, alternatives, code locations, metadata)
  - Complete examples for all operations using v1.5.0 schema

- **YAML Index Migration Guide** (`migrate-to-yaml-indexes.md`): Comprehensive migration instructions
  - Updated with v1.4.0 → v1.5.0 migration section for structured schema conversion
  - Python migration script for automated field restructuring
  - Pre-migration checklist
  - Step-by-step migration for all three index types
  - Manual and scripted conversion approaches
  - Cross-reference updates
  - YAML syntax validation
  - Traceability verification
  - Post-migration checklist
  - Rollback procedure
  - Troubleshooting section

### Changed

- **`.template.md` guide files**: Updated with v1.5.0 schema examples
  - `requirements.template.md` - Updated append examples and query patterns to show structured traceability, rationale, satisfaction_criteria, validation_criteria, and metadata
  - `architecture-decisions.template.md` - Updated append examples and query patterns to show structured traceability, rationale, alternatives_considered, implementation_approach, and metadata
  - `implementation-decisions.template.md` - Updated append examples and query patterns to show structured traceability, rationale, implementation_approach, code_locations (renamed from code_markers), and metadata
  - All three files now serve as **guide files** explaining how to use YAML indexes with structured fields

- **Detail file templates**: Updated traceability sections to reference structured YAML format
  - `requirements.template/*.md` - Updated traceability section format and added notes about structured YAML lists
  - `architecture-decisions.template/*.md` - Kept clean format (already compatible)
  - `implementation-decisions.template/*.md` - Updated code markers section to code locations with structured format notes

- **`processes.template.md`**: Updated `[PROC-YAML_DB_OPERATIONS]` section
  - Scripted append example updated to v1.5.0 structured schema
  - Added structured traceability query examples
  - Added structured content query examples (satisfaction criteria, alternatives, implementation approach, metadata)

- **`copy_files.sh`**: Updated to copy YAML template files
  - Added `requirements.template.yaml` to TEMPLATE_FILES array
  - Added `architecture-decisions.template.yaml` to TEMPLATE_FILES array
  - Added `implementation-decisions.template.yaml` to TEMPLATE_FILES array

- **Version Alignment**: Updated all methodology files to STDD v1.5.0
  - `AGENTS.md`: v1.5.0
  - `ai-principles.md`: v1.2.0, STDD v1.5.0
  - `semantic-tokens.template.md`: v1.5.0
  - `requirements.template.md`: v1.5.0
  - `architecture-decisions.template.md`: v1.5.0
  - `implementation-decisions.template.md`: v1.5.0

- **`semantic-tokens.template.md`**: Updated all references to mention `.yaml` index files alongside `.md` guide files
  - Added `[PROC-YAML_DB_OPERATIONS]` to Process Tokens Registry

- **`AGENTS.md`**: Updated Key Files table and Section 2 to reference `.yaml` index files
  - Index files listed as YAML databases with `.md` files as guides

- **`ai-principles.md`**: Comprehensive updates throughout
  - Documentation Structure section updated to reference `.yaml` files
  - Related Documents section updated with `.yaml` file references
  - Feature documentation format updated to use `.yaml` file references
  - Critical reminders updated to reference `.yaml` files
  - Change Impact Tracking matrix updated to use `.yaml` files
  - All checklist items updated to reference `.yaml` files

- **`STDD.md`**: Updated references to mention YAML index format in documentation outputs and template file listings

### Benefits

- **Direct Field Access**: `yq '.REQ-X.traceability.architecture[]'` instead of parsing markdown strings
- **Structured Queries**: `yq '.REQ-X.satisfaction_criteria[].criterion'` for targeted data extraction
- **Easy Filtering**: `yq '.REQ-X.metadata.last_validated.result'` for validation status checks
- **Programmatic Access**: Query, filter, and validate indexes using standard YAML tools (`yq`, Python, etc.)
- **Append-Only Semantics**: Add new records by copying template block and pasting at end - reduces merge conflicts
- **Structured Data**: YAML provides proper data types (lists, maps, multi-line strings) vs. Markdown table text or string blobs
- **Easier Validation**: `yq '.' file.yaml` validates syntax; custom scripts can validate cross-references and field structure
- **Better Tooling**: Standard YAML parsers available in all languages with native support for structured queries
- **Consistent Format**: No Markdown table formatting issues or alignment problems
- **Preserve Detail Files**: Detail `.md` files remain unchanged - only indexes converted to YAML with structured fields

### Rationale

**Schema Restructuring (v1.5.0)**: Markdown-formatted string blobs in YAML fields require text parsing and regex matching for programmatic access. Structured YAML fields enable direct queries (`yq '.field.subfield[]'`), type safety, easier validation, and better tool integration. This change completes the transformation from human-only readable Markdown to machine-readable structured data while maintaining human readability.

**YAML Database Indexes (v1.4.0 foundation)**: Markdown tables become unwieldy for programmatic operations (filtering, querying, validation). YAML provides:
1. **Machine-readable structure** while maintaining human readability
2. **Append-only workflow** that minimizes merge conflicts
3. **Rich data types** (lists, maps, multi-line strings) vs. plain text in table cells
4. **Standard tooling** available across all programming languages
5. **Easier validation** of both syntax and semantic consistency

The `.md` guide files explain how to use the YAML indexes, while the YAML files themselves serve as the canonical database. Detail files remain in Markdown for narrative documentation.

---

## [1.4.0] - 2026-02-06

### Added

- **Scalable Requirements Structure**: Transformed `requirements.template.md` from a monolithic file into an index + detail files pattern for scalability
  - Main file now serves as a lightweight **index** with a table of all requirements
  - Individual requirements stored in `requirements.template/` directory as separate files (e.g., `REQ-STDD_SETUP.md`)
  - Mirrors the architecture-decisions (v1.3.0) and implementation-decisions (v1.2.0) structure
  - Status tracking per requirement: ✅ Implemented, ⏳ Planned, Template
  - Optional domain-based grouping for very large projects

- **Requirements Migration Guide** (`migrate-requirements.md`): Comprehensive AI agent instructions for migrating existing projects from monolithic requirements files to the new scalable structure
  - Pre-migration checklist
  - Step-by-step migration process with commands
  - Post-migration verification
  - Handling special cases (missing tokens, duplicates, cross-references)
  - Complete worked example
  - Rollback procedure

- **Example Requirements Detail Files** (`requirements.template/`): Complete reference implementations
  - `REQ-STDD_SETUP.md`
  - `REQ-MODULE_VALIDATION.md`
  - `REQ-IDENTIFIER.md` (template example)

### Changed

- **`requirements.template.md`**: Now contains index table, detail file template, and instructions for the new structure
- **`copy_files.sh`**: Updated to copy requirements detail files from `requirements.template/` directory
- **`semantic-tokens.template.md`**: Updated Requirements Tokens Registry reference to point to both index and detail files directory
- **Cross-references**: Updated `ai-principles.md`, `AGENTS.md`, `README.md`, and `STDD.md` to reflect new requirements structure
- **Version Alignment**: Updated all methodology files to STDD v1.4.0

### Rationale

As projects grow, monolithic requirements files become unwieldy for both humans and AI agents. This change (completing the pattern started with implementation-decisions in v1.2.0 and architecture-decisions in v1.3.0) preserves all information while enabling:
- Faster navigation and context loading
- Cleaner git history per-requirement
- Reduced merge conflicts
- Domain-based organization for large projects
- Consistent pattern across all STDD documentation types (requirements, architecture, implementation)

---

## [1.3.0] - 2026-01-17

### Added

- **Unified Semantic Token Format**: Standardized all semantic tokens from colon format (`[TYPE:IDENTIFIER]`) to hyphen format (`[TYPE-IDENTIFIER]`)
  - Enables single regex pattern for both text and filenames
  - Consistent mental model - tokens look the same everywhere
  - Simplified tooling - no format translation needed
  - Easier searchability - agents can use one pattern for all contexts

- **Scalable Architecture Decisions Structure**: Transformed `architecture-decisions.template.md` from a monolithic file into an index + detail files pattern for scalability
  - Main file now serves as a lightweight **index** with a table of all architecture decisions
  - Individual decisions stored in `architecture-decisions/` directory as separate files (e.g., `ARCH-STDD_STRUCTURE.md`)
  - Mirrors the implementation-decisions structure from v1.2.0
  - Status tracking per decision: Active, Deprecated, Template, Superseded
  - Optional domain-based grouping for very large projects

- **Token Format Migration Guide** (`migrate-semantic-token-format.md`): Comprehensive AI agent instructions for migrating existing projects from colon-based tokens to hyphen-based tokens
  - Pre-migration checklist
  - Automated sed/grep commands for bulk replacement
  - Universal migration script
  - Post-migration verification steps
  - Rollback procedure

- **Architecture Decisions Migration Guide** (`migrate-architecture-decisions.md`): Comprehensive AI agent instructions for migrating existing projects from monolithic architecture-decisions files to the new scalable structure
  - Pre-migration checklist
  - Step-by-step migration process with commands
  - Post-migration verification
  - Handling special cases (missing tokens, duplicates, cross-references)
  - Complete worked example
  - Rollback procedure

- **Example Architecture Detail Files** (`architecture-decisions.template/`): Complete reference implementations
  - `ARCH-STDD_STRUCTURE.md`
  - `ARCH-MODULE_VALIDATION.md`
  - `ARCH-EXAMPLE_DECISION.md`

### Changed

- **All Documentation Files**: Updated to use hyphen-based token format (`[TYPE-IDENTIFIER]`)
- **`architecture-decisions.template.md`**: Now contains index table, detail file template, and instructions for the new structure
- **`semantic-tokens.template.md`**: Updated Architecture Tokens Registry reference to point to both index and detail files directory
- **Version Alignment**: Updated all methodology files to STDD v1.3.0

### Rationale

**Token Format Change**: The colon (`:`) character is invalid in filenames on many operating systems. Previously this required different patterns for tokens in text vs. filenames. The hyphen format unifies both, enabling single-pattern matching and simplified tooling.

**Architecture Decisions Structure**: As projects grow, monolithic documentation files become unwieldy for both humans and AI agents. This change (mirroring the v1.2.0 implementation-decisions change) preserves all information while enabling faster navigation, cleaner git history, reduced merge conflicts, and domain-based organization.

---

## [1.2.0] - 2026-01-17

### Added

- **Scalable Implementation Decisions Structure**: Transformed `implementation-decisions.template.md` from a monolithic file into an index + detail files pattern for scalability
  - Main file now serves as a lightweight **index** with a table of all implementation decisions
  - Individual decisions stored in `implementation-decisions/` directory as separate files (e.g., `IMPL-CONFIG_STRUCT.md`)
  - Filename convention: Replace `:` with `-` to handle OS filename restrictions (`[IMPL-TOKEN]` → `IMPL-TOKEN.md`)
  - Status tracking per decision: Active, Deprecated, Template, Superseded
  - Optional domain-based grouping for very large projects

- **Migration Guide** (`migrate-implementation-decisions.md`): Comprehensive AI agent instructions for migrating existing projects from monolithic implementation-decisions files to the new scalable structure
  - Pre-migration checklist
  - Step-by-step migration process with commands
  - Post-migration verification
  - Handling special cases (missing tokens, duplicates, cross-references)
  - Complete worked example
  - Rollback procedure

- **Example Detail File** (`implementation-decisions.template/IMPL-MODULE_VALIDATION.md`): Complete reference implementation of a detail file

### Changed

- **`implementation-decisions.template.md`**: Now contains index table, detail file template, and instructions for the new structure
- **`semantic-tokens.template.md`**: Updated Implementation Tokens Registry reference to point to both index and detail files directory
- **Version Alignment**: Updated all methodology files to STDD v1.2.0

### Rationale

As projects grow, monolithic documentation files become unwieldy for both humans and AI agents. This change preserves all information while enabling:
- Faster navigation and context loading
- Cleaner git history per-decision
- Reduced merge conflicts
- Domain-based organization for large projects

---

## [1.1.0] - 2025-12-19

### Added

- **Processes as a Primary STDD Pillar** [PROC-PROJECT_SURVEY_AND_SETUP] [PROC-BUILD_PIPELINE_VALIDATION]: Elevated processes from optional guidance to a core methodology component so operational rituals remain traceable to requirements, architecture, and implementation tokens.

### Changed

- **Version Alignment**: Updated every methodology guide, template, and project copy to cite STDD v1.1.0 so downstream projects instantly inherit the processes-first workflow expectations.

### Rationale

Adding processes to the primary STDD methodology is a major capability improvement that affects every consumer of these templates, necessitating a version bump.

## [1.0.2] - 2025-01-27

### Added

- **Module Validation Requirement** [REQ-MODULE_VALIDATION]: Mandatory requirement for independent module validation before integration
  - Logical modules must be validated independently before integration into code satisfying specific requirements
  - Each module must have clear boundaries, interfaces, and validation criteria defined before development
  - Modules must pass independent validation (unit tests with mocks, integration tests with test doubles, contract validation, edge case testing, error handling validation) before integration
  - Integration only occurs after module validation passes
  - **Rationale**: Eliminates bugs related to code complexity by ensuring each module works correctly in isolation before combining with other modules

- **Module Validation Architecture Decision** [ARCH-MODULE_VALIDATION]: Architecture decision documenting the module validation strategy
  - Module identification requirements
  - Validation approach (unit testing, integration testing with test doubles, contract validation, edge case testing, error handling validation)
  - Integration requirements
  - Alternatives considered and rationale for rejection

- **Module Validation Implementation Decision** [IMPL-MODULE_VALIDATION]: Implementation decision documenting how module validation is implemented
  - Module identification phase
  - Module development phase
  - Module validation phase (before integration)
  - Integration phase (after validation)
  - Task structure and code markers

- **Template bootstrap script**: `copy_files.sh` copies every STDD template file into a target project’s `stdd/` directory, making STDD installation as easy as downloading the repository somewhere convenient and running the script from the desired project root.

### Changed

- **Development Process**: Enhanced Phase 1, Phase 2, and Phase 3 to include module identification, development, validation, and integration steps
- **AI-First Principles**: Added Principle 8 for independent module validation before integration
- **Task Template**: Updated to include module validation subtasks in task examples
- **All Templates**: Updated version numbers to 1.0.2

### Rationale

This enhancement addresses the need to eliminate bugs related to code complexity by requiring logical modules to be validated independently prior to integration. This ensures each module works correctly in isolation before combining with other modules, reducing integration complexity and catching bugs early in the development cycle.

## [1.0.1] - 2025-11-19

### Changed

- Made the repository language-neutral by removing specific language references
- Updated documentation to be language-agnostic

## [1.0.0] - 2025-11-08

### Added

- Initial release of STDD methodology template (Version 1.0.0)
- Complete STDD principles and process guide (`ai-principles.md`)
- STDD methodology overview for beginners, intermediate, and expert developers (`STDD.md`)
- Template files for project setup (with `.template.md` suffix):
  - `requirements.template.md` - Template for project requirements
  - `architecture-decisions.template.md` - Template for architecture decisions
  - `implementation-decisions.template.md` - Template for implementation decisions
  - `processes.template.md` - Template for process tracking
  - `semantic-tokens.template.md` - Template for semantic token registry
  - `tasks.template.md` - Template for task tracking
- AI agent operating guide (`AGENTS.md`) and Cursor IDE loader (`.cursorrules` template)
- Comprehensive README with getting started guide and template usage instructions
- Version file (`VERSION`) containing methodology version

### Methodology Components
- **Requirements Documentation** - Template file (`requirements.template.md`) for documenting requirements with `[REQ-*]` tokens
- **Architecture Decisions** - Template file (`architecture-decisions.template.md`) for documenting architecture decisions with `[ARCH-*]` tokens
- **Implementation Decisions** - Template file (`implementation-decisions.template.md`) for documenting implementation decisions with `[IMPL-*]` tokens
- **Process Management** - Template file (`processes.template.md`) for repeatable processes
- **Semantic Token System** - Template file (`semantic-tokens.template.md`) for central token registry and cross-referencing system
- **Task Management** - Template file (`tasks.template.md`) for priority-based task tracking system
- **Development Process** - Three-phase development process (Requirements → Pseudo-Code → Tasks → Implementation)

### Template Structure
- Template files use `.template.md` suffix to distinguish them from project-specific files
- Projects copy templates to their own files (without `.template` suffix) for project-specific development
- Methodology documentation files (`STDD.md`, `ai-principles.md`) remain as reference in the STDD repository
- All references in methodology files point to project files (without `.template`), as those are what exist in actual projects

### Key Features
- Intent preservation through semantic tokens
- Traceability from requirements to code
- Living documentation system
- AI agent integration (Cursor IDE)
- Template-based structure for easy adoption

[2.2.0]: https://github.com/fareedst/tied/releases/tag/v2.2.0
[2.1.0]: https://github.com/fareedst/tied/releases/tag/v2.1.0
[1.0.0]: https://github.com/fareedst/tied/releases/tag/v1.0.0

