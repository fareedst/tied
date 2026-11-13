# PLAN — REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL

**Status:** close-out complete — wave 1.5 shipped **`50326bab`**  
**Parent context:** [REQ-WF_TRIAL_PHASE_HANDOFF_GATE](../REQ-WF_TRIAL_PHASE_HANDOFF_GATE/PLAN.md) · [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK](../REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK/PLAN.md)  
**Cursor plan:** [session_limit_highlight_349881a2.plan.md](../../../../.cursor/plans/session_limit_highlight_349881a2.plan.md)  
**Request token:** `REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL`  
**plan_phase:** `close-out-ready` (wave 1.5)  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Wave 1:** committed `3b9ea925` (SC-WF-ABS-01..04)  
**Wave 1.5:** session capacity **highlight** + preflight fail-closed + gate skip hardening (SC-WF-ABS-05..08)

**CITDP (draft):** [citdp-draft.md](./citdp-draft.md)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Incident fixtures:** [evidence/fixture-1794504138-process.stderr.log](./evidence/fixture-1794504138-process.stderr.log) · [evidence/fixture-1794504138-process.stdout.tail.txt](./evidence/fixture-1794504138-process.stdout.tail.txt)

---

## 1. Wave 1 — locked (shipped)

See commit `3b9ea925`. SC-WF-ABS-01..04 satisfied in store.

---

## 2. Wave 1.5 — Refine (RESOLVE) — locked

| # | Term | Resolution |
| --- | --- | --- |
| R10 | **Operator pain (1.5)** | Provider `You've hit your session limit · resets …` on **stdout** is buried next to turn banners and `DIAGNOSTIC: wf_trial_incomplete_reason`; operators miss capacity as root cause. |
| R11 | **session capacity highlight** | Shared stderr `ERROR: WF trial stopped: Claude session capacity limit` + indented provider line + retry hint; **before** machine `wf_trial_incomplete_reason` diagnostic. |
| R12 | **L1 preflight** | Parse `tied-project/working/tied-claude-client-validation.v1.json` when smoke fails; if `claude_code_interactive_smoke.detail` matches `(?i)session limit` → highlight + **block four-phase** without `WF_TRIAL_STRICT_PREFLIGHT`. Other validation failures stay advisory unless STRICT. |
| R13 | **L2 live** | After Claude `runTurn`, if accumulated stdout contains session limit → `process.stderr.write` highlight **once** per `executeLiveRun`. |
| R14 | **L3 post-classifier** | When `claude_session_limit`, extract line from `process.stdout.log` → highlight → then `wf_trial_abort_signal_emit_diagnostic`. |
| R15 | **SC-WF-ABS-05** | When `claude_session_limit` / `turn_missing_session_id` and no product REQ → handoff DIAGNOSTIC skip (no ERROR). Proof manifest gate skip same enum. *(local debug; verify in build-plan.)* |
| R16 | **Shared module** | [`scripts/lib/wf-trial-operator-highlight.inc.sh`](../../../scripts/lib/wf-trial-operator-highlight.inc.sh): `wf_trial_extract_session_limit_line`, `wf_trial_emit_session_limit_highlight`. Optional tty color via `TIED_CLI_PLAIN` / `NO_COLOR`. |
| R17 | **Out of scope** | Cursor quota messages; registering runs 1794507861 / 1794509066; changing Claude limits. |

### 2.1 `wf_trial_emit_session_limit_highlight` contract (locked)

| Field | Value |
| --- | --- |
| **PRE** | `human_line` may be empty (headline + hint still print) |
| **POST** | Three-line minimum: ERROR headline, optional provider line, retry hint; trailing `\n` |
| **HEADLINE** | `ERROR: WF trial stopped: Claude session capacity limit` (exact prefix for SC-WF-ABS-06 tests) |
| **HINT** | Retry after reset, another model, or `harness=cursor` |

### 2.2 Preflight handler contract (locked)

| Field | Value |
| --- | --- |
| **Signature** | `wf_trial_handle_claude_validation_exit validation_exit client_root` |
| **Orchestrator** | [`workflow-trial-agentstream.sh`](../../../scripts/workflow-trial-agentstream.sh) passes `$WORKSPACE` as second arg |
| **Report path** | `committedWorkingFileRel(client_root, tied-claude-client-validation.v1.json)` → typically `tied-project/working/tied-claude-client-validation.v1.json` |

---

## 3. Wave 1.5 scope (`@build-plan`)

| ID | Deliverable | Path |
| --- | --- | --- |
| W15.1 | Highlight inc | `scripts/lib/wf-trial-operator-highlight.inc.sh` |
| W15.2 | L3 hook | `scripts/lib/wf-trial-abort-signal.inc.sh` |
| W15.3 | L1 preflight | `scripts/lib/wf-trial-claude-preflight.inc.sh` + orchestrator wiring |
| W15.4 | L2 live | `mcp-server/packages/agentstream/src/session-limit-highlight.ts` + `live-executor.ts` |
| W15.5 | Bootstrap tests | `workflow-trial-agentstream-sh.test.mjs` SC-WF-ABS-05..08 |
| W15.6 | Agentstream tests | unit for detector + highlight once |
| W15.7 | IMPL pseudo-code | [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL-pseudocode.md](../../../tied-project/implementation-decisions/IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL-pseudocode.md) |
| W15.8 | Vocab | `tied-project/vocab/agentstream.md` — session capacity highlight |

**Bundle:** uncommitted debug (ABS-05, SPT stdout dedup, `sonnet-4-6` alias) in same commit wave.

---

## 4. Acceptance criteria (full stack)

| ID | Criterion |
| --- | --- |
| SC-WF-ABS-01..04 | Wave 1 (regression) |
| SC-WF-ABS-05 | Provider abort: skip handoff + proof manifest ERROR when no product REQ |
| SC-WF-ABS-06 | ERROR highlight + provider line **before** `DIAGNOSTIC: wf_trial_incomplete_reason=claude_session_limit` |
| SC-WF-ABS-07 | Preflight session limit → block before four-phase without STRICT |
| SC-WF-ABS-08 | Live Claude turn: highlight on stderr once |

---

## 5. Verification

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
cd mcp-server/packages/agentstream && npm test
```

---

## Do next

Shipped **`50326bab`**. Next: **REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT** close-out (optional second commit).
