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
  Resolve argv to tied init, tied feature new, or tied feature build.
  IF command is unknown: RETURN UNKNOWN_COMMAND with corrective usage.
  Resolve local defaults without persisting them.
  IF prerequisites are missing: RETURN readiness diagnostic.
  Delegate tied init to the existing bootstrap boundary.
  Delegate tied feature new to feature creation and manifest store modules.
  Delegate tied feature build to readiness, task graph, view, and agentstream adapters.
  Return delegated result and next corrective action.

## REPORT_ADVANCED_PATHS
# [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ADOPTION_GUIDANCE] — keep direct TIED and agentstream surfaces discoverable rather than replacing them.
procedure REPORT_ADVANCED_PATHS():
  # [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ADOPTION_GUIDANCE] — expose direct tooling and offline references.
  Return tied-cli, TIED YAML MCP, agentstream, and manual/offline references.
