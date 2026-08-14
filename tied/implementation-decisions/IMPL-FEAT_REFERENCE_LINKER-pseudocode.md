# [IMPL-FEAT_REFERENCE_LINKER] [ARCH-FEAT_CANONICAL_LINK_BOUNDARY] [REQ-FEAT_CANONICAL_LINKS]

## Summary contract
# [IMPL-FEAT_REFERENCE_LINKER] [ARCH-FEAT_CANONICAL_LINK_BOUNDARY] [REQ-FEAT_CANONICAL_LINKS] — How: resolve typed feature references against canonical TIED records without mutating them.
Contract:
  INPUT: manifest_references; canonical_tied_indexes
  PRE: indexes are readable and references declare an expected layer
  OUTPUT: resolved_links | link_errors
  POST: links exist in declared layers and indexes are unchanged
  FAILURE_MODES: MALFORMED_REFERENCE; DANGLING_REFERENCE; WRONG_TOKEN_TYPE; DUPLICATE_REFERENCE; INCONSISTENT_GRAPH
  EFFECTS: IO — read only
  TERMINATION: total

## CANONICAL_REFERENCE_LINKER
# [IMPL-FEAT_REFERENCE_LINKER] [ARCH-FEAT_CANONICAL_LINK_BOUNDARY] [REQ-FEAT_CANONICAL_LINKS] — How: resolve references, enforce token type, and validate the REQ→ARCH→IMPL graph.
procedure RESOLVE_CANONICAL_REFERENCES(manifest_references, canonical_tied_indexes):
  # [IMPL-FEAT_REFERENCE_LINKER] [ARCH-FEAT_CANONICAL_LINK_BOUNDARY] [REQ-FEAT_CANONICAL_LINKS] — How: resolve each typed reference and preserve canonical ownership.
  Contract:
    INPUT: manifest_references; canonical_tied_indexes
    PRE: canonical indexes are readable
    OUTPUT: resolved_links | link_errors
    POST: successful links are typed and existing; no canonical record changes
    FAILURE_MODES: MALFORMED_REFERENCE; DANGLING_REFERENCE; WRONG_TOKEN_TYPE; DUPLICATE_REFERENCE; INCONSISTENT_GRAPH
    EFFECTS: IO — read only
    TERMINATION: total
  FOR each reference IN manifest_references:
    CHECK reference shape and expected layer
    LOOK UP reference token in expected canonical index
    IF missing: RETURN DANGLING_REFERENCE
    IF token type differs: RETURN WRONG_TOKEN_TYPE
    IF token is duplicated: RETURN DUPLICATE_REFERENCE
    ADD resolved reference metadata
  CHECK resolved REQ/ARCH/IMPL graph consistency
  IF graph is inconsistent: RETURN INCONSISTENT_GRAPH
  RETURN resolved_links
