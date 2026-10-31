# [IMPL-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [ARCH-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING] — Path 3 marker-only routing.

Grammar-Version: v2

## Summary contract
Contract:
  INPUT: process.cwd(), process.env, tied-project/config.yaml identity.routing
  OUTPUT: canonical tied-project writable root; BasePathResolutionMetadata
  PRE: config schema tied-project-config.v1 when present
  POST: marker_only uses marker writable_root unless env points at valid unremapped corpus
  FAILURE_MODES: invalid identity.routing enum rejected at config load
  EFFECTS: getBasePath cache; pure discovery reads marker file
  TERMINATION: total

procedure TRY_RESOLVE_MARKER_ONLY_BASE_FROM_CWD(cwd):
  # [IMPL-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [ARCH-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING] — How: Walk up to 12 parents for marker_only client config.
  Contract:
    PRE: cwd absolute
    OUTPUT: MarkerOnlyResolveResult or null
    EFFECTS: reads config.yaml and project-identity.v1.yaml
  FOR dir IN walkUp(cwd, MAX_WALK_DEPTH):
    IF config at tied-project/config.yaml AND readIdentityRoutingFromRecord == marker_only THEN
      IF marker readable AND requirements.yaml at marker.writable_root THEN RETURN marker root
      IF requirements.yaml at tied-project dir THEN RETURN tied-project bootstrap root
  RETURN null

procedure GET_BASE_PATH():
  # [IMPL-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [REQ-TIED_PROJECT_IDENTITY_WRITE_BINDING] — How: Path 3 branch before Path 2 env pick.
  Contract:
    PRE: cache may be empty
    POST: cachedBasePath set; lastBasePathResolution updated
  IF tryResolveMarkerOnlyBaseFromCwd AND env not valid unremapped corpus THEN
    cachedBasePath := marker writable_root
    lastBasePathResolution := marker_only metadata
    assertBindingAtStartup(cachedBasePath, env)
    RETURN cachedBasePath
  ELSE resolve env dual-read or discoverDefaultBasePath (Path 2)
  loadProjectConfig for routing_mode on env path branch

procedure TIED_CONFIG_GET_BASE_PATH():
  # [IMPL-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING] — How: Expose routing_mode, base_path_source, env_project_path_ignored.
  Contract:
    OUTPUT: JSON includes getBasePathResolutionMetadata fields
    EFFECTS: none beyond getBasePath side effects
