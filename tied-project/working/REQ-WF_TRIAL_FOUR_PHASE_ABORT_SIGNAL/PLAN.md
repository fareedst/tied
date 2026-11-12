# PLAN — REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL (wave 1: abort classifier + handoff stub)

**Status:** build-plan complete (2026-11-12) — `@close-out` next  
**Parent context:** [REQ-WF_TRIAL_PHASE_HANDOFF_GATE](../REQ-WF_TRIAL_PHASE_HANDOFF_GATE/PLAN.md) · [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK](../REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK/PLAN.md) playbook § P2.2  
**Incident:** Disposable run `1794504138-wf-agentstream-wf-10-claude-claudefable52low` — Claude **session limit** during turn 3; orchestrator `exit_code: 1` on missing `phase-handoff-build-plan.md` while `npm test` green. **Not registered.**  
**Request token:** `REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL`  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**CITDP (draft):** [citdp-draft.md](./citdp-draft.md)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Incident fixtures:** [evidence/fixture-1794504138-process.stderr.log](./evidence/fixture-1794504138-process.stderr.log) · [evidence/fixture-1794504138-process.stdout.tail.txt](./evidence/fixture-1794504138-process.stdout.tail.txt)

---

## 1. Refine (RESOLVE) — locked

| # | Term | Resolution |
| --- | --- | --- |
| R1 | **Primary failure mode** | Provider aborted turn 3 (`You've hit your session limit` in stdout); agent never wrote build-plan handoff; post-run [SC-WF-PHG-01] still correct. |
| R2 | **Operator pain** | Stderr shows turn 3 banner then generic missing handoff ERROR — reads like agent negligence, not **incomplete_reason**. |
| R3 | **D1 abort classifier** | New `scripts/lib/wf-trial-abort-signal.inc.sh`: parse captured `process.stdout.log` + `process.stderr.log` on disposable client **before** `wf_trial_phase_handoff_gate_check`; emit `DIAGNOSTIC: wf_trial_incomplete_reason=<enum>`; merge `incomplete_reason` (+ optional `incomplete_turn`) into `wf-trial-orchestrator-run.v1.json` on finalize when still unset. |
| R4 | **incomplete_reason enum (wave 1)** | `claude_session_limit` \| `turn_missing_session_id` \| `handoff_missing` \| `unknown` (last = fallthrough when gate fails and no stronger signal). |
| R5 | **Detection rules** | **(a)** stdout matches `(?i)session limit` → `claude_session_limit`. **(b)** stderr turn banner `--- turn N/4` with no following `session_id=` before next banner or EOF → `turn_missing_session_id` with `incomplete_turn=N`. **(c)** If (a) and (b), prefer (a). |
| R6 | **D2 inter-turn gate (costly choice)** | **Deferred wave 2 (reversible).** True fail-fast after turns 1–2 requires splitting the single `agentstream -b` into four invocations or agentstream turn-complete hooks — out of wave 1 scope. Wave 1 **tiered messaging only:** when handoff gate fails, if `turn_missing_session_id` or `claude_session_limit`, print incomplete_reason **before** `ERROR: WF trial phase handoff gate: missing …`. |
| R7 | **D3 build-plan handoff stub** | Amend [`docs/demos/traditional-four-phase-agentstream.yaml`](../../../docs/demos/traditional-four-phase-agentstream.yaml) turn 3 `goal`: create minimal `phase-handoff-build-plan.md` with YAML front matter `in_progress: true`, `request_token`, `prompt_type: build-plan` **before** RED/GREEN; finalize per [wf-trial-build-plan-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/wf-trial-build-plan-handoff.md) at turn end. Update adjunct cross-link one line. |
| R8 | **Schema** | Extend orchestrator manifest with optional `incomplete_reason` string + optional `incomplete_turn` number; remain `schema: wf-trial-orchestrator-run.v1` (additive fields; consumers tolerate absence). |
| R9 | **Out of scope** | Claude quota changes; `WF_TRIAL_SKIP_PHASE_HANDOFF_GATE=1`; registering incomplete trials; changing SC-WF-PHG-01 requirements. |

---

## 2. Scope (build-plan)

| ID | Deliverable | Path / module |
| --- | --- | --- |
| W1.1 | Abort signal parser + enum | `scripts/lib/wf-trial-abort-signal.inc.sh` |
| W1.2 | Orchestrator hook | `scripts/workflow-trial-agentstream.sh` — call classifier after `wf_trial_process_log_finalize`, before phase handoff gate; call manifest merge when reason detected |
| W1.3 | Manifest merge helper | `scripts/lib/wf-trial-process-log.inc.sh` — `wf_trial_process_log_set_incomplete_reason` (node merge, same pattern as finalize) |
| W1.4 | Tiered gate stderr | `scripts/lib/wf-trial-phase-handoff-gate.inc.sh` — consult `$WF_TRIAL_INCOMPLETE_REASON` env set by classifier (or pass args) for ordered DIAGNOSTICs |
| W1.5 | Batch YAML + adjunct | `docs/demos/traditional-four-phase-agentstream.yaml`, `wf-trial-build-plan-handoff.md` stub bullet |
| W1.6 | Golden fixtures | `tied-project/working/REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL/evidence/fixture-*` (committed) |
| W1.7 | Bootstrap tests | `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` — SC-WF-ABS-01..04 |
| W1.8 | TIED stack | `REQ`/`ARCH`/`IMPL` indexes + pseudo-code via MCP at build-plan |

**Deferred wave 2:** `REQ-WF_TRIAL_FOUR_PHASE_INTERTURN_GATE` — four separate agentstream invocations or agentstream post-turn hook; fail-fast missing handoff after turns 1–2 only.

---

## 3. Token plan (create at build-plan)

| Layer | Token | Role |
| --- | --- | --- |
| REQ | `REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL` | Satisfaction criteria SC-WF-ABS-01..04 |
| ARCH | `ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL` | Shell-only seam: process logs → classifier → manifest + gate messaging |
| IMPL | `IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL` | `wf-trial-abort-signal.inc.sh`, process-log merge, orchestrator hook |

---

## 4. Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-WF-ABS-01 | Fixture [fixture-1794504138-process.stderr.log](./evidence/fixture-1794504138-process.stderr.log) + [stdout tail](./evidence/fixture-1794504138-process.stdout.tail.txt) → classifier returns `claude_session_limit` (and `incomplete_turn=3` when banner rule fires). |
| SC-WF-ABS-02 | Synthetic stderr: turn 2 banner, no `session_id`, no session limit line → `turn_missing_session_id`, `incomplete_turn=2`. |
| SC-WF-ABS-03 | Existing SC-WF-PHG-01/02 cases in `workflow-trial-agentstream-sh.test.mjs` unchanged (regression). |
| SC-WF-ABS-04 | When classifier sets `claude_session_limit`, phase handoff gate stderr includes `DIAGNOSTIC: wf_trial_incomplete_reason=claude_session_limit` **before** first `ERROR: WF trial phase handoff gate`. |

---

## 5. Verification (build-plan)

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

**Manual (optional):** Re-run WF-10 with Fable after limit reset; confirm aborted runs show `incomplete_reason` on manifest even when handoff gate fails.

---

## Do next

**`@build-plan`** — TDD SC-WF-ABS-01..04 first; then implement W1.1–W1.7; persist REQ/ARCH/IMPL via tied-yaml MCP.
