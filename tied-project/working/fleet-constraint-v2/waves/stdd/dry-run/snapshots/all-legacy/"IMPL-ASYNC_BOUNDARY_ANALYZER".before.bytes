# [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
# Summary: Layer C async_boundary static analysis pass with D7 gate promotion (W4).

procedure ASYNC_BOUNDARY_ANALYZER_MAIN():
  # [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
  # How: Opt-in Layer C pass validates declared async contract structure; no concurrency proof claims.
  Contract:
    INPUT: program, cfg, source, typed_flow flag, gate flags
    OUTPUT: AsyncBoundarySection
    PRE: parse pass succeeded; async_boundary input flag true when pass runs
    POST: diagnostics sorted deterministically; proof_boundary supplement states structural-only scope
    EFFECTS: pure
    TERMINATION: total
  1. CALL RUN_ASYNC_BOUNDARY_ANALYSIS with program, cfg, options
  2. IF async_gate_errors effective THEN CALL APPLY_ASYNC_GATE_SEVERITY_PROMOTION
  3. RETURN AsyncBoundarySection

procedure RUN_ASYNC_BOUNDARY_ANALYSIS(program, cfg, options):
  # [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
  # How: Scan each procedure body for seven W4 diagnostic codes.
  Contract:
    INPUT: program, cfg, options including source text
    OUTPUT: section
    PRE: program parsed
    POST: section.diagnostics capped by max_report_diagnostics
    EFFECTS: pure
    FAILURE_MODES: N/A
    TERMINATION: total
  1. FOR each procedure IN program.procedures:
  2.   EXTRACT body text from source via scanProcedureBlocks
  3.   IF EFFECTS includes Async AND no AWAIT/SEND/Promise OUTPUT/ASYNC_BOUNDARY THEN EMIT ASYNC_EFFECTS_WITHOUT_BOUNDARY warning
  4.   IF typed_flow is false AND AWAIT present AND OUTPUT not Promise THEN EMIT AWAIT_NON_PROMISE_OUTPUT warning
  5.   IF TIMEOUT row present AND linked FAILURE_MODE missing THEN EMIT MISSING_TIMEOUT_FAILURE_MODE warning
  6.   IF DATA present AND AWAIT count >= 2 AND no SEQUENCING/CONTROL ordering THEN EMIT SEQUENCING_UNDEFINED_SHARED_DATA warning
  7.   IF CALL callee with Async EFFECTS AND caller lacks AWAIT THEN EMIT CALL_ACROSS_ASYNC_BOUNDARY warning
  8.   IF RETRY row AND no IDEMPOTENCY THEN EMIT RETRY_WITHOUT_IDEMPOTENCY warning
  9.   IF open wait pattern AND no TERMINATION total/may_diverge THEN EMIT OPEN_WAIT_WITHOUT_TERMINATION warning
  10.  IF unresolved CALL callee THEN RECORD unknown unresolved_async_callee
  11. RETURN section sorted and capped

procedure APPLY_ASYNC_GATE_SEVERITY_PROMOTION(section, gate_mode, async_boundary, async_gate_errors):
  # [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
  # How: Mirror typed_gate_errors; default warn; explicit async_gate_errors true required (D7).
  Contract:
    INPUT: section, gate_mode, async_boundary, async_gate_errors
    OUTPUT: section with promoted severities
    PRE: async_boundary pass completed
    POST: only GATING_ASYNC_DIAGNOSTIC_CODES may become error
    EFFECTS: pure
    FAILURE_MODES: N/A
    TERMINATION: total
  1. IF gate_mode AND async_boundary AND async_gate_errors === true THEN
  2.   PROMOTE ASYNC_EFFECTS_WITHOUT_BOUNDARY diagnostics to error
  3. MAP promoted errors to top-level gate diagnostics via asyncGateDiagnosticsToAnalysis
  4. RETURN section

procedure ANALYZER_INTEGRATION(input):
  # [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
  # How: Run after typed-flow when async_boundary true; analyzer-off unchanged when flag false.
  Contract:
    INPUT: analyzeEssencePseudocode input
    OUTPUT: sections.async_boundary optional
    PRE: parse pass included
    POST: async_boundary section absent when flag false
    EFFECTS: pure
    TERMINATION: total
  1. IF input.async_boundary !== true THEN RETURN without async section
  2. RUN typed-flow first when typed_flow or constraint_flow enabled
  3. CALL RUN_ASYNC_BOUNDARY_ANALYSIS with typed_flow deferral for AWAIT_NON_PROMISE_OUTPUT
  4. APPEND ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT to proof_boundary
  5. IF async_gate_errors effective THEN APPEND ASYNC_GATE_ERRORS_PROOF_BOUNDARY_SUPPLEMENT
  6. RETURN sections

# Proof boundary (mandatory): Layer C async pass validates declared structure and type consistency only. It does not prove freedom from deadlock, livelock, or data races.
