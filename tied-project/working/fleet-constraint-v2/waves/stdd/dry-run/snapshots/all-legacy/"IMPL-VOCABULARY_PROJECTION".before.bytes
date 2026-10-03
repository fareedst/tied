# [IMPL-VOCABULARY_PROJECTION] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_EXPLORER] — vocabulary-explorer.v1 deterministic projection.

## Envelope projection

- [IMPL-VOCABULARY_PROJECTION] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_EXPLORER] Merge analysis outputs into byte-stable vocabulary-explorer.v1 envelope.
- Contract:
  - INPUT: SourceTermAnalysisResult, TiedRecordCatalog, WalkSummary, TermAnalysisPolicy, projectRootLabel
  - PRE: analysis and catalog use same normalized keys
  - OUTPUT: VocabularyExplorerV1Envelope
  - POST: schema vocabulary-explorer.v1; terms sorted by id ascending; arrays deterministically ordered
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: PROJECT_VOCABULARY_EXPLORER_V1
  - 1. Compute stable term id as sha256 slice of kind plus normalized_key.
  - 2. Merge TIED catalog tokens with source-derived terms; dedupe by normalized_key and kind.
  - 3. Attach occurrences, relationships (TIED parent/child plus co-occurrence), ownership, tied_layer.
  - 4. Build filters_catalog and views_catalog from term metadata.
  - 5. Include walk_summary, policy, proof_boundary offline_navigation_aid, generated_at UTC ISO-8601.
