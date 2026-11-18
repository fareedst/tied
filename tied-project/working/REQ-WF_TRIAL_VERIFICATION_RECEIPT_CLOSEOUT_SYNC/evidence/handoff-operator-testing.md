# Handoff — operator testing (next session)

**handoff_kind:** operator  
**date:** 2026-11-18  
**request_token:** REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC  
**plan_phase:** verification  
**build_plan:** complete (store harness on disk; **not committed** until `@close-out`)

## Context

Incident **1795019148** (WF-09 Haiku low): four phases OK, shell **exit 1** with `verification_handoff_without_receipt` — turn 3 claimed verification `allowed: true` without `gates/verification-*.json`.

**Shipped (uncommitted):** handoff claim parser, opt-in receipt assist, batch/adjunct prompts, [wf-trial-closeout-operator-env.md](../../../../docs/agent-harness-evaluation/wf-trial-closeout-operator-env.md).

**Operator doc:** [docs/agent-harness-evaluation/wf-trial-closeout-operator-env.md](../../../../docs/agent-harness-evaluation/wf-trial-closeout-operator-env.md)

## Preconditions

- Store root with built MCP CLI: `.cursor/skills/tied-yaml/scripts/tied-cli.sh` or run `./build-workspace.sh` from repo root.
- `HARNESS=claude` (or your matrix harness), `MODEL_EFFORT=low` if replaying Haiku low.
- `TIED_TEST_ROOT` default `~/Documents/dev/test` for new disposable cells.

## SC-VRCS-06 — live matrix arms (record in `evidence/live-wf-09-vrcs-replay.md`)

| Arm | Command | Pass signals | Fail / grade notes |
| --- | --- | --- | --- |
| **A — control** | `workflow_trial_agentstream wf-09` or `WF_TRIAL_SKIP_VERIFICATION_RECEIPT_ASSIST=1 workflow_trial_range claude haiku-5-5 low 9 9` | Turn 3 writes `gates/verification-*.json` **or** handoff `verification_receipt_status: deferred` with **no** `allowed: true` in Verification gate row → orchestrator **exit 0** (Tier B or receipt) | Same as 1795019148 if agent claims pass without receipt → **exit 1**, `verification_handoff_without_receipt` |
| **B — assist** | `workflow_trial_range claude haiku-5-5 low 9 9` (range default assist) or `WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1 workflow_trial_agentstream wf-09` | After green `npm test`, stderr `verification receipt assist: persisted` (or real MCP persist); manifest `verification_receipt_assist: true`; **exit 0** if machine closeout satisfied | Assist skip reasons in stderr are OK only if tests failed or receipt already present |
| **C — WF-01 sanity** (optional) | `workflow_trial_agentstream wf-01` | Regression: receipt persist path still → **exit 0** (cf. 1795017442) | — |

## Per-run checks (disposable client)

After each arm, on the new workspace path printed at launch:

1. `tied-project/working/{product_REQ}/evidence/phase-handoff-build-plan.md` — front matter `verification_receipt_status` / Verification gate row.
2. `tied-project/working/{product_REQ}/gates/verification-*.json` — present when claiming persist.
3. `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` — `exit_code`, `verification_receipt_assist` (arm B).
4. stderr tail — `wf_trial_machine_closeout_reason=*` (should be absent on exit 0).

## Bootstrap-only (no full matrix)

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
node --test tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs
```

Note: one **pre-existing** interleaved test failure (`operator_stderr_line` in fixture) is unrelated to VRCS.

## After operator testing

1. Fill [live-wf-09-vrcs-replay.md](./live-wf-09-vrcs-replay.md) with cell IDs and arm outcomes.
2. **`@close-out`** — CHANGELOG, verification gate, traceable commit for VRCS (+ any operator evidence edits).
3. Optional: `@record-wf-trial` only after sponsor picks matrix policy (assist on vs agent-only).

## Do next (operator)

1. Run **arm B** first on a fresh WF-09 if you want a quick green orchestrator path after build.
2. Run **arm A** to confirm Tier A still fires when the model skips receipt (expected until turn 3 prompt uptake improves).
3. Write replay evidence file, then schedule `@close-out`.