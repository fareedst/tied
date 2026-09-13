# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — delegate onboarding commands without duplicating orchestration.
Contract:
  INPUT: argv: list where length(argv) >= 0; environment; project_root: string where length(project_root) > 0
  PRE: argv is parsed and project_root is addressable
  OUTPUT: onboarding_result | readiness_diagnostic
  POST: delegated modules own lifecycle, persistence, readiness, and execution semantics
  FAILURE_MODES: UNKNOWN_COMMAND, MISSING_PREREQUISITE, DELEGATE_FAILURE
  DATA: command request and delegated result
  EFFECTS: IO
  TERMINATION: total

## DISPATCH_ONBOARDING_COMMAND
procedure DISPATCH_ONBOARDING_COMMAND(argv, environment, project_root):
  Contract:
    INPUT: argv: list where length(argv) >= 0; environment; project_root: string where length(project_root) > 0
    PRE: argv is parsed and project_root is addressable
    OUTPUT: onboarding_result | readiness_diagnostic
    POST: delegated modules own lifecycle, persistence, readiness, and execution semantics
    FAILURE_MODES: UNKNOWN_COMMAND; MISSING_PREREQUISITE; DELEGATE_FAILURE
    DATA_TRANSITION: configuration remains unchanged unless an explicit delegated create/init path succeeds; readiness diagnostics never mutate project state
    EFFECTS: IO
    TERMINATION: total

# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — classify the safe top-level command and route it to one validated delegate.
  # [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — route one command to one validated delegate.
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
procedure REPORT_ADVANCED_PATHS():
  Contract:
    INPUT: (none)
    PRE: reference catalog is available
    OUTPUT: advanced_paths_report
    POST: report lists tied-cli, TIED YAML MCP, agentstream, and manual/offline references without mutation
    DATA_TRANSITION: no project or configuration mutation; only reference paths are returned
    EFFECTS: pure
    TERMINATION: total

# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ADOPTION_GUIDANCE] — keep direct TIED and agentstream surfaces discoverable rather than replacing them.
  # [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ADOPTION_GUIDANCE] — expose direct tooling and offline references.
  Return tied-cli, TIED YAML MCP, agentstream, and manual/offline references.

## MAIN_ONBOARDING
procedure MAIN_ONBOARDING(argv):
  Contract:
    INPUT: argv: list where length(argv) >= 0
    PRE: argv is parsed from process arguments
    OUTPUT: process exit status and JSON on stdout
    POST: stdout contains the delegated onboarding_result or readiness_diagnostic JSON
    DATA_TRANSITION: no configuration mutation; only JSON output and process exit status change
    EFFECTS: IO
    TERMINATION: total

# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — emit JSON and exit without mutating configuration when an offline fallback is actionable.
  # [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — treat actionable fallback as a successful demo/operator handoff exit.
  result := DISPATCH_ONBOARDING_COMMAND(argv, project_root)
  Write result JSON to stdout.
  IF result.ok OR result.fallback is present: exit 0.
  ELSE: exit 1.
