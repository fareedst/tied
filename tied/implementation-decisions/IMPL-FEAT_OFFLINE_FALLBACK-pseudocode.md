# [IMPL-FEAT_OFFLINE_FALLBACK] [ARCH-FEAT_OFFLINE_COMPATIBILITY] [REQ-FEAT_OFFLINE_WORKFLOW_PRESERVATION]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_OFFLINE_FALLBACK] [ARCH-FEAT_OFFLINE_COMPATIBILITY] [REQ-FEAT_OFFLINE_WORKFLOW_PRESERVATION] — preserve explicit tooling when onboarding prerequisites are unavailable.
Contract:
  INPUT: capability_probe; project_root: string where length(project_root) > 0
  PRE: capability_probe is available
  OUTPUT: onboarding_path
  POST: selected path is explicit and no configuration or project data is changed
  FAILURE_MODES: PROBE_FAILURE, NO_DOCUMENTED_PATH
  DATA: capability results and fallback references
  DATA_TRANSITION: capability and project data remain unchanged; only a path report is returned
  EFFECTS: IO
  TERMINATION: total

## SELECT_OFFLINE_PATH
procedure SELECT_OFFLINE_PATH(capability_probe, project_root):
  Contract:
    INPUT: capability_probe; project_root: string where length(project_root) > 0
    PRE: capability_probe is available
    OUTPUT: onboarding_path
    POST: selected path is explicit and no configuration or project data is changed
    FAILURE_MODES: PROBE_FAILURE; NO_DOCUMENTED_PATH
    DATA_TRANSITION: capability and project data remain unchanged; only a path report is returned
    EFFECTS: IO
    TERMINATION: total

# [IMPL-FEAT_OFFLINE_FALLBACK] [ARCH-FEAT_OFFLINE_COMPATIBILITY] [REQ-FEAT_OFFLINE_WORKFLOW_PRESERVATION] — choose the strongest available explicit path without replacing established tools.
  # [IMPL-FEAT_OFFLINE_FALLBACK] [ARCH-FEAT_OFFLINE_COMPATIBILITY] [REQ-FEAT_OFFLINE_WORKFLOW_PRESERVATION] — select an explicit path without mutation.
  IF feature-orchestrator is available: RETURN primary onboarding path.
  IF tied-cli and Node are available: RETURN tied-cli path with exact invocation.
  IF Node or MCP is unavailable: RETURN using-tied-without-mcp.md manual path.
  Include direct TIED YAML MCP and agentstream references in every fallback report.
  RETURN path without mutation.
