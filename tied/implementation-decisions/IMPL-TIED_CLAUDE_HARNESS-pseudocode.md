Grammar-Version: v2

# [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
# Multi-harness pseudo-code: Phases 0→3 (Claude Code parity with Cursor reference path).

## OPERATING_MODES_TAXONOMY
# [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
# How: Keep interactive Prompt Composer, semi-automated Tracker discipline, and tied agentstream automation as distinct contracts in docs, ARCH, and operator messaging.
# PRE: Sponsor decision log 2026-09-23 locked full program Phases 0→3.
# POST: No documentation or skill conflates successful interactive build-plan with automated agentstream checklist receipts.
# EFFECTS: pure — vocabulary and gate semantics only until Phase 2 live runs.

procedure RESOLVE_OPERATING_MODE(entry_surface):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] How: Classify interactive, semi-automated, and agentstream entry surfaces.
  Contract:
    INPUT: entry_surface in { interactive_skill, semi_automated_tracker, agentstream_cli }
    OUTPUT: mode_label, allowed_evidence, forbidden_claims
    PRE: AGENTS.md remains canonical obligations source
    POST: success => mode_label maps to exactly one row in comparison plan operating modes table
    EFFECTS: pure
    TERMINATION: total
  IF entry_surface is interactive_skill THEN
    RETURN { mode: interactive_prompt_composer, tied_writes: mcp_or_tied_cli, automation: false }
  IF entry_surface is agentstream_cli THEN
    RETURN { mode: automated_checklist, tied_writes: tracker_receipts, automation: true, harness: cursor_or_claude_profile }
  RETURN { mode: semi_automated, tied_writes: manual_tracker, automation: false }

## PHASE_0_PILOT_DISCOVERY
# [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
# How: Contract-gated pilot under working/REQ-TIED_CLAUDE_HARNESS/ with temporary skill copy and documented MCP/tied-cli setup; zero canonical bootstrap or agentstream production edits for acceptance.
# PRE: TIED MCP base path confirmed via tied_config_get_base_path before any project YAML write.
# POST: Gap list covers Claude skill discovery, MCP auth/stdio shape, CLI subprocess flags/stream schema, session behavior; Phase 1/2 fixture contracts written.
# FAILURE_MODES: PILOT_CLAIMS_AGENTSTREAM — reject if pilot asserts automated Claude checklist without fixtures.

procedure PHASE_0_PILOT_ACCEPTANCE(working_dir):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] How: Record pilot gaps and fixture contracts without bootstrap or agentstream code changes.
  Contract:
    INPUT: working_dir, pilot_notes, gap_list, fixture_contract_draft
    OUTPUT: go_no_go for Phase 1 bootstrap code
    PRE: No commits to tools/bootstrap/ or agentstream executor for Phase 0 exit
    POST: success => remaining unknowns are fixture work not program scope disputes
    DATA: phase0 artifact tree under working_dir
    DATA_TRANSITION: empty phase0 tree → populated pilot_notes, gap_list, fixture_contract_draft
    EFFECTS: IO — append-only pilot artifacts under working_dir
    TERMINATION: total
  RECORD pilot_notes under working_dir/phase0/
  RECORD gap_list with blocks for skill_discovery, mcp_stdio, claude_cli_contract
  WRITE fixture_contract_draft for Phase 1 RED and Phase 2 driver oracles
  RETURN go_no_go

## PHASE_1_DUAL_BOOTSTRAP
# [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-TIED_SETUP] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
# How: Extend @tied/bootstrap to copy Prompt Composer + tied-yaml bundles to .claude/skills/ (copy default), repo-root .mcp.json create-if-absent or safe-merge tied-yaml only, harness dimension on MCP env; preserve Cursor create-only .cursor/mcp.json policy unchanged.
# PRE: Phase 0 contracts reflected in this pseudo-code; RED bootstrap tests authored before production bootstrap edits.
# POST: Fresh temp client retains Current Cursor skills + create-only .cursor/mcp.json; Claude paths added without clobbering unrelated MCP servers; TIED_MCP_HARNESS (or equivalent) present in generated env blocks.
# DATA_TRANSITION: absent .mcp.json → create with tied-yaml; existing .mcp.json → merge missing tied-yaml entry only
# FAILURE_MODES: MERGE_OVERWRITE_FOREIGN_SERVER; CURSOR_POLICY_REGRESSION; WINDOWS_COPY_FAILURE

procedure INSTALL_CLAUDE_SKILLS(client_root, options):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] How: Copy-default install of Prompt Composer and tied-yaml bundles to .claude/skills/.
  Contract:
    INPUT: client_root, options.symlink_unix_opt_in
    OUTPUT: installed_paths[] | error
    PRE: Canonical sources tools/bundled-prompt-type-skills/ and tools/bundled-tied-yaml-skill/
    POST: success => .claude/skills/ contains same managed inventory as Cursor install (copy default)
    EFFECTS: Filesystem State
    FAILURE_MODES: SYMLINK_WITHOUT_CI_WINDOWS_PROOF
    TERMINATION: total
  IF options.symlink_unix_opt_in AND NOT options.windows_copy_proven_in_ci THEN
    RETURN { error: SYMLINK_WITHOUT_CI_WINDOWS_PROOF }
  COPY managed bundle to client_root/.claude/skills/ preserving unrelated client skills
  RETURN installed_paths

procedure INITIALIZE_CLAUDE_MCP_CONFIG(client_root):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-MCP_USAGE_METRICS] How: Create or safe-merge repo-root .mcp.json tied-yaml with harness metrics env.
  Contract:
    INPUT: client_root, tied_base_path_absolute, harness_label
    OUTPUT: mcp_config_path, merge_action
    PRE: refreshTiedMcpJson merge semantics available for tied-yaml only
    POST: success => mcpServers.tied-yaml present; unrelated servers byte-preserving on merge path
    EFFECTS: Filesystem IO
    FAILURE_MODES: MERGE_OVERWRITE_FOREIGN_SERVER
    TERMINATION: total
  target := client_root/.mcp.json
  IF NOT exists(target) THEN
    CREATE target with tied-yaml stdio block, TIED_BASE_PATH, TIED_MCP_HARNESS=harness_label
    RETURN { path: target, action: created }
  IF missing mcpServers.tied-yaml THEN
    MERGE tied-yaml block only via safe merge helper
    RETURN { path: target, action: merged }
  RETURN { path: target, action: noop }

procedure PRESERVE_CURSOR_MCP_INIT(client_root):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-TIED_SETUP] How: Delegate to unchanged Cursor initializeTiedMcpConfig create-if-absent path.
  Contract:
    INPUT: client_root
    OUTPUT: policy_result
    PRE: initializeTiedMcpConfig create-if-absent only for .cursor/mcp.json
    POST: existing .cursor/mcp.json never mutated by Claude init path
    EFFECTS: pure guard — CALL existing Cursor initializer unchanged
    TERMINATION: total
  CALL initializeTiedMcpConfig for .cursor/mcp.json only
  RETURN policy_result

## PHASE_2_AGENTSTREAM_CLAUDE_PROFILE
# [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-GOAGENT-AGENT-EXECUTOR]
# How: Introduce AgentDriver boundary and --harness claude after fixture gates; --agent-path remains Cursor executable override only — not a Claude adapter.
# PRE: Phase 1 bootstrap tests green; frozen Claude fixture stream oracles separate from Cursor oracles.
# POST: dry-run unchanged; live Claude checklist enabled only when subprocess/stream/session/MCP/Tracker contracts pass fixtures.
# FAILURE_MODES: AGENT_PATH_MISUSED_AS_HARNESS; LIVE_WITHOUT_FIXTURE_PARITY

procedure SELECT_AGENT_HARNESS(argv, env):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-GOAGENT-AGENT-EXECUTOR] How: Map --harness to cursor, claude, or dry_run; never treat --agent-path as harness selection.
  Contract:
    INPUT: argv.harness_flag, env defaults
    OUTPUT: profile in { cursor, claude, dry_run }
    PRE: Default profile cursor
    POST: success => profile determines driver factory not raw executable string alone
    EFFECTS: pure
    TERMINATION: total
  IF argv.harness_flag == claude THEN
    RETURN claude
  IF dry_run_mode THEN
    RETURN dry_run
  RETURN cursor

procedure RUN_AGENTSTREAM_TURN(driver, turn_spec):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-GOAGENT-AGENT-EXECUTOR] How: Execute one turn via harness-specific AgentDriver with shared receipt shape.
  Contract:
    INPUT: driver implementing AgentDriver (launch, parse, session, permissions)
    OUTPUT: stream_events[], session_id, exit_metadata
    PRE: driver pinned to documented CLI version for claude profile
    POST: success => NDJSON or contract stream parsed into same receipt shape as Cursor driver
    EFFECTS: Process IO Async
    FAILURE_MODES: STREAM_SCHEMA_DRIFT; SESSION_CHAIN_BREAK; MCP_LOAD_FAILURE
    TERMINATION: may_diverge — bounded by turn timeout policy from REQ-GOAGENT-AGENT-EXECUTOR
  events := driver.launch_and_parse(turn_spec)
  RETURN { events, session_id: driver.session_id, exit: driver.exit_metadata }

## PHASE_3_CLIENT_DEV_INDEX_MATRIX
# [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
# How: Publish REQ work → Prompt Composer vs FEAT lifecycle → feature-orchestrator matrix in tied/docs/client-development-index.md; optional skills/ re-root deferred until Windows copy path proven.
# PRE: Phases 0–2 acceptance recorded in Authoritative Tracker.
# POST: Matrix row set documents shared TIED YAML MCP / tied-cli for both harnesses.
# EFFECTS: Documentation State

procedure PUBLISH_REQ_FEAT_MATRIX(client_dev_index_path, matrix_rows):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] How: Merge REQ versus FEAT routing matrix into client-development-index.
  Contract:
    INPUT: client_dev_index_path, matrix_rows
    OUTPUT: updated_section_anchor
    PRE: matrix_rows include operating mode column and harness entry surfaces
    POST: success => readers can route REQ tokens to Prompt Composer and FEAT tokens to feature-orchestrator without conflation
    EFFECTS: IO
    TERMINATION: total
  MERGE matrix_rows into client_dev_index_path under documented heading
  RETURN updated_section_anchor

## CLAUDE_MD_THIN_OPTIONAL
# [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
# How: Optional Phase 1 template CLAUDE.md points to AGENTS.md and Claude-only deltas (skill paths, .mcp.json, no Cursor prompt-type subagents).
# PRE: ARCH approves template ownership in bootstrap or docs slice.
# POST: CLAUDE.md never replaces Authoritative Tracker or project tied/ YAML.
# EFFECTS: optional Filesystem IO

procedure INSTALL_CLAUDE_MD_TEMPLATE(client_root, approved):
  # [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] How: Optional create-if-absent CLAUDE.md thin delta pointing to AGENTS.md.
  Contract:
    INPUT: client_root, approved boolean
    OUTPUT: installed | skipped
    PRE: Template content matches comparison plan minimal CLAUDE.md block
    POST: skipped when approved is false
    EFFECTS: Filesystem
    TERMINATION: total
  IF NOT approved THEN RETURN skipped
  WRITE client_root/CLAUDE.md from template when absent or when bootstrap policy says create-if-absent
  RETURN installed
