# Close-out completion pass (Wave 5 recovery)

**Tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[REQ-REQUEST_EVIDENCE_ENVELOPE]`, `[PROC-AGENT_REQ_CHECKLIST]`  
**Handoff slug:** `close-out-wave5-completion` (operator prompt / parent return — not a separate lifecycle phase)

Use this pass when **machine close-out** already looks green (`tied_gate_check` or envelope MCP `allowed: true`, zero blocking error gaps) but **process contract** or **adherence ledger** signals are still **partial** or **not_run** — for example `sub-close-out-evidence-sync` pending, tracker dual-write stale, reconcile never ran, or gate receipt paths on disk do not match the authoritative Tracker.

**Same REQ, same Tracker/CITDP** — recovery runs inside the existing close-out / traceable-commit window; do not mint a new `request_token`.

## When to invoke

| Symptom | Action |
| --- | --- |
| Handoff shows machine pass but process/adherence fail or partial | Run this completion pass before claiming EXIT or ship |
| `run-close-out-gates.mjs` failed early (VERSION, wrong `project_root`) | Fix deps/root, then re-run unified runner (below) |
| Tracker `execution_evidence.completed` disagrees with `steps[].tracking.status` | Sync dispositions first — never claim complete on gate alone |

## Ordered recovery (checklist-aligned)

1. **`tied_config_get_base_path`** — confirm `TIED_BASE_PATH` is the intended **`tied-project/`** for this repo (not another clone or parent methodology tree).
2. **Repo root** — set `project_root` to the **git repository root** (parent of `tied-project/`), not `tied-project/` alone, for reconcile and gate runners.
3. **Unified runner** — from `project_root`:

```bash
node tools/bootstrap/templates/run-close-out-gates.mjs \
  --project-root /path/to/repo \
  --request-token {REQ-OR-PLAN-TOKEN} \
  --tracker-path tied-project/working/{TOKEN}/checklist-tracker.yaml \
  --citdp-path tied-project/working/{TOKEN}/CITDP-....yaml \
  --phase close_out \
  --envelope-blocking \
  --sync-dispositions \
  --reconcile
```

4. **Persist receipts** — save runner JSON under `tied-project/working/{TOKEN}/evidence/closeout-run-close-out-gates.json`; update Tracker `execution_evidence.close_out_evidence` and envelope path in the **same pass** (dual-write).
5. **Three completion signals** — re-report per [completion-signals-handoff.md](completion-signals-handoff.md); all three must be **pass** (or documented waivers) before EXIT.
6. **Traceable commit** — only if unified close_out still allows; follow [traceable-commit-close-out.md](traceable-commit-close-out.md).

## MCP parity (tied-yaml skill)

Prefer **`tied gate check`** / MCP `tied_gate_check` with explicit `project_root`, `tracker_path`, and `citdp_path`. After disposition sync, run **`tied_adherence_reconcile_run`** with `include_process_grade: true` when the checklist requires ledger correlation. See [tied-yaml skill close-out recovery](../../../tools/bundled-tied-yaml-skill/SKILL.md#close-out-recovery-wave-5-completion-pass).

## Handoff template (copy into parent return)

```markdown
### Close-out completion pass (Wave 5)
- **Trigger:** {machine pass early | reconcile skipped | dual-write stale | wrong project_root}
- **Runner:** run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile
- **Receipt:** {path to closeout-run-close-out-gates.json}
- **Three signals after recovery:** machine={pass|fail}; process={pass|fail|partial}; ledger={pass|fail|not_run}
- **EXIT allowed:** {yes | no — list blockers}
```

## Non-goals

- New REQ token or Wave 5 tooling changes (envelope fail-closed policy, kaizen auto-capture) — those stay in Wave 5 CITDP.
- Replacing `@close-out` or checklist gate authority.
