# [IMPL-FEAT_ORCHESTRATION_MCP] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE]

## Summary contract
# [IMPL-FEAT_ORCHESTRATION_MCP] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: provide parallel MCP handlers while delegating canonical TIED YAML work to existing tooling.
Contract:
  INPUT: MCP tool request
  PRE: request names a supported orchestration operation
  OUTPUT: orchestration result
  POST: feature-local changes use the orchestration store; canonical token changes use existing TIED YAML tools
  FAILURE_MODES: UNKNOWN_TOOL; INVALID_INPUT; DELEGATED_YAML_ERROR; SERVICE_ERROR
  EFFECTS: IO, State
  TERMINATION: total

## HANDLE_ORCHESTRATION_TOOL
# [IMPL-FEAT_ORCHESTRATION_MCP] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: route requests to shared services and preserve one canonical YAML validation path.
procedure HANDLE_ORCHESTRATION_TOOL(tool_name, request):
  # [IMPL-FEAT_ORCHESTRATION_MCP] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: route requests to shared services and preserve one canonical YAML validation path.
  Validate the tool name and request shape.
  IF the operation is feature-local: invoke the shared orchestration service.
  IF the operation creates or updates REQ, ARCH, or IMPL records:
    Delegate CRUD to the existing TIED YAML tooling.
    Delegate consistency validation to the existing TIED validation tool.
  Return the shared orchestration result schema.
