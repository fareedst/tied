# [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION]
# Normalizes operational feedback, groups duplicates, and gates non-canonical LEAP proposal creation on human review.

## Summary contract
INPUT: incident, metric, test failure, or user report; existing feedback store; existing LEAP proposal queue; review decision
PRE: source provenance and affected feature are bounded; feedback and proposal stores remain distinct
OUTPUT: feedback entry, duplicate link, review status, or non-canonical LEAP proposal
POST: original feedback is preserved; no adapter or proposal lifecycle operation writes project REQ, ARCH, or IMPL YAML
FAILURE_MODES: InvalidSource, MissingEvidence, DuplicateConflict, ReviewRequired, CanonicalWriteAttempt
DATA: feedback.yaml entries, duplicate groups, evidence links, proposed REQ, promotion status, leap-proposals queue
DATA_TRANSITION: append feedback or duplicate links; append reviewed non-canonical proposal; never mutate canonical TIED data
EFFECTS: IO, State
TERMINATION: total

## NORMALIZE_OPERATIONAL_SOURCE
# [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Maps supported operational sources to the existing feedback entry contract.
Contract:
  INPUT: source event with source_type, affected_feature, severity, evidence links, and source payload
  PRE: source_type is incident, metric, test_failure, or user_report
  OUTPUT: normalized feedback entry | error InvalidSource | error MissingEvidence
  POST: source provenance, feature, severity, evidence, proposed REQ field, and promotion status are explicit
  FAILURE_MODES: InvalidSource, MissingEvidence
  EFFECTS: pure
  TERMINATION: total
  validate source type and required source identity
  validate affected feature and severity
  validate evidence links and source timestamp
  map source payload into additive feedback context
  set promotion status to promotion_pending
  RETURN normalized feedback entry

## GROUP_DUPLICATE_FEEDBACK
# [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Groups equivalent reports deterministically without deleting source history.
Contract:
  INPUT: normalized feedback entry, existing entries
  PRE: stable source, feature, signature, and evidence identity can be computed
  OUTPUT: original entry or duplicate link | error DuplicateConflict
  POST: original entries remain append-only; equivalent reports share duplicate_group
  FAILURE_MODES: DuplicateConflict
  DATA: feedback entries and duplicate groups
  DATA_TRANSITION: append one entry or one duplicate link; do not merge or delete entries
  EFFECTS: pure, State
  TERMINATION: total
  compute stable duplicate identity
  search existing duplicate groups
  IF equivalent group exists: append duplicate link and RETURN it
  append entry with new duplicate_group
  RETURN entry

## CREATE_REVIEWED_LEAP_PROPOSAL
# [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Creates a distinct non-canonical proposal only after explicit human review.
Contract:
  INPUT: feedback entry, proposed REQ, evidence links, reviewer decision, LEAP proposal queue
  PRE: reviewer identity, decision, rationale, and evidence are present; decision authorizes proposal creation
  OUTPUT: pending or approved non-canonical LEAP proposal | error ReviewRequired
  POST: proposal links feedback_id, affected feature, proposed REQ, evidence, and review; project YAML is unchanged
  FAILURE_MODES: ReviewRequired, CanonicalWriteAttempt
  DATA: leap-proposals queue
  DATA_TRANSITION: append or update only non-canonical proposal state; never write requirements.yaml, architecture-decisions.yaml, or implementation-decisions.yaml
  EFFECTS: IO, State
  TERMINATION: total
  validate human review decision
  construct proposal with non_canonical true and feedback link
  append through existing LEAP proposal queue lifecycle
  reject any canonical YAML write request
  RETURN proposal

## REPORT_PROMOTION_STATUS
# [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Reports review and promotion state without implying canonical application.
Contract:
  INPUT: feedback entry, duplicate links, proposal state, review evidence
  PRE: source and proposal identities are stable
  OUTPUT: promotion_pending | proposal_created | canonical_ready | rejected | duplicate
  POST: status names the next human action and states that canonical application remains a separate explicit TIED operation
  EFFECTS: pure
  TERMINATION: total
  IF duplicate link exists: RETURN duplicate
  IF review is absent: RETURN promotion_pending
  IF proposal exists but is not approved: RETURN proposal_created
  IF proposal is approved: RETURN canonical_ready
  RETURN rejected
