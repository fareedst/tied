# [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
# Fixture-gated Claude AgentDriver: CLI pin, stream/session oracles, live factory, live-executor composition.

Grammar-Version: v2

## PIN_CLAUDE_CLI_CONTRACT
# [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
# How: Record pinned Claude CLI version, permissions/env expectations, and MCP load notes that gate live checklist enablement and README operator docs.
# PRE: Parent Phase 0 gap list claude_cli_contract rows promoted into working/REQ-TIED_CLAUDE_LIVE_DRIVER/phase0/.
# POST: Contract artifact names pinned CLI + capture recipe; CI never requires live Claude subprocess.
# EFFECTS: Documentation State — README + fixtures/claude/README.md

procedure PIN_CLAUDE_CLI_CONTRACT(contract_draft, fixtures_readme_path):
  # [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] How: Persist pinned CLI version, permissions model, and capture command for Claude stream oracles.
  Contract:
    INPUT: contract_draft.cli_version, contract_draft.permissions_model, contract_draft.mcp_load_notes, fixtures_readme_path
    OUTPUT: pinned_contract | { error: CONTRACT_INCOMPLETE }
    PRE: fixtures directory path is mcp-server/packages/agentstream/fixtures/claude/ (locked)
    POST: success => pinned_contract.cli_version non-empty; capture recipe documented; proof_boundary includes no_live_claude_in_ci
    FAILURE_MODES: CONTRACT_INCOMPLETE
    DATA: pinned_contract
    DATA_TRANSITION: draft rows → version-pinned operator contract
    EFFECTS: Filesystem IO — write/update fixtures README and agentstream README pin section
    TERMINATION: total
  IF missing(contract_draft.cli_version) OR missing(contract_draft.capture_command) THEN
    RETURN { error: CONTRACT_INCOMPLETE }
  WRITE fixtures_readme_path with cli_version, capture_command, schema_notes, permissions_model, mcp_load_notes
  RECORD proof_boundary: no live Claude subprocess required in CI
  RETURN pinned_contract

## PARSE_CLAUDE_STREAM
# [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
# How: Oracle-driven parser for Claude NDJSON streams; separate from Cursor stream-json oracles.
# PRE: Frozen files under fixtures/claude/ (e.g. stream-assistant-basic.ndjson, stream-error-exit.ndjson).
# POST: Parsed events expose assistant/thinking content and failure/exit metadata without invoking live subprocess.
# EFFECTS: pure

procedure PARSE_CLAUDE_STREAM(oracle_bytes):
  # [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] How: Parse Claude stream oracle NDJSON into typed events and exit metadata.
  Contract:
    INPUT: oracle_bytes (frozen NDJSON)
    OUTPUT: { events[], exit_metadata } | { error: STREAM_SCHEMA_DRIFT | STREAM_PARSE_ERROR }
    PRE: oracle_bytes captured from pinned CLI version in PIN_CLAUDE_CLI_CONTRACT
    POST: success => events cover assistant and/or thinking content when present in oracle; exit_metadata populated for error oracles
    FAILURE_MODES: STREAM_SCHEMA_DRIFT, STREAM_PARSE_ERROR
    EFFECTS: pure
    TERMINATION: total
  events := []
  FOR EACH line IN split_ndjson(oracle_bytes) DO
    IF NOT valid_json(line) THEN
      RETURN { error: STREAM_PARSE_ERROR }
    event := map_claude_stream_line(line)
    IF event is unknown_shape THEN
      RETURN { error: STREAM_SCHEMA_DRIFT }
    APPEND event TO events
  RETURN { events, exit_metadata: derive_exit_metadata(events) }

## EXTRACT_CLAUDE_SESSION
# [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
# How: Extract session id / resume handle from Claude stream oracles for ChainFromPrevious semantics.
# PRE: Session oracle present (e.g. stream-session-id.ndjson).
# POST: Opaque session id available for resume; mismatch fails closed for composition tests.
# EFFECTS: pure

procedure EXTRACT_CLAUDE_SESSION(parsed_events):
  # [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] How: Pull session id from parsed Claude events for resume/chaining.
  Contract:
    INPUT: parsed_events from PARSE_CLAUDE_STREAM
    OUTPUT: session_id | { error: SESSION_ID_MISSING | SESSION_CHAIN_MISMATCH }
    PRE: parsed_events non-empty for session oracle fixtures
    POST: success => session_id opaque non-empty string suitable for --resume / ChainFromPrevious
    FAILURE_MODES: SESSION_ID_MISSING, SESSION_CHAIN_MISMATCH
    EFFECTS: pure
    TERMINATION: total
  session_id := find_session_id(parsed_events)
  IF session_id is empty THEN
    RETURN { error: SESSION_ID_MISSING }
  RETURN session_id

## CLAUDE_AGENT_DRIVER
# [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] [REQ-GOAGENT-AGENT-EXECUTOR]
# How: AgentDriver implementation for Claude: launch subprocess, parse stream, expose session/permissions/env, emit shared receipt shape.
# PRE: PIN_CLAUDE_CLI_CONTRACT satisfied; parsers unit-green against fixtures/claude/.
# POST: Shared receipt shape compatible with Cursor driver consumers; CI uses mocked launch boundary.
# EFFECTS: Process IO Async (live); pure when launch_fn is test double
# FAILURE_MODES: LIVE_WITHOUT_FIXTURE_PARITY; STREAM_SCHEMA_DRIFT; SESSION_CHAIN_BREAK; MCP_LOAD_FAILURE

procedure CLAUDE_AGENT_DRIVER_LAUNCH_AND_PARSE(turn_spec, launch_fn, pinned_contract):
  # [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] [REQ-GOAGENT-AGENT-EXECUTOR] How: Run one Claude turn via AgentDriver boundary with shared receipt.
  Contract:
    INPUT: turn_spec, launch_fn, pinned_contract
    OUTPUT: { events[], session_id, exit_metadata, receipt } | { error: LIVE_WITHOUT_FIXTURE_PARITY | STREAM_SCHEMA_DRIFT | SESSION_CHAIN_BREAK | MCP_LOAD_FAILURE }
    PRE: fixture_gates_passed OR launch_fn is test_double; pinned_contract.cli_version set
    POST: success => receipt matches shared AgentDriver receipt shape used by Cursor path
    DATA: driver_state.session_id, driver_state.permissions, driver_state.env
    DATA_TRANSITION: empty session → session_id after successful parse
    EFFECTS: Process IO Async when launch_fn is real subprocess; pure when mocked
    ASYNC_BOUNDARY: stream
    FAILURE_MODES: LIVE_WITHOUT_FIXTURE_PARITY, STREAM_SCHEMA_DRIFT, SESSION_CHAIN_BREAK, MCP_LOAD_FAILURE
    TERMINATION: may_diverge — bounded by turn timeout policy from REQ-GOAGENT-AGENT-EXECUTOR
  IF NOT fixture_gates_passed AND launch_fn is real_subprocess THEN
    RETURN { error: LIVE_WITHOUT_FIXTURE_PARITY }
  raw := launch_fn(turn_spec, pinned_contract)
  parsed := PARSE_CLAUDE_STREAM(raw.stdout_or_oracle)
  IF parsed is error THEN
    RETURN parsed
  session_id := EXTRACT_CLAUDE_SESSION(parsed.events)
  IF session_id is error AND turn_spec.requires_session THEN
    RETURN { error: SESSION_CHAIN_BREAK }
  receipt := build_shared_receipt(parsed.events, session_id, parsed.exit_metadata)
  RETURN { events: parsed.events, session_id, exit_metadata: parsed.exit_metadata, receipt }

## SELECT_LIVE_DRIVER
# [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_HARNESS] [REQ-GOAGENT-AGENT-EXECUTOR]
# How: Factory from harness profile to live AgentDriver; never treat --agent-path as harness selection.
# PRE: Parent SELECT_AGENT_HARNESS resolves profile in { cursor, claude, dry_run }.
# POST: claude → Claude AgentDriver; cursor → existing Cursor live driver; dry_run → no live driver.
# EFFECTS: pure

procedure SELECT_LIVE_DRIVER(harness_profile, agent_path):
  # [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_HARNESS] How: Map harness profile to live driver factory; ignore agent_path for harness choice.
  Contract:
    INPUT: harness_profile, agent_path
    OUTPUT: { driver_kind: cursor | claude | none, agent_path_override } | { error: AGENT_PATH_MISUSED_AS_HARNESS }
    PRE: harness_profile from SELECT_AGENT_HARNESS (parent); agent_path is Cursor executable override only
    POST: success => driver_kind selected solely from harness_profile; agent_path never selects claude
    FAILURE_MODES: AGENT_PATH_MISUSED_AS_HARNESS
    EFFECTS: pure
    TERMINATION: total
  IF agent_path equals "claude" AND harness_profile != claude THEN
    # How: Reject conflation — agent_path string must not imply Claude harness.
    NOTE: still return cursor/none based on harness_profile; tests assert agent_path does not flip driver_kind
  IF harness_profile == claude THEN
    RETURN { driver_kind: claude, agent_path_override: null }
  IF harness_profile == dry_run THEN
    RETURN { driver_kind: none, agent_path_override: null }
  RETURN { driver_kind: cursor, agent_path_override: agent_path }

## BIND_LIVE_EXECUTOR_CLAUDE
# [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] [REQ-GOAGENT-AGENT-EXECUTOR]
# How: Compose live-executor so harness=claude uses CLAUDE_AGENT_DRIVER; Cursor path unchanged for harness=cursor.
# PRE: SELECT_LIVE_DRIVER and CLAUDE_AGENT_DRIVER unit-green; dry-run SELECT_AGENT_HARNESS regression green.
# POST: Composition tests with mocked subprocess assert shared receipt; Cursor binding unmodified.
# EFFECTS: Composition wiring — live-executor factory binding only

procedure BIND_LIVE_EXECUTOR_CLAUDE(live_executor, harness_profile, launch_fn):
  # [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER] [REQ-GOAGENT-AGENT-EXECUTOR] How: Bind live-executor to Claude or Cursor driver per harness profile.
  Contract:
    INPUT: live_executor, harness_profile, launch_fn
    OUTPUT: bound_executor | { error: DRIVER_BIND_FAILURE }
    PRE: SELECT_LIVE_DRIVER available; Cursor driver module unchanged for cursor profile
    POST: success => harness=claude routes to CLAUDE_AGENT_DRIVER_LAUNCH_AND_PARSE; harness=cursor routes to existing Cursor path
    FAILURE_MODES: DRIVER_BIND_FAILURE
    DATA: live_executor.driver_binding
    DATA_TRANSITION: unbound → harness-specific driver binding
    EFFECTS: State — composition binding only (no CLI subprocess in unit/composition CI)
    TERMINATION: total
  selection := SELECT_LIVE_DRIVER(harness_profile, live_executor.agent_path)
  IF selection.driver_kind == claude THEN
    live_executor.driver_binding := CLAUDE_AGENT_DRIVER with launch_fn
  ELSE IF selection.driver_kind == cursor THEN
    live_executor.driver_binding := existing_cursor_live_driver with selection.agent_path_override
  ELSE
    live_executor.driver_binding := none
  IF live_executor.driver_binding is invalid THEN
    RETURN { error: DRIVER_BIND_FAILURE }
  RETURN bound_executor: live_executor
