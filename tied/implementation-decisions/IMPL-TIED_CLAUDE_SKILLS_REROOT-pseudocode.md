# IMPL-TIED_CLAUDE_SKILLS_REROOT essence pseudocode

## PARSE_SKILLS_REROOT_ENV
# [IMPL-TIED_CLAUDE_SKILLS_REROOT] [ARCH-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_SKILLS_REROOT]
# How: Read TIED_SKILLS_REROOT from bootstrap env; default false.

procedure PARSE_SKILLS_REROOT_ENV(env):
  Contract:
    INPUT: env map
    OUTPUT: skills_reroot_enabled boolean
    PRE: env is readable map
    POST: true only when env TIED_SKILLS_REROOT in {1, true, yes}
    EFFECTS: Configuration State — parse bootstrap flag
    TERMINATION: total
  RETURN env.TIED_SKILLS_REROOT indicates enabled

## CONFIG_SKILLS_REROOT
# [IMPL-TIED_CLAUDE_SKILLS_REROOT] [ARCH-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
# How: Resolve managed skills install directory for cursor or claude harness; optional repo-root skills/ when flag on.

procedure CONFIG_SKILLS_REROOT(project_root, harness_profile, bootstrap_options):
  Contract:
    INPUT: project_root, harness_profile in { cursor, claude }, bootstrap_options.skills_reroot_enabled, bootstrap_options.windows_copy_proven_in_ci, bootstrap_options.tied_repo_root, optional skills_root
    OUTPUT: absolute skills_install_dir
    PRE: IF skills_reroot_enabled THEN windows_copy_proven_in_ci AND arch_skills_reroot_present(tied_repo_root)
    POST: disabled => .cursor/skills or .claude/skills; enabled => repo_root/skills (or skills_root) for both profiles
    FAILURE_MODES: REROOT_WITHOUT_WINDOWS_PROOF, REROOT_WITHOUT_ARCH
    EFFECTS: Configuration State — install destination selection
    TERMINATION: total
  IF NOT bootstrap_options.skills_reroot_enabled THEN
    RETURN default_skills_dir(project_root, harness_profile)
  IF NOT bootstrap_options.windows_copy_proven_in_ci THEN
    THROW REROOT_WITHOUT_WINDOWS_PROOF
  IF NOT arch_skills_reroot_present(bootstrap_options.tied_repo_root) THEN
    THROW REROOT_WITHOUT_ARCH
  RETURN bootstrap_options.skills_root OR (project_root / "skills")

## INSTALL_WITH_RESOLVED_SKILLS_ROOT
# [IMPL-TIED_CLAUDE_SKILLS_REROOT] [ARCH-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_SKILLS_REROOT]
# How: Cursor and Claude install functions receive resolved skills_install_dir from CONFIG_SKILLS_REROOT.

procedure INSTALL_WITH_RESOLVED_SKILLS_ROOT(project_root, paths, harness_profile, bootstrap_options):
  Contract:
    INPUT: project_root, paths, harness_profile, bootstrap_options
    OUTPUT: installed managed skills under resolved dir
    PRE: paths bundle sources complete
    POST: inventory matches harness profile at CONFIG_SKILLS_REROOT destination
    EFFECTS: Filesystem IO — copy or symlink skills tree
    TERMINATION: total
  skills_dir = CONFIG_SKILLS_REROOT(project_root, harness_profile, bootstrap_options)
  IF harness_profile == cursor THEN
    INSTALL_CURSOR_SKILLS_AT(project_root, paths, skills_dir)
  ELSE
    INSTALL_CLAUDE_SKILLS_AT(project_root, paths, skills_dir, bootstrap_options)

## ASSERT_WINDOWS_BOOTSTRAP_CLAUDE_REROOT
# [IMPL-TIED_CLAUDE_SKILLS_REROOT] [ARCH-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
# How: When skills_reroot_enabled, inventory under repo-root skills/; else legacy .claude/skills.

procedure ASSERT_WINDOWS_BOOTSTRAP_CLAUDE_REROOT(smoke_client_root, assert_options):
  # [IMPL-TIED_CLAUDE_SKILLS_REROOT] [ARCH-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_SKILLS_REROOT] How: Select skills root for Windows smoke inventory.
  Contract:
    INPUT: smoke_client_root, assert_options.skills_reroot_enabled
    OUTPUT: ok | fail with smoke message
    PRE: smoke_client_root exists
    POST: managed inventory and .mcp.json tied-yaml verified
    EFFECTS: Read-only filesystem inspection
    TERMINATION: total
  IF assert_options.skills_reroot_enabled THEN
    skills_root = smoke_client_root / "skills"
  ELSE
    skills_root = smoke_client_root / ".claude" / "skills"
  ASSERT managed inventory complete under skills_root
  ASSERT repo-root .mcp.json tied-yaml server present
