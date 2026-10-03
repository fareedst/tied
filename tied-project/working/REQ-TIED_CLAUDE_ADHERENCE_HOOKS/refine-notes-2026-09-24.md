# refine-plan notes — REQ-TIED_CLAUDE_ADHERENCE_HOOKS

**Date:** 2026-09-24  
**Input plan:** `~/.cursor/plans/risk-boot-005_claude_hooks_06f06054.plan.md`

## Changes applied

1. **Sponsor term table** — Resolved watch-only vs this REQ, contract surface (`.claude/settings.json`), bootstrap always-on merge, dedicated bridge CLI, `hook_log_ref` log file strategy.
2. **Concrete event mapping** — v1 limited to `PostToolUse` with Bash / MCP / default tool branches; deferred `PreToolUse` and session hooks.
3. **Build slices A0–A5** — Ordered deliverables for `/build-plan` (probe → code → bootstrap → composition → LEAP).
4. **Risk IDs** — Renamed draft RISK-ADH-* to **RISK-ADH-CL-*** to avoid collision with other programs.
5. **Workspace resolution** — Explicit requirement to test `cwd` / `CLAUDE_PROJECT_DIR` path (Cursor `relative_path` heuristic is insufficient for Claude).
6. **Working folder** — Linked plan, citdp-inline, tracker stub, this file.

## Loop-back triggers

- A0 probe fails under CLI **2.1.273** → stop build; record **not_applicable** only if stdin cannot be captured; do not silently ship.
- If sponsor requires **opt-out env** (e.g. `TIED_CLAUDE_ADHERENCE_HOOKS=0`), add ARCH/IMPL block before A3 GREEN.

## Gate status

`pre_implementation` gate not run during refine (Tracker is stub until build-plan copies full checklist). **build-plan** must run `tied_checklist_gate_validate` before RED.
