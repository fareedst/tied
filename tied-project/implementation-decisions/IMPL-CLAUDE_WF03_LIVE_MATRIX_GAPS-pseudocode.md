# [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS] [ARCH-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS]

Grammar-Version: v2

## Canonical MCP validation (Pillar E)

- [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS] [ARCH-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-TIED_CLI_MCP_JSON_BASE_PATH] Align harness contract with pickClientProjectPath and resolveTiedLayout tied-project paths.
procedure ASSERT_MCP_JSON_HARNESS_CONTRACT:
  Contract:
    INPUT: clientDir, expectedHarness default claude
    PRE: .mcp.json exists or parse error returned
    OUTPUT: ok boolean + detail
    POST: ok true => TIED_MCP_HARNESS matches and pickClientProjectPath env equals resolveTiedLayout(clientDir).tiedDir
    FAILURE_MODES: parse error, harness mismatch, path missing, path mismatch
    EFFECTS: IO read mcp json
    TERMINATION: total
  READ .mcp.json tied-yaml env
  IF TIED_MCP_HARNESS != expectedHarness THEN RETURN fail harness
  configured := pickClientProjectPath(env)
  IF configured empty THEN RETURN fail missing client project path env
  expected := jsonSafeAbsolute(resolveTiedLayout(clientDir).tiedDir)
  IF jsonSafeAbsolute(configured) != expected THEN RETURN fail mismatch
  RETURN ok

## Strict preflight (Pillar F)

- [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS] [ARCH-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] Orchestrator policy after validation script exit code.
procedure WF_TRIAL_HANDLE_CLAUDE_VALIDATION_EXIT:
  Contract:
    INPUT: validationExitCode
    PRE: HARNESS is claude and dry_run is false
    OUTPUT: shell exit status for orchestrator
    POST: validationExitCode 0 => RETURN 0; nonzero and WF_TRIAL_STRICT_PREFLIGHT set => RETURN 1; nonzero default => DIAGNOSTIC and RETURN 0
    EFFECTS: stderr DIAGNOSTIC on advisory path
    TERMINATION: total
  IF validationExitCode equals 0 THEN RETURN 0
  IF env WF_TRIAL_STRICT_PREFLIGHT is non-empty and not "0" THEN RETURN 1
  EMIT DIAGNOSTIC continuing may weaken MCP parity
  RETURN 0

## Close-out playbook (Pillar G)

- [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS] [ARCH-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] Document operator sequence in four-phase batch close-out turn (docs only this REQ).
procedure CLOSE_OUT_PLAYBOOK_HINTS:
  Contract:
    INPUT: none
    OUTPUT: batch goal text for turn 4
    POST: text mentions tied_gate_check with citdp_path and request evidence envelope before close_out
    EFFECTS: none
    TERMINATION: total
  RETURN documented strings in traditional-four-phase-agentstream.yaml

## Claude spawn cwd (Pillar H)

- [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS] [ARCH-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-TIED_CLAUDE_LIVE_DRIVER] BIND_LIVE_EXECUTOR_CLAUDE passes agentstream workspace into collectClaudeStreamFromSpawn spawnCwd (existing seam; regression via live-driver-bind tests).
