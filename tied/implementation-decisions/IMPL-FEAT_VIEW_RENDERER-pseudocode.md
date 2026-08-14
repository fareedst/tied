# [IMPL-FEAT_VIEW_RENDERER] [ARCH-FEAT_VIEW_RENDERING] [REQ-FEAT_VIEW_GENERATION] [REQ-FEAT_VIEW_DETERMINISM]
# Render deterministic human-readable Markdown views from a normalized source projection and compare their meaning.
Contract:
  INPUT: source_projection, view_kind, source_revision
  PRE: view_kind is one of spec.md, plan.md, tasks.md, quickstart.md, data-model.md, or applicable contracts view
  OUTPUT: markdown_view | semantic_comparison
  POST: rendered view has a generated banner, source metadata, preserved links, proof-boundary labels, and stable section ordering
  FAILURE_MODES: UnsupportedViewKind, MissingProjectionField
  EFFECTS: pure
  TERMINATION: total
  CONTROL: fixed section order and canonical sort order

# How this block maps the normalized projection to one supported view without copying canonical bodies.
RENDER_GENERATED_VIEW(source_projection, view_kind, source_revision):
  1. Select the fixed section schema for view_kind.
  2. Reject unsupported view_kind with UnsupportedViewKind.
  3. Reject missing required projection data with MissingProjectionField.
  4. Emit the generated-file banner declaring the file a view and not a source of truth.
  5. Emit source_revision metadata in stable identity order.
  6. Emit summaries, boundaries, criteria, decisions, tasks, data, or contracts as applicable.
  7. Emit token links and evidence links without copying full canonical record bodies.
  8. Emit proof-boundary labels and the limits of the view's evidence.
  9. Return the byte-stable markdown_view.

# How this block guarantees unchanged-input no-diff behavior and meaningful comparison.
SEMANTIC_COMPARE_VIEW(left_view, right_view):
  INPUT: left_view, right_view
  PRE: both views have parseable generated metadata
  OUTPUT: { equal, differences }
  POST: equal is true only when normalized meaning, source metadata, links, and proof-boundary labels match
  FAILURE_MODES: InvalidGeneratedView
  EFFECTS: pure
  TERMINATION: total
  1. Parse generated banners and source metadata.
  2. Normalize permitted formatting-only differences.
  3. Compare view kind, semantic sections, source revisions, token links, evidence links, and proof-boundary labels.
  4. Return equal with an empty differences list when normalized views match.
  5. Return stable differences when normalized views do not match.
