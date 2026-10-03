# [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] — Blueprint D harness tool safety gating.

Grammar-Version: v2

## Configuration

procedure RESOLVE_HARNESS_SAFETY_CONFIG:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] How: reuse resolveJevHarnessConfig / AGENTSTREAM_JEV_HARNESS and jev.agentstream_harness; blockWhenUnavailable true for blocking tools.
  Contract:
    INPUT: env map, optional manifest jev.agentstream_harness
    OUTPUT: JevHarnessConfig { enabled, hasApiKey, blockWhenUnavailable }
    PRE: true
    POST: enabled false when env and manifest unset
    EFFECTS: pure
  CALL resolveJevHarnessConfig
  RETURN config

procedure NORMALIZE_TOOL_SAFETY_INPUT:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] How: cap goal/context/arguments; optional workspace for scope derivation; redact secrets before vendor state.
  Contract:
    INPUT: HarnessToolCallInput { tool, arguments?, goal?, context?, workspace? }
    OUTPUT: normalized args string, bounded excerpts, workspace_root or absent
    PRE: tool is string
    POST: argument slice <= policy max
    EFFECTS: pure
  SLICE and redact fields
  RETURN normalized bundle

procedure MATCH_DESTRUCTIVE_COMMAND:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] How: deterministic regex catalog (rm -rf, drop table, git push --force, mkfs, etc.) before any Jev call.
  Contract:
    INPUT: command arguments string
    OUTPUT: { matched: boolean, pattern_id? }
    PRE: true
    POST: matched implies block destructive_pattern without Jev
    EFFECTS: pure
  TEST DESTRUCTIVE_PATTERNS list
  RETURN match result

procedure DERIVE_WORKSPACE_SCOPE_SIGNAL:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] How: normalize explicit path tokens vs declared workspace; emit scope_class in_scope | out_of_scope | unknown | not_evaluated; never send raw absolute workspace to vendor.
  Contract:
    INPUT: arguments string, workspace path optional
    OUTPUT: { scope_class, scope_features[] } for Jev state placeholder workspace
    PRE: proof boundary excludes shell expansion semantics
    POST: missing workspace → not_evaluated
    EFFECTS: pure
  PARSE explicit path signals
  COMPARE against normalized workspace root
  RETURN scope signal

procedure RUN_HARNESS_SAFETY_FANOUT:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_TOOL_SAFETY_GATING] How: one jevDecide with noul_destructive_risk and noul_scope_violation taxonomy wording; contextMeta feature tool_safety_gating.
  Contract:
    INPUT: redacted state, jevConfig with contextMeta
    OUTPUT: destructive noul, scope noul, or skip/error observation
    PRE: blocking tool and harness enabled and pattern not matched
    POST: on skip/error caller applies fail-closed for blocking tools
    FAILURE_MODES: no_credentials, http_error, malformed_answers, state_too_large
    EFFECTS: Http | Async
  BUILD buildBlueprintDQuestions()
  CALL jevDecide(state, questions, config)

procedure APPLY_HARNESS_RISK_THRESHOLDS:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] How: combined = max(destructive, scope); block >= 0.72; confirm 0.45 <= combined < 0.72; allow < 0.45; report risk as combined.
  Contract:
    INPUT: parsed nouls
    OUTPUT: HarnessToolDecision allow | confirm | block
    PRE: thresholds pinned in code
    EFFECTS: pure
  COMPUTE combined max
  MAP to decision bands

procedure EMIT_HARNESS_DECISION:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] How: HarnessToolEvaluation with reason codes jev_allow, jev_needs_confirm, jev_high_risk, destructive_pattern, jev_unavailable_fail_closed.
  Contract:
    INPUT: decision, risk, reason, flags
    OUTPUT: HarnessToolEvaluation
    PRE: true
    POST: never mutates TIED YAML or executes command
    EFFECTS: pure
  BUILD evaluation record

procedure APPEND_TOOL_SAFETY_TRACE:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: opt-in JEV_DECIDE_TRACE via jevDecide; redacted state; context_meta.feature tool_safety_gating.
  Contract:
    INPUT: jevDecide result, trace env
    OUTPUT: optional JSONL line system-one-decide-trace.v1
    PRE: trace env enabled
    POST: no API keys or raw workspace in record
    EFFECTS: file append when enabled

procedure BUILD_TOOL_SAFETY_DIAGNOSTIC:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] How: tied_jev_tool_safety_evaluate MCP adapter; requires workspace; returns decision diagnostics only.
  Contract:
    INPUT: tool proposal, workspace required, harness policy from env
    OUTPUT: JSON { decision, risk, reason, scope, pattern, jev_observation? }
    PRE: workspace non-empty
    POST: response excludes allowed gate receipt
    EFFECTS: pure evaluation

procedure BIND_WORKSPACE_TO_LIVE_GATE:
  # [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [ARCH-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: evaluateStreamToolProposal passes resolveProjectRootForJev(cfg) as workspace into evaluateHarnessToolCall for Cursor and Claude paths.
  Contract:
    INPUT: DryRunConfig workspace, StreamToolProposal
    OUTPUT: gate evaluation with scope evaluated when workspace present
    PRE: harness opt-in active
    POST: block/confirm/dist semantics unchanged from W5
    EFFECTS: Async gate chain on stream lines
