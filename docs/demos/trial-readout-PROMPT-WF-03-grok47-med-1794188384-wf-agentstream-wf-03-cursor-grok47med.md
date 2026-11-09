# Trial readout: PROMPT-WF-03 → Grok 4.7 medium (Cursor agentstream) → `1794188384-wf-agentstream-wf-03-cursor-grok47med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-03`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `grok47-med` |
| **Model slug** | `grok-4.7-medium-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794188384-wf-agentstream-wf-03-cursor-grok47med` |
| **Factory tag** | `wf-agentstream-wf-03-cursor-grok47med` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`**; evidence `…/tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **Isolated re-run** after failed harness cell `1794185608-wf-agentstream-wf-03-cursor-grok47med` (turn 2 abort; see [field case](../../tied-project/working/REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE/evidence/field-case-1794185608.md)); completes four turns post [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] exit normalization. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-03. **Proof boundary:** executable_behavior unless catalog row says otherwise.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | REQ, draft CITDP, PLAN, and tracker only. No production code or RED tests. |
| **2** | `refine-plan` | Locked stack wf-trial-ts-node-test-v1. Pre-implementation gate allowed. Receipt tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/gates/pre_implementation-2026-11-09T01-58-51-659Z.json. |
| **3** | `build-plan` | RED then GREEN. npm test and typecheck passed. Verification gate allowed. Receipt tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/gates/verification-2026-11-09T02-09-54-774Z.json. |
| **4** | `close-out` | depth_tier minimal, gate_policy advisory. tied_gate_check allowed true. Envelope blocking gaps 0. Reconcile without --sync-dispositions. |

**Cross-turn harness notes:** orchestrator **`exit_code: 0`**; **4** distinct `session_id` lines (e4fc8aca, 3deb4868, b8fd1bb9, 594b10ad…); WritableIterable in stderr: **no**.

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| (facilitator) | `REQ-PRODUCER_CONSUMER_WIRING` | REQ index + PLAN under `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | inventory + `package.json` |

---

## What was built

- **Product:** TypeScript under `src/` with facilitator **`9/9`** green `node:test` cases.
- **TIED:** REQ/ARCH/IMPL + CITDP on disk; close-out handoff per inventory.
- **Git:** feature **`b758ff0`** `feat(wiring): add producer consumer seam` (bootstrap + traceable feature pattern).
- **Orchestrator:** `workflow_trial_agentstream wf-03`, **`grok-4.7-medium-fast`**, **`wf-trial-ts-node-test-v1`**.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **9/9**; `tied_validate_consistency` **`ok: true`**.

**Workflow outcome:** **Complete** — orchestrator **`exit_code: 0`**; inventory marks four sponsor turns **completed**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Inventory turn 4 `close_out_gate_receipt` when present |
| **Process contract** | **pass** | Four-turn handoffs; envelope/gates per close-out notes |
| **Adherence ledger** | **partial** | Typical minimal-depth thin ledger unless reconcile run |
| **Close-out honesty** | **pass** | Traceable commit **`b758ff0`** with green tests |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-PRODUCER_CONSUMER_WIRING.yaml` |
| PLAN | `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-03-1794188384-wf-agentstream-wf-03-cursor-grok47med/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | scaffold_complete — REQ, draft CITDP, PLAN, and tracker only. No production code or RED tests. |
| 2 | `refine-plan` | plan_refined — Locked stack wf-trial-ts-node-test-v1. Pre-implementation gate allowed. Receipt tied-project/working/REQ-PRODUCER_CONSUM |
| 3 | `build-plan` | verification_allowed — RED then GREEN. npm test and typecheck passed. Verification gate allowed. Receipt tied-project/working/REQ-PRODUCER_CONS |
| 4 | `close-out` | close_out_allowed — depth_tier minimal, gate_policy advisory. tied_gate_check allowed true. Envelope blocking gaps 0. Reconcile without --sy |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Stderr** | Stack seed; four turn banners; **4** `session_id=` lines |

**Friction bullets:**

- `DIAGNOSTIC: WF trial stack seeded` — TypeScript trial stack
- Four `--- turn N/4 (new session) ---` banners
- Session ids: `e4fc8aca…`, `3deb4868…`, `b8fd1bb9…`, `594b10ad…`
- WritableIterable: **no**

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **Two commits** — bootstrap then feature **`b758ff0`** |
| Inventory vs git | Four turns **completed** |
| Uncertainty | Per-turn SHAs not in inventory — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **9** passed |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Contract locked in refine before code |
| Traceability closure | **A−** | R+A+I + CITDP; facilitator consistency **true** |
| Test strategy | **A** | GREEN suite **9** cases |
| Algorithm / implementation | **A−** | Matches PROMPT-WF-03 scope |
| Process adherence | **A−** | close_out + envelope pattern |
| Workflow choreography | **A** | Four sessions; inventory complete; orchestrator **`0`** |
| Methodology learning readout | **A−** | Documents **grok47-med** cell on **4.2.1** matrix |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; compare harness exit with facilitator `npm test` and inventory.

---

## Cross-model notes (PROMPT-WF-03)

First published **grok47-med** readout for this prompt on **4.2.1**. Compare with [Composer 2.5](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) and [luna-low / luna-high](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) cells when cohort claims matter — no ranking.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-09 Cursor grok-4.7-medium-fast** **workflow complete** row for PROMPT-WF-03 in the **179418***…**179420*** batch (eight-prompt matrix).

---

## TIED version / dogfood

Session **4.2.1** on disposable bootstrap — records successful four-phase agentstream on the TypeScript trial stack; **not** an effectiveness claim.

---

## Facilitator follow-ups

- Optional `tied_adherence_reconcile_run` if sponsor wants ledger **pass** vs thin waiver.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-03-1794188384-wf-agentstream-wf-03-cursor-grok47med/evidence/)
