# [IMPL-VOCABULARY_HTML_RENDERER] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_EXPLORER] — Self-contained offline HTML artifact.

## Single-file HTML render

- [IMPL-VOCABULARY_HTML_RENDERER] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_EXPLORER] Emit injection-safe offline HTML with embedded envelope and interactive viewer.
- Contract:
  - INPUT: VocabularyExplorerV1Envelope
  - PRE: envelope schema vocabulary-explorer.v1
  - OUTPUT: html string
  - POST: includes proof-boundary banner; JSON embedded via JSON.stringify with Unicode escapes; hostile strings escaped in HTML context
  - FAILURE_MODES: InvalidEnvelope
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: RENDER_VOCABULARY_EXPLORER_HTML
  - 1. Escape HTML text nodes via context-aware escapeHtml.
  - 2. Embed envelope in script type application/json with script-safe serialization.
  - 3. Emit fixed detail panel, search, filters, term list, relationship links, scope breadcrumbs.
  - 4. Wire fragment encode/decode and popstate in inline client script.
  - 5. Return byte-stable HTML for fixed envelope input.
