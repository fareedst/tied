# [IMPL-AGENTSTREAM_CLAUDE_WF_PARITY] [ARCH-AGENTSTREAM_CLAUDE_WF_PARITY] [REQ-AGENTSTREAM_CLAUDE_WF_PARITY] — Claude WF-03 harness parity (argv, batch, trace, smoke)

Grammar-Version: v2

## Claude MCP argv (Pillar A)

- [IMPL-AGENTSTREAM_CLAUDE_WF_PARITY] [ARCH-AGENTSTREAM_CLAUDE_WF_PARITY] [REQ-AGENTSTREAM_CLAUDE_WF_PARITY] Align live Claude argv MCP flags with validated client smoke.
procedure RESOLVE_CLIENT_MCP_CONFIG_PATH:
  Contract:
    INPUT: workspace absolute path
    PRE: workspace is non-empty string
    OUTPUT: absolute mcp json path | empty
    POST:
      - success with path => file exists under workspace
      - success empty => no candidate file
    EFFECTS: IO
    TERMINATION: total
  FOR rel IN [".cursor/mcp.json", ".mcp.json"]:
    IF file exists at join(workspace, rel) THEN RETURN absolute path
  RETURN empty

procedure CLAUDE_MCP_CONFIG_ARGS:
  Contract:
    INPUT: workspace
    PRE: workspace resolved
    OUTPUT: argv suffix list
    POST:
      - success => each flag is a separate argv cell
      - when strict enabled => includes --strict-mcp-config before --mcp-config
    FAILURE_MODES: none (empty list when no config file)
    EFFECTS: pure
    TERMINATION: total
  path := CALL RESOLVE_CLIENT_MCP_CONFIG_PATH(workspace)
  IF path is empty THEN RETURN []
  strict := env AGENTSTREAM_CLAUDE_STRICT_MCP is not "0"
  IF strict THEN RETURN ["--strict-mcp-config", "--mcp-config", path]
  RETURN ["--mcp-config", path]

procedure BUILD_CLAUDE_AGENT_ARGV:
  Contract:
    INPUT: workspace, model, resumeId, prompt parts
    PRE: harness is claude
    OUTPUT: full argv for Claude Code CLI
    POST:
      - success => includes stream-json flags, skip-permissions when LIVE_OK, add-dir for store root, MCP args when config exists
    EFFECTS: pure
    TERMINATION: total
  base := existing claude argv assembly (skip-permissions, add-dir, model, resume, prompt)
  mcp := CALL CLAUDE_MCP_CONFIG_ARGS(workspace)
  RETURN concat(base, mcp)

## Batch SKILL_ROOT expansion (Pillar B)

- [IMPL-AGENTSTREAM_CLAUDE_WF_PARITY] [ARCH-AGENTSTREAM_CLAUDE_WF_PARITY] [REQ-AGENTSTREAM_CLAUDE_WF_PARITY] Harness-aware skill paths in four-phase batch template.
procedure EXPAND_BATCH_PLACEHOLDERS:
  Contract:
    INPUT: batch template path, output path, env MODEL_*, FEATURE_REMAINDER, HARNESS
    PRE: template readable
    OUTPUT: expanded yaml file
    POST:
      - success => {{SKILL_ROOT}} replaced with .claude/skills when HARNESS=claude else .cursor/skills
    EFFECTS: IO
    TERMINATION: total
  skill_root := IF HARNESS=claude THEN ".claude/skills" ELSE ".cursor/skills"
  COPY template to output replacing {{MODEL_SLUG}}, {{MODEL_CONFIG}}, {{FEATURE_REMAINDER}}, {{SKILL_ROOT}}

procedure WORKFLOW_TRIAL_CLAUDE_PREFLIGHT:
  Contract:
    INPUT: WORKSPACE, HARNESS, dry_run flag
    PRE: WORKSPACE set
    OUTPUT: proceed | abort with diagnostic
    POST:
      - when HARNESS=claude and not dry_run => run tied-claude-client-validation or skip when claude absent
    EFFECTS: IO, subprocess
    TERMINATION: total
  IF HARNESS is not claude OR dry_run THEN RETURN proceed
  CALL run-tied-claude-client-validation.mjs for WORKSPACE (MCP smoke or skip)

## Harness turn trace (Pillar C)

- [IMPL-AGENTSTREAM_CLAUDE_WF_PARITY] [ARCH-AGENTSTREAM_CLAUDE_WF_PARITY] [REQ-AGENTSTREAM_CLAUDE_WF_PARITY] Optional JSONL trace for live turns.
procedure APPEND_HARNESS_TURN_TRACE:
  Contract:
    INPUT: trace path, record fields (schema harness-turn-trace.v1)
    PRE: env AGENTSTREAM_HARNESS_TRACE=1
    OUTPUT: appended JSONL line
    POST:
      - success => one line appended with turn_index, harness, model, workspace, session_id, exit_code, timestamp
    EFFECTS: IO
    TERMINATION: total
  IF trace disabled THEN RETURN
  APPEND json line to trace path (default under working/{REQ}/evidence/)

## Dual-harness wf-03 smoke (Pillar D)

- [IMPL-AGENTSTREAM_CLAUDE_WF_PARITY] [ARCH-AGENTSTREAM_CLAUDE_WF_PARITY] [REQ-AGENTSTREAM_CLAUDE_WF_PARITY] CI dry smoke for argv parity.
procedure DUAL_HARNESS_WF03_DRY_SMOKE:
  Contract:
    INPUT: --dry-run-only flag
    PRE: agentstream CLI built
    OUTPUT: exit 0 | non-zero
    POST:
      - success => Claude dry argv includes --mcp-config and --strict-mcp-config when fixture client has mcp json
    EFFECTS: subprocess
    TERMINATION: total
  RUN agentstream dry-run with HARNESS=claude on fixture workspace
  ASSERT argv contains MCP flags
