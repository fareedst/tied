# [IMPL-TIED_EDPC_ORCHESTRATION] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION] — deterministic workflow A–G routing

Grammar-Version: v2

## Route table

procedure TIED_EDPC_WORKFLOW_ROUTE:
  # [IMPL-TIED_EDPC_ORCHESTRATION] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
  # How: Map question_class to ordered workflow ids; strip D/E when tier is source_static; stable JSON sort.
  Contract:
    INPUT: question_class, evidence_access_tier
    OUTPUT: route_json
    PRE: question_class non-empty string
    POST: route_json.workflows is deterministic list; D and E absent when tier is source_static
    EFFECTS: pure
    FAILURE_MODES: unknown_question_class
    TERMINATION: total
  CALL lookupRouteTable(question_class)
  IF route IS unknown THEN CALL defaultRoute B_then_C_then_F
  IF evidence_access_tier IS source_static THEN CALL stripWorkflows(route, (D, E))
  CALL stableSortWorkflowIds(route)
  RETURN route_json

procedure LOOKUP_ROUTE_TABLE:
  # [IMPL-TIED_EDPC_ORCHESTRATION] [REQ-TIED_EDPC_COMPREHENSION]
  # How: Golden routes from EDPC methodology examples (module comprehension, replacement safety).
  Contract:
    INPUT: question_class
    OUTPUT: workflows
    PRE: none
    POST: module_comprehension -> B, C, F; replacement_safety -> B, C, E, D, F before tier strip
    EFFECTS: pure
    TERMINATION: total
  SWITCH question_class
    CASE module_comprehension: RETURN (B, C, F)
    CASE replacement_safety: RETURN (B, C, E, D, F)
    DEFAULT: RETURN unknown

procedure MCP_TIED_EDPC_WORKFLOW_ROUTE:
  # [IMPL-TIED_EDPC_ORCHESTRATION] [REQ-TIED_EDPC_COMPREHENSION]
  # How: MCP wrapper exposing TIED_EDPC_WORKFLOW_ROUTE with JSON schema validation on inputs.
  Contract:
    INPUT: question_class, evidence_access_tier
    OUTPUT: route_result
    PRE: evidence_access_tier valid tier enum
    POST: route_result matches TIED_EDPC_WORKFLOW_ROUTE
    EFFECTS: pure
    TERMINATION: total
  CALL TIED_EDPC_WORKFLOW_ROUTE
  RETURN route_result
