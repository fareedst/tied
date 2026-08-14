# [IMPL-FEAT_MIGRATION_PREVIEW] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION]

## Summary contract
# [IMPL-FEAT_MIGRATION_PREVIEW] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — normalize legacy inputs into a deterministic no-write migration preview.
Contract:
  INPUT: legacy_inputs, feature_spec_batches, agentstream_order
  PRE: inputs are readable and source order is observable
  OUTPUT: migration_preview
  POST: no source, project YAML, or manifest is written; equivalent inputs produce equivalent reports
  FAILURE_MODES: INVALID_SOURCE, CONFLICTS_PRESENT, UNSUPPORTED_RECORD
  DATA: normalized candidates, source identities, order evidence, conflict report
  EFFECTS: IO
  TERMINATION: total

## BUILD_MIGRATION_PREVIEW
# [IMPL-FEAT_MIGRATION_PREVIEW] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — parse additive legacy sources and preserve their ordered behavior.
procedure BUILD_MIGRATION_PREVIEW(legacy_inputs, feature_spec_batches, agentstream_order):
  # [IMPL-FEAT_MIGRATION_PREVIEW] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — normalize sources while guaranteeing a no-write preview.
  Read legacy feature-spec records without modifying them.
  Read ordered agentstream batch records and retain source order.
  Normalize each candidate to feature-manifest fields through existing validators.
  Resolve references through the canonical linker without copying canonical bodies.
  Detect duplicate identities, ownership conflicts, unsupported records, and order ambiguity.
  Sort conflicts by source identity, conflict kind, and field.
  Return candidates, source order, conflicts, and writes_planned=false.

## REPORT_MIGRATION_CONFLICTS
# [IMPL-FEAT_MIGRATION_PREVIEW] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — expose stable correction information for review before confirmation.
procedure REPORT_MIGRATION_CONFLICTS(preview):
  # [IMPL-FEAT_MIGRATION_PREVIEW] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — expose deterministic conflict corrections.
  Return deterministic conflict code, source path, record identity, field, reason, and corrective action.
