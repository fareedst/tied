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
  TRY ancestor VERSION FOR each anchor
  TRY install.json store_methodology_version
  TRY AGENTS.md TIED Methodology Version line
  THROW if none
