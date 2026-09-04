# [IMPL-VOCABULARY_VIEWER_STATE] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_VIEWER_STATE] — Pure fragment-encoded viewer state.

## Fragment encode and decode

- [IMPL-VOCABULARY_VIEWER_STATE] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_VIEWER_STATE] Round-trip filters, search, selection in URL hash without DOM.
- Contract:
  - INPUT: fragment string or ViewerState object
  - PRE: fragment omits leading hash when decoding
  - OUTPUT: ViewerState | encoded fragment
  - POST: encode(decode(s)) preserves semantic fields; unknown keys ignored
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: DECODE_VIEWER_FRAGMENT
  - 1. Parse query params from hash: q, sel, kind, dir, fk, lang, prod, minf.
  - 2. Return ViewerState with defaults for missing fields.
- PROCEDURE: ENCODE_VIEWER_FRAGMENT
  - 1. Serialize non-default ViewerState fields to URLSearchParams.
  - 2. Return hash string without leading #.

## History transitions

- [IMPL-VOCABULARY_VIEWER_STATE] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_VIEWER_STATE] Simulate popstate back/forward over state stack.
- Contract:
  - INPUT: history stack, direction back|forward
  - OUTPUT: next ViewerState
  - POST: back returns prior state; forward returns next when available
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: APPLY_HISTORY_TRANSITION
  - 1. Adjust index by direction within bounds.
  - 2. Return state at new index.
