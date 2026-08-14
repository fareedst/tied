# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS]

## Summary contract
# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — delegate onboarding commands without duplicating orchestration.
Contract:
  INPUT: argv, environment, project_root
  PRE: argv is parsed and project_root is addressable
  OUTPUT: onboarding_result | readiness_diagnostic
  POST: delegated modules own lifecycle, persistence, readiness, and execution semantics
  FAILURE_MODES: UNKNOWN_COMMAND, MISSING_PREREQUISITE, DELEGATE_FAILURE
  DATA: command request and delegated result
  EFFECTS: IO
  TERMINATION: total

## DISPATCH_ONBOARDING_COMMAND
# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — classify the safe top-level command and route it to one validated delegate.
procedure DISPATCH_ONBOARDING_COMMAND(argv, environment, project_root):
  # [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — route one command to one validated delegate.
  DATA_TRANSITION: configuration remains unchanged unless an explicit delegated create/init path succeeds; readiness diagnostics never mutate project state.
  Resolve argv to tied init, tied feature new, or tied feature build.
  IF command is unknown: RETURN UNKNOWN_COMMAND with corrective usage.
  Resolve local defaults without persisting them.
  IF Node or MCP capability is missing: RETURN readiness diagnostic with
    selectOfflinePath fallback and explicit using-tied-without-mcp.md reference;
    mutated_configuration remains false.
  IF local defaults are missing (for example TIED_MCP_BIN absent): RETURN readiness
    diagnostic merging defaults.diagnostics with selectOfflinePath fallback and an
    explicit corrective path to using-tied-without-mcp.md; mutated_configuration
    remains false.
  Delegate tied init to the existing bootstrap boundary.
  Delegate tied feature new to feature creation and manifest store modules.
  Delegate tied feature build to readiness, task graph, view, and agentstream adapters.
  Return delegated result and next corrective action.

## REPORT_ADVANCED_PATHS
# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ADOPTION_GUIDANCE] — keep direct TIED and agentstream surfaces discoverable rather than replacing them.
procedure REPORT_ADVANCED_PATHS():
  # [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ADOPTION_GUIDANCE] — expose direct tooling and offline references.
  DATA_TRANSITION: no project or configuration mutation; only reference paths are returned.
  Return tied-cli, TIED YAML MCP, agentstream, and manual/offline references.

## MAIN_ONBOARDING
# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — emit JSON and exit without mutating configuration when an offline fallback is actionable.
procedure MAIN_ONBOARDING(argv):
  # [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — treat actionable fallback as a successful demo/operator handoff exit.
  PRE: argv is parsed from process arguments
  POST: stdout contains the delegated onboarding_result or readiness_diagnostic JSON
  DATA_TRANSITION: no configuration mutation; only JSON output and process exit status change.
  EFFECTS: IO
  TERMINATION: total
  result := DISPATCH_ONBOARDING_COMMAND(argv, project_root)
  Write result JSON to stdout.
  IF result.ok OR result.fallback is present: exit 0.
  ELSE: exit 1.
