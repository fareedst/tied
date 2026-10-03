# IMPL-TIED_CLAUDE_ADHERENCE_HOOKS — essence pseudocode

## PROBE_CLAUDE_HOOK_CONTRACT
# [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [ARCH-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
# How: Document Claude Code hooks in .claude/settings.json; pin CLI; freeze PostToolUse stdin fixtures.
# PRE: Sponsor opened plan-new-feature for RISK-BOOT-005.
# POST: evidence/contract-probe with mapping table or not_applicable receipt.
# EFFECTS: Documentation State — fixtures under mcp-server/fixtures/claude/hooks/

procedure PROBE_CLAUDE_HOOK_CONTRACT(evidence_path, fixture_dir):
  Contract:
    INPUT: evidence_path, fixture_dir, claude_cli_version
    OUTPUT: { ok: true, pin: string } | { disposition: not_applicable, residual_risk: "RISK-BOOT-005" }
    PRE: A0 slice authorized
    POST: fixtures exist OR not_applicable recorded
    FAILURE_MODES: ADHERENCE_CLAIM_WITHOUT_API
    TERMINATION: total
  WRITE evidence_path with hook locations and event mapping
  WRITE fixture_dir with PostToolUse samples
  RETURN { ok: true, pin: claude_cli_version }

## NORMALIZE_CLAUDE_HOOK_RECORD
# [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [ARCH-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
# How: Map Claude PostToolUse stdin to HookRecord shapes consumed by adherence-append (Bash/MCP/generic tool).
# PRE: PROBE completed or fixtures checked in.
# POST: normalizeClaudeHookStdin unit tests green.
# EFFECTS: Runtime State — normalized HookRecord

procedure NORMALIZE_CLAUDE_HOOK_RECORD(stdin_json):
  Contract:
    INPUT: stdin_json (Claude hook payload)
    OUTPUT: HookRecord with adherence_source claude_hook
    PRE: hook_event_name PostToolUse family
    POST: hook_event_name in { postToolUse, afterShellExecution, afterMCPExecution }
    FAILURE_MODES: UNMAPPED_TOOL_SHAPE
    TERMINATION: total
  IF tool_name is Bash THEN map to afterShellExecution with command digest path
  ELSE IF tool_name matches mcp__ THEN map to afterMCPExecution
  ELSE map to postToolUse with tool_name
  RETURN HookRecord

## MERGE_CLAUDE_ADHERENCE_HOOKS
# [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [ARCH-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
# How: Safe-merge PostToolUse handler into .claude/settings.json; write .claude/hooks/tied-adherence-bridge.sh.
# PRE: MCP dist built (assertMcpPrerequisite).
# POST: merge idempotent; foreign hooks preserved.
# EFFECTS: Filesystem State — settings.json + hook shell

procedure MERGE_CLAUDE_ADHERENCE_HOOKS(project_root, tied_repo_root):
  Contract:
    INPUT: project_root, tied_repo_root
    OUTPUT: { action: created|merged|noop }
    PRE: writable .claude/
    POST: TIED bridge entry present at most once
    FAILURE_MODES: FOREIGN_SETTINGS_CLOBBER
    TERMINATION: total
  WRITE tied-adherence-bridge.sh invoking claude-adherence-bridge.js
  MERGE PostToolUse entry into settings.json without removing foreign entries
  RETURN action

## INSTALL_CLAUDE_ADHERENCE_BRIDGE
# [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [ARCH-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
# How: Hook CLI reads stdin, appends hook log line, calls callAdherenceAppendActionAttempted fail-silent.
# PRE: active-turn marker optional (fail-silent when absent).
# POST: action_attempted row when marker present; source.kind claude_hook.
# EFFECTS: Append-only ledger rows

procedure INSTALL_CLAUDE_ADHERENCE_BRIDGE(stdin_json, project_dir):
  Contract:
    INPUT: stdin_json, project_dir
    OUTPUT: exit 0 always (fail-silent)
    PRE: bridge JS built under mcp-server/dist/cli/
    POST: no prompt bodies in ledger
    FAILURE_MODES: LEDGER_WRITE_ERROR (logged, non-blocking)
    TERMINATION: total
  record := NORMALIZE_CLAUDE_HOOK_RECORD(stdin_json)
  line := append .claude/adherence-bridge.log summary
  CALL callAdherenceAppendActionAttempted(record, hook_log_ref)
  RETURN 0
