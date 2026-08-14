# [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS]

## Summary contract
# [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS] — resolve local defaults deterministically without writing configuration.
Contract:
  INPUT: explicit_options, environment, project_root
  PRE: project_root is addressable
  OUTPUT: resolved_defaults | readiness_diagnostic
  POST: resolved values identify their source and no configuration is persisted
  FAILURE_MODES: MISSING_PROJECT_ROOT, AMBIGUOUS_DEFAULT, INVALID_PATH
  DATA: candidate paths and selected defaults
  DATA_TRANSITION: configuration remains unchanged; only an in-memory resolution is returned
  EFFECTS: IO
  TERMINATION: total

## RESOLVE_LOCAL_DEFAULTS
# [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS] — apply explicit-over-environment-over-local precedence and preserve configuration ownership.
procedure RESOLVE_LOCAL_DEFAULTS(explicit_options, environment, project_root):
  # [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS] — apply precedence and return diagnostics without mutation.
  DATA_TRANSITION: configuration remains unchanged; only an in-memory resolution is returned.
  Resolve TIED_MCP_BIN from explicit option, then TIED_MCP_BIN, then local mcp-server/dist/index.js.
  Resolve TIED_BASE_PATH from explicit option, then TIED_BASE_PATH, then project_root/tied.
  Resolve constitution as TIED_BASE_PATH/constitution.yaml.
  Resolve feature directory as TIED_BASE_PATH/features.
  Validate every selected path and record its source.
  IF a required path is missing or ambiguous: RETURN a readiness diagnostic with corrective command.
  RETURN resolved defaults without mutation.

## FORMAT_DEFAULT_SOURCE_REPORT
# [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS] — make implicit discovery visible and reproducible.
procedure FORMAT_DEFAULT_SOURCE_REPORT(resolved_defaults):
  # [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS] — expose source and corrective-command fields.
  Return stable path, source, existence, and corrective-command fields.
