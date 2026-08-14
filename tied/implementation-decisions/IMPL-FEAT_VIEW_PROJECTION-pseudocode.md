# [IMPL-FEAT_VIEW_PROJECTION] [ARCH-FEAT_VIEW_PROJECTION] [REQ-FEAT_VIEW_GENERATION]
# Normalize canonical feature references and Batch 2/3 projections into one reference-only renderer input.
Contract:
  INPUT: feature_manifest, clarification_projection, constitution_projection, task_graph_projection, canonical_record_refs, proof_boundary_labels
  PRE: feature_manifest is valid and every referenced canonical token resolves
  OUTPUT: source_projection | { error: InvalidReference | ConflictingRevision }
  POST: success => source_projection contains only references, summaries, projections, links, labels, and source_revision metadata
  FAILURE_MODES: InvalidReference, ConflictingRevision
  DATA: source_projection, source_revision
  DATA_TRANSITION: source_projection is created from normalized inputs and canonical data is unchanged
  EFFECTS: pure
  TERMINATION: total
  CONTROL: canonical identity ordering is stable; ordered fields retain declared order

# How this block validates ownership before projection.
BUILD_VIEW_SOURCE_PROJECTION(inputs):
  1. Validate feature_manifest schema and feature identifier.
  2. Resolve each REQ, ARCH, and IMPL reference through the canonical reference boundary.
  3. Reject any unresolved reference with InvalidReference.
  4. Collect clarification, constitution, task, execution-evidence, and quality projections.
  5. Reject conflicting source revisions for one canonical identity with ConflictingRevision.
  6. Compute deterministic content hashes only where a canonical revision ID is absent.
  7. Preserve proof-boundary labels without promoting them to evidence.
  8. Normalize unordered collections by canonical identity.
  9. Preserve semantic ordering for ordered fields.
  10. Return the reference-only source_projection.

# How this block preserves traceability and source revisions for every view consumer.
ASSEMBLE_SOURCE_METADATA(source_projection):
  INPUT: source_projection
  PRE: every source contribution has identity and revision or hash
  OUTPUT: source_revision (map)
  POST: source_revision lists every contributing identity in stable order
  EFFECTS: pure
  TERMINATION: total
  FOR each contribution IN source_projection:
    record identity, revision_or_hash, and source_kind
  RETURN source_revision
