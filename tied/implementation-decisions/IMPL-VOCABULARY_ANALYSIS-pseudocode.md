# [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_ANALYSIS] — Deterministic term extraction and TIED record normalization.

## Scoped source file collection

- [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [REQ-VOCABULARY_ANALYSIS] Reuse collectScopedSourceFiles from scoped-analysis.ts; do not duplicate traversal.
- Contract:
  - INPUT: ScopedAnalysisArgs, projectRootAbs
  - PRE: config and ignore resolution match runScopedAnalysis walk_summary
  - OUTPUT: sorted ScopedSourceFile list with relPosix and absPath
  - POST: same file set as walk_summary mode for equivalent args
  - EFFECTS: IO (directory walk only)
  - TERMINATION: total
- PROCEDURE: COLLECT_SCOPED_SOURCE_FILES
  - 1. Resolve roots, ignore filter, extensions, max_files from args and .tiedanalysis.yaml.
  - 2. Walk roots; skip ignored paths and symlinks per policy.
  - 3. Return sorted relPosix/absPath pairs.

## Term analysis from file texts

- [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_ANALYSIS] Extract significant TIED tokens and source identifiers with policy filters.
- Contract:
  - INPUT: fileEntries with relPosix, text; TermAnalysisPolicy
  - PRE: paths are posix relative to client project root
  - OUTPUT: SourceTermAnalysisResult
  - POST: TIED tokens always included; source identifiers meet min_frequency or bypass rules; excerpts redacted and capped
  - FAILURE_MODES: TruncationApplied
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: ANALYZE_SOURCE_TERMS
  - 1. For each file, classify file_kind via traceability_gap markers and test heuristics.
  - 2. Extract TIED tokens via bracket regex on every line.
  - 3. For JS/TS extensions when identifier_mode is ast (default), extract source identifiers via TypeScript compiler API (identifier-ast.ts); otherwise use lexical line split heuristic.
  - 4. Normalize keys lowercase; preserve first-seen display casing in walk order.
  - 5. Apply stop words and min_frequency (distinct files or distinct scopes).
  - 6. Build excerpts max 3 lines, 240 chars; redact secret patterns.
  - 7. Sort and truncate to max_terms; emit truncation metadata when cap applied.

## MCP vocabulary explorer tool

- [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [REQ-VOCABULARY_EXPLORER] Expose tied_vocabulary_explorer_run on the TIED YAML MCP surface mirroring CLI options.
- Contract:
  - INPUT: roots, config_path, min_frequency, max_terms, include_extensions, identifier_mode, include_html, out_html_path, emit_json_path
  - PRE: TIED_BASE_PATH readable; cwd is client project root
  - OUTPUT: JSON { ok, envelope, html?, out_html_path?, emit_json_path? }
  - POST: no TIED YAML mutations; envelope schema vocabulary-explorer.v1
  - EFFECTS: read-only index/detail load; optional HTML/JSON file writes when paths provided
  - TERMINATION: total
- PROCEDURE: RUN_VOCABULARY_EXPLORER_MCP
  - 1. Delegate to runVocabularyExplorer pipeline with mapped args.
  - 2. Return envelope; include html when include_html true.
  - 3. Write artifacts when out_html_path or emit_json_path set.

## TIED record normalization

- [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [REQ-VOCABULARY_ANALYSIS] Load merged indexes and label methodology-only ownership.
- Contract:
  - INPUT: TIED_BASE_PATH
  - PRE: yaml-loader indexes readable
  - OUTPUT: TiedRecordCatalog
  - POST: each token has description, layer, ownership, parent/child links from traceability helpers
  - EFFECTS: IO (read-only YAML)
  - TERMINATION: total
- PROCEDURE: LOAD_TIED_RECORD_CATALOG
  - 1. List REQ, ARCH, IMPL tokens from merged indexes.
  - 2. Load detail descriptions via detail-loader.
  - 3. Set ownership via isMethodologyOnlyIndexToken.
  - 4. Derive relationships via getDecisionsForRequirement and getRequirementsForDecision.
