# [IMPL-FEAT_VIEW_STALE_DETECTION] [ARCH-FEAT_VIEW_STALENESS] [REQ-FEAT_VIEW_STALENESS]
# Detect generated views whose recorded canonical inputs no longer match and apply explicit freshness policy.
Contract:
  INPUT: generated_view, current_source_revision, stale_view_policy
  PRE: stale_view_policy is fail or warn and generated_view has parseable source metadata
  OUTPUT: freshness_result
  POST: freshness_result identifies every stale source and applies the requested policy; stale output is marked non-current-intent and non-runtime-proof
  FAILURE_MODES: InvalidGeneratedMetadata, UnsupportedPolicy
  EFFECTS: pure
  TERMINATION: total
  CONTROL: stale source identities and diagnostics are sorted deterministically

# How this block validates the generated banner before making a freshness claim.
READ_VIEW_SOURCE_METADATA(generated_view):
  INPUT: generated_view
  PRE: generated_view is readable
  OUTPUT: recorded_source_revision | { error: InvalidGeneratedMetadata }
  POST: success => every recorded source identity has a revision or hash
  FAILURE_MODES: InvalidGeneratedMetadata
  EFFECTS: pure
  TERMINATION: total
  1. Parse the generated-file banner.
  2. Reject a missing or malformed source_revision entry with InvalidGeneratedMetadata.
  3. Return recorded_source_revision in stable identity order.

# How this block identifies stale views and keeps proof boundaries explicit.
DETECT_STALE_VIEW(generated_view, current_source_revision, stale_view_policy):
  1. Validate stale_view_policy; return UnsupportedPolicy when it is not fail or warn.
  2. Read recorded_source_revision from generated_view.
  3. Compare every recorded identity with current_source_revision.
  4. Add a stale diagnostic for each missing, changed, or newly required source identity.
  5. Sort diagnostics by view path and source identity.
  6. IF diagnostics is empty: RETURN { status: current, stale: false, proof_boundaries: generated_view.proof_boundaries }.
  7. IF stale_view_policy is fail: RETURN { status: failed, stale: true, current_intent: false, runtime_proof: false, diagnostics }.
  8. IF stale_view_policy is warn: RETURN { status: warned, stale: true, current_intent: false, runtime_proof: false, diagnostics }.
