# [IMPL-TIED_BOUNDED_AGENTSTREAM_SEAM] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] [REQ-FEAT_AGENTSTREAM_ADAPTER] [REQ-GOAGENT-AGENT-EXECUTOR]
# Injectable client-owned AgentDriver seam preserving built-in cursor/claude/dry_run profiles.

Grammar-Version: v2

## Client AgentDriver binding

- [IMPL-TIED_BOUNDED_AGENTSTREAM_SEAM] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] Formalizes injectable driver factory; built-in profiles unchanged; OEE ref required for external descriptors.
- Contract:
  - INPUT: schedule context, driver descriptor or built-in profile id, dry_run flag, provenance carry-forward refs
  - PRE: descriptor names adapter_id, OEE compatibility reference, licensing and network assumptions when live; built-in profiles limited to cursor, claude, dry_run
  - OUTPUT: driver session handle with trajectory provenance hooks | error InvalidDriverContract | error LiveExternalNotApproved
  - POST:
    - on success: scheduled turns map to injected or built-in driver; dry-run/live schedule parity preserved; legacy feature-spec ordering preserved; failure/cancel/timeout stops dependents
    - on success: trajectory manifest capture may receive session and provenance refs
  - FAILURE_MODES: InvalidDriverContract, LiveExternalNotApproved, DriverLaunchFailure
  - EFFECTS: IO, Async
  - TERMINATION: total

procedure BIND_CLIENT_AGENT_DRIVER(schedule, driver_request):
  # [IMPL-TIED_BOUNDED_AGENTSTREAM_SEAM] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] How: bind task graph turns to injectable AgentDriver without adopting external binaries in methodology repo.
  Contract:
    INPUT: feature orchestration schedule, driver request (built-in profile or client descriptor)
    OUTPUT: bound driver session | error InvalidDriverContract | error LiveExternalNotApproved
    PRE: C2 deferral; methodology repository excludes external executor binaries (OpenCode, Codex)
    POST: built-in cursor, claude, and dry_run profiles retain existing harness behavior if chosen
    FAILURE_MODES: InvalidDriverContract, LiveExternalNotApproved, DriverLaunchFailure
    EFFECTS: IO, Async
    TERMINATION: total
  IF driver_request is built-in profile: validate profile in {cursor, claude, dry_run}; bind live-driver-bind factory
  IF driver_request is client descriptor: validate adapter_id and OEE ref; reject missing compatibility ledger reference
  IF live external execution requested without operator approval: RETURN error LiveExternalNotApproved
  launch or simulate driver per dry_run flag
  carry session and provenance refs into trajectory manifest capture hook
  ON cancel OR timeout OR stale input: stop dependent schedule nodes
  RETURN bound driver session
