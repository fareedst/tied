# [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
# Windows CI Claude asserts, symlink gate on windows_copy_proven_in_ci, optional skills/ re-root, adherence spike, comparison-doc refresh.

Grammar-Version: v2

## ASSERT_WINDOWS_BOOTSTRAP_CLAUDE
# [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_SETUP] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM]
# How: Extend Windows bootstrap smoke (and CI job if present) so Claude dual-bootstrap artifacts are asserted after copy_files — B1 sequencing gate for B2/B3.
# PRE: Parent Phase 1 Unix/unit proof for .claude/skills/ copy and repo-root .mcp.json safe-merge exists; smoke script currently omits Claude asserts.
# POST: Smoke fails closed when managed .claude/skills/ inventory or repo-root .mcp.json with tied-yaml is missing; proof note under working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/.
# EFFECTS: Filesystem IO — read smoke client tree; Documentation State — proof note

procedure ASSERT_WINDOWS_BOOTSTRAP_CLAUDE(smoke_client_root, proof_note_path):
  # [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] How: Assert Claude skills inventory and repo-root .mcp.json after Windows bootstrap.
  Contract:
    INPUT: smoke_client_root, proof_note_path
    OUTPUT: { ok: true, asserts[] } | { error: CLAUDE_SKILLS_MISSING | MCP_JSON_MISSING | TIED_YAML_SERVER_MISSING }
    PRE: copy_files / bootstrap already ran into smoke_client_root
    POST: success => .claude/skills/ managed inventory present; repo-root .mcp.json exists and mcpServers.tied-yaml configured
    FAILURE_MODES: CLAUDE_SKILLS_MISSING, MCP_JSON_MISSING, TIED_YAML_SERVER_MISSING
    DATA: windows_smoke_assert_result
    DATA_TRANSITION: unproven Windows Claude path → evidence-backed smoke result
    EFFECTS: Filesystem IO — read skills dir and .mcp.json; write proof_note_path
    TERMINATION: total
  IF NOT dir_exists(smoke_client_root / ".claude" / "skills") OR managed_inventory_empty(smoke_client_root) THEN
    RETURN { error: CLAUDE_SKILLS_MISSING }
  mcp := read_json(smoke_client_root / ".mcp.json")
  IF mcp is missing THEN
    RETURN { error: MCP_JSON_MISSING }
  IF missing(mcp.mcpServers.tied-yaml) THEN
    RETURN { error: TIED_YAML_SERVER_MISSING }
  WRITE proof_note_path summarizing asserts and CI job link if any
  RETURN { ok: true, asserts: ["claude_skills", "mcp_json_tied_yaml"] }

## GATE_SYMLINK_ON_WINDOWS_PROOF
# [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
# How: Keep installClaudeSkills symlink_unix_opt_in hard-blocked until windows_copy_proven_in_ci is true after B1 proof.
# PRE: ASSERT_WINDOWS_BOOTSTRAP_CLAUDE green before flipping windows_copy_proven_in_ci in CI/config.
# POST: false => throw SYMLINK_WITHOUT_CI_WINDOWS_PROOF; true => symlink path allowed on Unix opt-in.
# EFFECTS: Control — gate; Process IO when installing

procedure GATE_SYMLINK_ON_WINDOWS_PROOF(project_root, paths, options):
  # [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] How: Enforce SYMLINK_WITHOUT_CI_WINDOWS_PROOF unless Windows copy proven.
  Contract:
    INPUT: project_root, paths, options.symlink_unix_opt_in, options.windows_copy_proven_in_ci
    OUTPUT: install_result | { error: SYMLINK_WITHOUT_CI_WINDOWS_PROOF | SKILL_INSTALL_FAILED }
    PRE: options map provided; default windows_copy_proven_in_ci is false until B1 evidence
    POST: symlink_unix_opt_in AND NOT windows_copy_proven_in_ci => error SYMLINK_WITHOUT_CI_WINDOWS_PROOF
    POST: success path installs Claude skills (copy or symlink per options)
    FAILURE_MODES: SYMLINK_WITHOUT_CI_WINDOWS_PROOF, SKILL_INSTALL_FAILED
    DATA: options.windows_copy_proven_in_ci
    DATA_TRANSITION: false (blocked) → true only after B1 proof artifact accepted
    EFFECTS: Filesystem IO — copy or symlink under .claude/skills/
    TERMINATION: total
  IF options.symlink_unix_opt_in AND NOT options.windows_copy_proven_in_ci THEN
    THROW SYMLINK_WITHOUT_CI_WINDOWS_PROOF
  # LEAP: Unix symlink mode symlinks prompt-type bundles only; tied-yaml stays copy for TIED_REPO_ROOT patch (skills.mjs).
  RETURN installClaudeSkills(project_root, paths, options)

## CONFIG_SKILLS_REROOT
# [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
# How: Optional relocate of managed skills to repo-root skills/ for Cursor and Claude installs; default off; deferred OK in Tracker.
# PRE: windows_copy_proven_in_ci true; ARCH decision recorded; bootstrap flag present.
# POST: Both harness install paths honor skills_root; Windows smoke asserts when flag on; default keeps .cursor/skills and .claude/skills.
# EFFECTS: Filesystem IO — install destinations; Configuration State

procedure CONFIG_SKILLS_REROOT(bootstrap_flag, skills_root, harness_profile):
  # [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] How: Resolve skills install root from optional re-root flag.
  Contract:
    INPUT: bootstrap_flag.skills_reroot_enabled, skills_root, harness_profile in { cursor, claude }
    OUTPUT: resolved_skills_dir | { error: REROOT_WITHOUT_WINDOWS_PROOF | REROOT_WITHOUT_ARCH }
    PRE: IF skills_reroot_enabled THEN windows_copy_proven_in_ci AND arch_decision_present
    POST: disabled => harness-default dirs; enabled => repo-root skills/ for both harnesses
    FAILURE_MODES: REROOT_WITHOUT_WINDOWS_PROOF, REROOT_WITHOUT_ARCH
    DATA: bootstrap_flag.skills_reroot_enabled
    DATA_TRANSITION: default-off → optional on after proof + ARCH
    EFFECTS: Configuration State — install destination selection
    TERMINATION: total
  IF NOT bootstrap_flag.skills_reroot_enabled THEN
    RETURN default_skills_dir(harness_profile)
  IF NOT windows_copy_proven_in_ci THEN
    RETURN { error: REROOT_WITHOUT_WINDOWS_PROOF }
  IF NOT arch_decision_present THEN
    RETURN { error: REROOT_WITHOUT_ARCH }
  RETURN skills_root OR (repo_root / "skills")

## SPIKE_CLAUDE_ADHERENCE_HOOKS
# [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_NEW_CLIENT_ADHERENCE]
# How: Explore Claude adherence hook bridge API; if unstable or absent, emit not_applicable receipt with residual risk — never silent pass.
# PRE: Spike scope accepted or Tracker deferral recorded.
# POST: Either documented bridge contract or N/A receipt under working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/.
# EFFECTS: Documentation State — spike notes / receipt

procedure SPIKE_CLAUDE_ADHERENCE_HOOKS(spike_notes_path, receipt_path):
  # [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] How: Record bridge findings or not_applicable adherence receipt.
  Contract:
    INPUT: spike_notes_path, receipt_path, claude_hook_api_probe
    OUTPUT: { disposition: bridged, bridge_notes } | { disposition: not_applicable, residual_risk }
    PRE: spike authorized for this REQ slice B4
    POST: disposition never empty; silent pass forbidden
    FAILURE_MODES: ADHERENCE_CLAIM_WITHOUT_API
    DATA: adherence_spike_result
    DATA_TRANSITION: unknown API → bridged or not_applicable
    EFFECTS: Documentation State — write spike notes or N/A receipt
    TERMINATION: total
  IF claude_hook_api_probe.stable_bridge_found THEN
    WRITE spike_notes_path with bridge_contract
    RETURN { disposition: bridged, bridge_notes: spike_notes_path }
  WRITE receipt_path with disposition not_applicable and residual_risk RISK-BOOT-005
  RETURN { disposition: not_applicable, residual_risk: "RISK-BOOT-005" }

## REFRESH_COMPARISON_PLAN_DOC
# [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_LIVE_DRIVER]
# How: Update comparison plan Current section for dual bootstrap + dry-run harness; fix stale No Claude .mcp.json claim; add Post-Phases 0-3 table pointing to REQ A and B; reframe Status for closed parent.
# PRE: Parent REQ-TIED_CLAUDE_HARNESS Implemented; REQ A/B tokens exist.
# POST: Doc Current matches repo; L95-class stale claim gone; Post-Phases table links LIVE_DRIVER and BOOTSTRAP_OPS.
# EFFECTS: Documentation State

procedure REFRESH_COMPARISON_PLAN_DOC(doc_path, live_driver_status, bootstrap_ops_status):
  # [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] How: Align comparison plan Current/Status/Post-Phases with shipped parent and A/B follow-ons.
  Contract:
    INPUT: doc_path, live_driver_status, bootstrap_ops_status
    OUTPUT: { ok: true, edits[] } | { error: STALE_CLAIM_REMAINS }
    PRE: doc_path is docs/comparisons/claude-code-tied-multi-harness-plan.md
    POST: Current lists dual bootstrap + dry-run; no claim that Claude .mcp.json is absent today; Post-Phases 0-3 table points to A and B
    FAILURE_MODES: STALE_CLAIM_REMAINS
    EFFECTS: Documentation State — edit comparison plan
    TERMINATION: total
  UPDATE Current section: dual bootstrap (.claude/skills/, repo-root .mcp.json), dry-run --harness claude
  REMOVE stale claim: "No Claude .mcp.json today" (or equivalent ~L95)
  ADD Post-Phases 0-3 table rows → REQ-TIED_CLAUDE_LIVE_DRIVER (A), REQ-TIED_CLAUDE_BOOTSTRAP_OPS (B)
  UPDATE Status: parent closed; A/B are follow-on vehicles
  IF still_contains_stale_no_claude_mcp_claim(doc_path) THEN
    RETURN { error: STALE_CLAIM_REMAINS }
  RETURN { ok: true, edits: ["current", "l95_fix", "post_phases_table", "status"] }
