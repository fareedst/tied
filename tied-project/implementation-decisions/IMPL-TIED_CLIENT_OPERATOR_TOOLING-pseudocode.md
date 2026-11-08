# [IMPL-TIED_CLIENT_OPERATOR_TOOLING] [ARCH-TIED_CLIENT_OPERATOR_TOOLING] [REQ-TIED_CLIENT_OPERATOR_TOOLING]
# How: Merge tracker step pools for gate validation, normalize pseudocode paths, resolve semver without store cwd, reorder close-out reconcile.

procedure VALIDATE_TRACKER_MERGED_STEPS:
  # [IMPL-TIED_CLIENT_OPERATOR_TOOLING] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CLIENT_OPERATOR_TOOLING]
  Contract:
    INPUT: tracker YAML with steps and optional sub_procedures
    OUTPUT: disposition diagnostics for required slugs
    PRE: phase and depth from CITDP
    POST: sub_procedure slugs evaluated same as main steps
    EFFECTS: read-only
    TERMINATION: total
  CALL listChecklistTrackerSteps(tracker)
  FOR each required slug: validate disposition and evidence

procedure RESOLVE_PSEUDOCODE_PATH:
  # [IMPL-TIED_CLIENT_OPERATOR_TOOLING] [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] [REQ-TIED_CLIENT_OPERATOR_TOOLING]
  Contract:
    INPUT: userPath, TIED_BASE_PATH ending in tied-project/
    OUTPUT: absolute path under base
    PRE: base is tied-project root
    POST: tied-project/ prefix stripped before resolve
    EFFECTS: read-only filesystem
    TERMINATION: total
  normalized := stripLeadingProjectDir(userPath)
  RETURN resolveUnderBase(normalized, base)

procedure READ_METHODOLOGY_SEMVER:
  # [IMPL-TIED_CLIENT_OPERATOR_TOOLING] [REQ-TIED_SETUP] [REQ-REQUEST_EVIDENCE_ENVELOPE]
  Contract:
    INPUT: project_root, optional tied_base_path
    OUTPUT: semver string for methodology_snapshot_id
    PRE: at least one anchor root
    POST: semver from VERSION walk, install.json, or AGENTS.md
    EFFECTS: read-only
    FAILURE_MODES: missing all sources
    TERMINATION: total
  TRY install.json store_methodology_version FOR each anchor
  TRY ancestor VERSION FOR each anchor
  TRY AGENTS.md TIED Methodology Version line
  THROW if none

procedure RESOLVE_AGENTSTREAM_STORE_ROOT:
  # [IMPL-TIED_CLIENT_OPERATOR_TOOLING] [REQ-TIED_CLIENT_OPERATOR_TOOLING] [REQ-TIED_RUNTIME_DISK_CONFIG]
  Contract:
    INPUT: optional workspace (client project root); MCP runner module URL
    OUTPUT: store root path containing mcp-server/packages/agentstream/dist/index.js
    PRE: overrides ADHERENCE_RECONCILE_BIN / AGENTSTREAM_BIN handled by caller
    POST: store root exists and agentstream dist is present
    EFFECTS: read-only filesystem; optional bootstrap runtime introspection
    FAILURE_MODES: missing_dist
    TERMINATION: total
  TRY package self-anchor from MCP module path
  TRY process.env.TIED_STORE_ROOT when dist exists
  TRY resolveRuntimeIntrospection(workspace) from client mcp.json
  TRY monolithic AGENTS.md + mcp-server walk from workspace then cwd
  THROW operator build hint

procedure RUN_ADHERENCE_RECONCILE_SUBPROCESS:
  # [IMPL-TIED_CLIENT_OPERATOR_TOOLING] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  Contract:
    INPUT: ledger, tracker, gates_dir, workspace (client root)
    OUTPUT: read-only ReconcileReport JSON
    PRE: workspace is client project root for artifact paths
    POST: spawn cwd equals workspace; CLI argv uses store-resolved agentstream entry
    EFFECTS: subprocess IO
    TERMINATION: total
  CALL RESOLVE_AGENTSTREAM_STORE_ROOT(workspace)
  SPAWN node agentstream dist adherence-reconcile with cwd workspace
