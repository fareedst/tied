# [IMPL-TIED_EDPC_ENGAGEMENT_FACET] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION] — Tracker engagement facet (edpc_full + easar_full alias)

Grammar-Version: v2

## Engagement validation

procedure VALIDATE_EDPC_ENGAGEMENT_FACET:
  # [IMPL-TIED_EDPC_ENGAGEMENT_FACET] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION] [REQ-TIED_EASAR_RECOVERY]
  # How: edpc_full and easar_full share acceptance rules; easar_full emits deprecation diagnostic; report_only rejects full engagement.
  Contract:
    INPUT: tracker
    OUTPUT: ok_diagnostics
    PRE: tracker may include brownfield_intent_elevation and edpc_engagement blocks
    POST: when engagement is edpc_full or easar_full, brownfield mode is pilot or strict
    EFFECTS: pure; append deprecated_engagement_alias when engagement is easar_full
    FAILURE_MODES: invalid_brownfield_engagement; full_engagement_requires_pilot_or_strict_mode
    TERMINATION: total
  CALL readBrownfieldIntentElevation(tracker)
  CALL readEdpcEngagement(tracker)
  IF engagement NOT IN (edpc_full, easar_full, empty) THEN RETURN error invalid_brownfield_engagement
  IF engagement IS easar_full THEN APPEND diagnostic deprecated_engagement_alias:easar_full
  IF engagement IN (edpc_full, easar_full) AND mode NOT IN (pilot, strict) THEN RETURN error full_engagement_requires_pilot_or_strict_mode
  RETURN ok_diagnostics

procedure EDPC_FULL_ENGAGEMENT_ACTIVE:
  # [IMPL-TIED_EDPC_ENGAGEMENT_FACET] [REQ-TIED_EDPC_COMPREHENSION]
  # How: True when engagement is edpc_full or deprecated easar_full alias.
  Contract:
    INPUT: tracker
    OUTPUT: active
    PRE: none
    POST: active iff engagement in (edpc_full, easar_full)
    EFFECTS: pure
    TERMINATION: total
  RETURN engagement IN (edpc_full, easar_full)

procedure MCP_TIED_EDPC_ENGAGEMENT_VALIDATE:
  # [IMPL-TIED_EDPC_ENGAGEMENT_FACET] [REQ-TIED_EDPC_COMPREHENSION]
  # How: MCP entry calling VALIDATE_EDPC_ENGAGEMENT_FACET on tracker payload or tracker_path.
  Contract:
    INPUT: tracker_or_path, project_root
    OUTPUT: validation_result
    PRE: tracker resolvable
    POST: same rules as VALIDATE_EDPC_ENGAGEMENT_FACET
    EFFECTS: read-only IO when path-based
    TERMINATION: total
  CALL VALIDATE_EDPC_ENGAGEMENT_FACET
  RETURN validation_result
