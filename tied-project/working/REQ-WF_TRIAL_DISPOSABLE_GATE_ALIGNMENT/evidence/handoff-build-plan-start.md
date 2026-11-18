# Handoff — start `@build-plan` (REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT)

**handoff_kind:** phase_snapshot  
**date:** 2026-11-17  
**request_token:** REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT  
**prompt_type:** refine-plan → build-plan  
**plan_phase:** pre-implementation  

---

## Invocation (new session)

```text
@build-plan
```

**Linked plan:** [../PLAN.md](../PLAN.md)  
**Rolling log:** [session-handoff.md](./session-handoff.md)  
**Test strategy:** [../test-strategy.md](../test-strategy.md)

---

## Plan spine

| Phase | Work |
| --- | --- |
| 1 RED | `checklist-pseudocode-gate.test.ts` disposable cases; new `tools/bootstrap/lib/wf-trial-disposable-slug-registry.test.mjs`; machine-closeout shell tests in `workflow-trial-agentstream-sh.test.mjs` |
| 2 GREEN MCP | `loadWfTrialDisposableChecklistSlugs()` in `mcp-server/src/checklist-slug-registry.ts`; branch `validateCanonicalSlugs` when `workflow_trial_disposable === true` |
| 3 GREEN template | `rationale` on slim `sub-adversarial-inquiry-pass` in `tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml`; materialize/reconcile via `scripts/lib/wf-trial-product-req.inc.sh` |
| 4 GREEN orchestrator | `scripts/lib/wf-trial-machine-closeout-exit.inc.sh`; wire `workflow-trial-agentstream.sh`; help `WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT` |
| 5 Docs | `wf-trial-checklist-gates-adjunct.md`, `wf-trial-build-plan-handoff.md`, vocab already in `tied-project/vocab/agentstream.md` |
| 6 TIED | IMPL `essence_pseudocode` sidecar; LEAP footnote SC-WF-CLP-01; `tied_validate_consistency` |
| 7 Live | `workflow_trial_range claude haiku-5-5 low 1 1` → evidence `verification-live-wf-01-*.md` (SC-WF-DGA-06) |

**Incident / proof target:** split signal [1794975372 readout](../../../../docs/agent-harness-evaluation/readouts/trial-readout-PROMPT-WF-01-claudehaiku55low-1794975372-wf-agentstream-wf-01-claude-claudehaiku55low.md).

---

## TIED tokens

| Token | Status | Detail |
| --- | --- | --- |
| REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT | Planned | [requirements/REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml](../../../requirements/REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml) |
| ARCH-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT | proposed | [architecture-decisions/ARCH-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml](../../../architecture-decisions/ARCH-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml) |
| IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT | proposed | [implementation-decisions/IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml](../../../implementation-decisions/IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml) |

**Satisfaction criteria:** SC-WF-DGA-01 … SC-WF-DGA-06 (in REQ detail).

**Depends on:** REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK, REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN, REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT, REQ-TIED_CHECKLIST_GATE_ENFORCEMENT.

**CITDP (draft):** [citdp/CITDP-REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml](../../../citdp/CITDP-REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml) — persist/enrich during build-plan.

**Tracker:** [../checklist-tracker.yaml](../checklist-tracker.yaml) — methodology slugs on **store** REQ (no `workflow_trial_disposable`).

---

## Fixtures

| File | Use |
| --- | --- |
| [fixture-disposable-tracker-1794975372.yaml](./fixture-disposable-tracker-1794975372.yaml) | RED disposable slug union (SC-WF-DGA-01) |
| Live client (optional) | `/Users/fareed/Documents/dev/test/1794975372-wf-agentstream-wf-01-claude-claudehaiku55low` — reference only; do not mutate in this REQ |

---

## Environment

| Variable | Value |
| --- | --- |
| workspace_root | `/Users/fareed/Documents/dev/chatgpt/stdd` |
| TIED_BASE_PATH | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` |
| execution_site | store (MCP writes `tied-project/` only) |
| profile_depth / gate_policy | minimal / advisory |

**Verification commands (post-GREEN):**

```bash
node --test mcp-server/src/checklist-pseudocode-gate.test.ts
node --test tools/bootstrap/lib/wf-trial-disposable-slug-registry.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

---

## Locked decisions (do not re-litigate)

1. **Slug union** when `workflow_trial_disposable: true` — keep disposable names `red-tests` / `implement-code` (no rename to `unit-test-red`).
2. **Machine closeout exit** default **on**; opt-out `WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT=1`.
3. **Exit precedence:** `FOUR_PHASE_EXIT != 0` wins over machine closeout check ([REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../../../requirements/REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT.yaml)).
4. **Out of scope:** auto-completing tracker steps; integrated pseudocode gates; one-off disposable client repair.

---

## Completion signals (build-plan target)

| Signal | Target |
| --- | --- |
| Machine | verification + close_out receipts on **live** disposable cell OR orchestrator shell non-zero with `DIAGNOSTIC` (SC-WF-DGA-06) |
| Process | IMPL pseudo-code + tests green; phase-handoff-build-plan.md |
| Adherence | deferred to `@close-out` |

---

## Do next

1. PRELOAD `tied-project/vocab/agentstream.md` (disposable gate slug union terms).
2. TDD wave 1–4 per PLAN §3.
3. Write `evidence/phase-handoff-build-plan.md` when GREEN.
4. Sponsor-only: `@close-out` / commit unless requested.

---

## Constraints

- No product code under disposable client `src/` for this REQ.
- Do not weaken store trackers: union applies only when `workflow_trial_disposable: true`.
- Git commit only when sponsor asks.