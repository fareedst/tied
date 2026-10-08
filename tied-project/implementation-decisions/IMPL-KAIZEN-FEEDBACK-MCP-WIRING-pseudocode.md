# [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [ARCH-KAIZEN-FEEDBACK-MCP-WIRING] [ARCH-FEEDBACK_STORAGE] [REQ-KAIZEN-FEEDBACK-MCP-WIRING]
# Summary: Thin MCP handlers in tools/index.ts delegate to Phase 4–7 Kaizen modules; JSON in/out; optional base_path; no canonical TIED YAML writes.

Grammar-Version: v2

# [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [ARCH-KAIZEN-FEEDBACK-MCP-WIRING] [ARCH-FEEDBACK_STORAGE] [REQ-KAIZEN-FEEDBACK-MCP-WIRING]
# How: Composition boundary — shared INPUT/OUTPUT for all MCP procedures below.
Contract:
  INPUT: optional base_path (TIED project root); tool-specific JSON args validated at zod boundary
  OUTPUT: MCP JSON text content { ok, ... } | { ok: false, error }
  PRE: underlying Phase 4–7 modules already unit-tested; handlers stay server-side only
  POST: project REQ/ARCH/IMPL YAML indexes never mutated by handlers; feedback.yaml unchanged except where runOutcomeLoop module explicitly appends outcome context
  FAILURE_MODES: InvalidArgsJson, MissingProjectRoot, ModuleDelegationError, CanonicalWriteAttempt
  DATA: read feedback.yaml via loadFeedback; digest JSON passed inline for bridge
  DATA_TRANSITION: MCP args → module params → JSON serialization only
  EFFECTS: Async IO via delegated modules
  TERMINATION: total

procedure RESOLVE_PROJECT_ROOT(base_path):
  # [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-KAIZEN-FEEDBACK-MCP-WIRING]
  # How: Same resolution as Phase 1–2 feedback tools — base_path override or getBasePath().
  Contract:
    INPUT: optional base_path string
    OUTPUT: absolute projectRoot directory containing feedback.yaml
    PRE: when base_path set, path is readable directory
    POST: projectRoot equals normalized base_path or getBasePath()
    EFFECTS: pure
    TERMINATION: total
  IF base_path present AND trimmed non-empty:
    RETURN normalizeAbsolute(base_path)
  RETURN getBasePath()

procedure LOAD_FEEDBACK_FOR_MCP(projectRoot):
  # [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED] [REQ-KAIZEN-FEEDBACK-MCP-WIRING]
  # How: Delegate to feedback.ts loadFeedback (same as Phase 1–2 MCP tools).
  Contract:
    INPUT: projectRoot
    OUTPUT: FeedbackData { entries }
    PRE: projectRoot resolved
    POST: read-only load; file absent yields empty entries
    EFFECTS: IO read feedback.yaml
    TERMINATION: total
  RETURN loadFeedback(projectRoot)

procedure LOAD_ENTRIES_BY_ID(projectRoot):
  # [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-KAIZEN-FEEDBACK-MCP-WIRING]
  # How: loadFeedback(projectRoot) then build ReadonlyMap id → entry for bridge and outcome modules.
  Contract:
    INPUT: projectRoot
    OUTPUT: Map<string, FeedbackEntry>
    PRE: projectRoot resolved
    POST: every loaded entry.id is a map key
    EFFECTS: IO read feedback.yaml
    TERMINATION: total
  data = CALL LOAD_FEEDBACK_FOR_MCP(projectRoot)
  BUILD map from data.entries keyed by id
  RETURN map

procedure MCP_HANDLER_TIED_FEEDBACK_ANALYSIS_DIGEST(args):
  # [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [ARCH-KAIZEN-FEEDBACK-MCP-WIRING] [REQ-KAIZEN-FEEDBACK-MCP-WIRING] [REQ-KAIZEN-FEEDBACK-ANALYSIS]
  # How: Map MCP cohort/window/manifest args to BuildFeedbackDigestParams; delegate buildFeedbackDigest; return digest JSON and optional markdown.
  Contract:
    INPUT: MCP args { cohort, window?, denominator_manifest?, require_manifest_ref?, include_markdown?, base_path? }
    OUTPUT: JSON { ok, digest?, projection_hash?, markdown?, error? }
    PRE: zod validates cohort.compatibility_key and cohort.denominator_fingerprint non-empty
    POST: success returns feedback-analysis.v1 digest; storeMutation and canonicalWrite remain false
    FAILURE_MODES: InvalidArgsJson, ModuleDelegationError
    EFFECTS: Async; read-only on feedback store
    TERMINATION: total
  projectRoot = CALL RESOLVE_PROJECT_ROOT(args.base_path)
  params = map args to BuildFeedbackDigestParams with projectRoot, storeMutation false, canonicalWrite false
  result = CALL buildFeedbackDigest(params)
  IF NOT result.ok: RETURN JSON text content { ok: false, error: result.error }
  out = { ok: true, digest: result.digest, projection_hash: result.projection_hash }
  IF args.include_markdown not false AND result.markdown: out.markdown = result.markdown
  RETURN JSON text content out

procedure MCP_HANDLER_TIED_FEEDBACK_REVIEW_BRIDGE(args):
  # [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-KAIZEN-REVIEW-BRIDGE] [ARCH-KAIZEN-FEEDBACK-MCP-WIRING] [REQ-KAIZEN-FEEDBACK-MCP-WIRING] [REQ-KAIZEN-REVIEW-BRIDGE]
  # How: Parse digest object; load entries map; delegate runDigestReviewBridge; return proposal_link or structured error.
  Contract:
    INPUT: MCP args { digest, observation_group, review?, review_context?, base_path? }
    OUTPUT: JSON ReviewBridgeResult shape
    PRE: digest.schema_version is feedback-analysis.v1; observation_group non-empty
    POST: canonicalWrite false; feedback.yaml unchanged except existing promotion module paths on approve
    FAILURE_MODES: InvalidArgsJson, InvalidFinding, StaleEvidence, ReviewRequired, CanonicalWriteAttempt
    EFFECTS: Async; may append leap-proposals on approve path only via module
    TERMINATION: total
  IF digest missing or not object: RETURN { ok: false, error: InvalidArgsJson }
  projectRoot = CALL RESOLVE_PROJECT_ROOT(args.base_path)
  entriesById = CALL LOAD_ENTRIES_BY_ID(projectRoot)
  params = { digest, observation_group, review, review_context, projectRoot, entriesById, canonicalWrite: false }
  result = CALL runDigestReviewBridge(params)
  RETURN JSON text content result

procedure MCP_HANDLER_TIED_FEEDBACK_OUTCOME_RECORD(args):
  # [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN-FEEDBACK-MCP-WIRING] [REQ-KAIZEN-FEEDBACK-MCP-WIRING] [REQ-KAIZEN-OUTCOME-LOOP]
  # How: Parse outcome-observation payload and follow_up_window; delegate runOutcomeLoop.
  Contract:
    INPUT: MCP args { payload, follow_up_window, base_path? }
    OUTPUT: JSON OutcomeLoopResult shape
    PRE: payload.entry_id and follow_up_window bounds present
    POST: canonicalWrite false; module owns context.outcome_observations append semantics
    FAILURE_MODES: InvalidArgsJson, MissingBaseline, OutsideFollowUpWindow, ModuleDelegationError
    EFFECTS: Async; IO when module persists outcome observation
    TERMINATION: total
  IF payload or follow_up_window invalid: RETURN { ok: false, error: InvalidArgsJson }
  projectRoot = CALL RESOLVE_PROJECT_ROOT(args.base_path)
  entriesById = CALL LOAD_ENTRIES_BY_ID(projectRoot)
  params = { payload, follow_up_window, projectRoot, entriesById, canonicalWrite: false }
  result = CALL runOutcomeLoop(params)
  RETURN JSON text content result

procedure MCP_HANDLER_TIED_FEEDBACK_PILOT_RUN(args):
  # [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-KAIZEN-FEEDBACK-PILOT] [ARCH-KAIZEN-FEEDBACK-MCP-WIRING] [REQ-KAIZEN-FEEDBACK-MCP-WIRING] [REQ-KAIZEN-FEEDBACK-PILOT]
  # How: Parse PilotSpec; delegate runKaizenFeedbackPilot; return feedback-pilot.v1 report JSON.
  Contract:
    INPUT: MCP args { spec, pilot_incident_signals?, report_out_path?, base_path? }
    OUTPUT: JSON { ok, report?, stop_criteria?, error? }
    PRE: spec.cohort_id and spec.cohort.compatibility_key present
    POST: storeMutation and canonicalWrite false; optional report_out_path is export only
    FAILURE_MODES: InvalidArgsJson, InvalidPilotCohort, ModuleDelegationError
    EFFECTS: Async; read-only on feedback store unless report_out_path writes export file
    TERMINATION: total
  IF spec invalid: RETURN { ok: false, error: InvalidArgsJson }
  projectRoot = CALL RESOLVE_PROJECT_ROOT(args.base_path)
  params = { projectRoot, spec, pilot_incident_signals, report_out_path, canonicalWrite: false, storeMutation: false }
  result = CALL runKaizenFeedbackPilot(params)
  RETURN JSON text content result

procedure REGISTER_KAIZEN_FEEDBACK_MCP_TOOLS(allTools):
  # [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-KAIZEN-FEEDBACK-MCP-WIRING]
  # How: Append four tool definitions with zod inputSchema and handler closures to allTools export array in index.ts.
  Contract:
    INPUT: existing allTools array from tools/index.ts
    OUTPUT: allTools including tied_feedback_analysis_digest, tied_feedback_review_bridge, tied_feedback_outcome_record, tied_feedback_pilot_run
    PRE: tool names unique within registry
    POST: each handler delegates to matching MCP_HANDLER procedure above
    EFFECTS: module registration at server startup
    TERMINATION: total
  APPEND tool tied_feedback_analysis_digest with handler MCP_HANDLER_TIED_FEEDBACK_ANALYSIS_DIGEST
  APPEND tool tied_feedback_review_bridge with handler MCP_HANDLER_TIED_FEEDBACK_REVIEW_BRIDGE
  APPEND tool tied_feedback_outcome_record with handler MCP_HANDLER_TIED_FEEDBACK_OUTCOME_RECORD
  APPEND tool tied_feedback_pilot_run with handler MCP_HANDLER_TIED_FEEDBACK_PILOT_RUN
  RETURN allTools
