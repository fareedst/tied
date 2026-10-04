# [IMPL-TIED_PROJECT_LINT] [ARCH-TIED_PROJECT_LINT_BOUNDARY] [REQ-TIED_PROJECT_LINT] — Read-only project lint aggregation MCP.

Grammar-Version: v2

## Project lint core

procedure RUN_PROJECT_LINT:
  # [IMPL-TIED_PROJECT_LINT] [ARCH-TIED_PROJECT_LINT_BOUNDARY] [REQ-TIED_PROJECT_LINT] How: compose index, consistency, optional CITDP DAE, optional pseudocode scopes under getBasePath without writes.
  Contract:
    INPUT: { scope?: string[], citdp?: object, include_pseudocode?: boolean }
    OUTPUT: { ok: boolean, sections: object, diagnostics: string[] }
    PRE: TIED_BASE_PATH resolves to tied-project directory
    POST: on success never mutates project YAML
    EFFECTS: pure
    TERMINATION: total
  FOR EACH index IN requirements, architecture, implementation, semantic-tokens
    CALL validateIndex(index)
  CALL validateConsistency with base path
  IF citdp present THEN CALL validateCitdpDaeSizingFields
  IF include_pseudocode AND scope non-empty THEN CALL pseudocode_validate per IMPL token
  RETURN aggregated report

procedure REGISTER_TIED_PROJECT_LINT_MCP:
  # [IMPL-TIED_PROJECT_LINT] [ARCH-TIED_PROJECT_LINT_BOUNDARY] [REQ-TIED_PROJECT_LINT] How: Zod schema + handler returning JSON textContent; never sets gate allowed.
  Contract:
    INPUT: MCP args
    OUTPUT: MCP text JSON payload
    PRE: tool name tied_project_lint
    POST: handler read-only
    EFFECTS: pure
  CALL RUN_PROJECT_LINT
  RETURN serialized JSON
