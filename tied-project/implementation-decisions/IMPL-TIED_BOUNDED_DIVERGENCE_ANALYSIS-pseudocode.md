# [IMPL-TIED_BOUNDED_DIVERGENCE_ANALYSIS] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
# Deterministic read-only divergence analysis over bounded trajectory manifests.

Grammar-Version: v2

## Trajectory divergence analysis

- [IMPL-TIED_BOUNDED_DIVERGENCE_ANALYSIS] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] Read-only contrast engine; never mutates TIED YAML, finding ledgers, or vocabulary.
- Contract:
  - INPUT: one or more trajectory manifests, optional bounded trajectory summaries, analysis options
  - PRE: manifests share request_token containment; manifests not stale beyond configured tolerance
  - OUTPUT: divergence report artifact | error StaleManifest | error RequestScopeViolation
  - POST:
    - on success: stable contrast rows, observed findings only, explicit unknown or truncated markers; proof_boundary shadow_and_divergence_advisory_not_gate_authority
    - on success: no append to finding-ledger.jsonl, no LEAP, no REQ/ARCH/IMPL edits
  - FAILURE_MODES: StaleManifest, RequestScopeViolation, MissingProvenance
  - EFFECTS: pure
  - TERMINATION: total

procedure ANALYZE_TRAJECTORY_DIVERGENCE(manifests, options):
  # [IMPL-TIED_BOUNDED_DIVERGENCE_ANALYSIS] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] How: emit deterministic divergence report without authority side effects.
  Contract:
    INPUT: ordered manifest list, read-only options
    OUTPUT: divergence report descriptor | error StaleManifest | error RequestScopeViolation
    PRE: at least one manifest; all manifests same request_token
    POST: report content hash stable for identical inputs; truncations labeled explicitly
    FAILURE_MODES: StaleManifest, RequestScopeViolation, MissingProvenance
    EFFECTS: pure
    TERMINATION: total
  FOR EACH manifest: IF request_token mismatch: RETURN error RequestScopeViolation
  IF any manifest stale: RETURN error StaleManifest
  compute contrast rows for tool usage, outcomes, ordering, and exit metadata
  mark unknown where summaries truncated or provenance incomplete
  emit divergence report under committed working root for request_token
  RETURN divergence report descriptor
