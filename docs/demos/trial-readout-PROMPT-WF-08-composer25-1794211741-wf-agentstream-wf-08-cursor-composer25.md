# Trial readout: PROMPT-WF-08 → Composer 2.5 (Cursor agentstream) → `1794211741-wf-agentstream-wf-08-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-08`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794211741-wf-agentstream-wf-08-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-08-cursor-composer25` |
| **Product REQ** | `REQ-EXPLICIT_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`**; evidence `…/tied-project/working/REQ-EXPLICIT_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Same **1794205*** batch; see WF-01 readout for matrix note. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-08.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | REQ-EXPLICIT_STATE_MACHINE, draft CITDP, PLAN, tracker, methodology 4.2.1 evidence, phase handoff. No product code or RED tests. |
| **2** | `refine-plan` | Locked stack and transition table; ARCH/IMPL + pseudo-code; PLAN and CITDP updated; pre_implementation gate advisory blocked. No product code or RED tests. |
| **3** | `build-plan` | RED/GREEN state machine under src/stateMachine/; npm test 4/4; verification manifest and RED stdout archived; close-out deferred. |
| **4** | `close-out` | Persisted CITDP; envelope backfill N/A receipt; close_out gate allowed; traceable commit; machine close-out pass, process/adherence partial per minimal advisory WF trial. |

**Cross-turn harness notes:** orchestrator **`exit_code: 0`**; **4** `session_id` lines; WritableIterable: **yes**.

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Product scope | `REQ-EXPLICIT_STATE_MACHINE` | REQ + PLAN under `tied-project/working/REQ-EXPLICIT_STATE_MACHINE/` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | inventory + package |

---

## What was built

- **Product:** TypeScript `src/`; facilitator **`4`** green tests (`0` fail).
- **TIED:** Stack per inventory on disk.
- **Git:** **`44569db`** — `feat(stateMachine): explicit three-state FSM [REQ-EXPLICIT_STATE_MACHINE]` (**2** commits on branch).
- **Orchestrator:** `workflow_trial_agentstream wf-08`, **`composer-2.5-fast`**.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **4** pass, **0** fail; `tied_validate_consistency` **`ok: true`**.

**Workflow outcome:** **Split signal** — orchestrator **`exit_code: 0`**.

**Grading outcome:** Session-only bands; not a leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **partial / not_run** | Per inventory turn 4 |
| **Process contract** | **pass** | Four-turn inventory |
| **Adherence ledger** | **partial** | Typical minimal depth |
| **Close-out honesty** | **partial** | Align git + tests with claims |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-EXPLICIT_STATE_MACHINE.yaml` |
| PLAN | `tied-project/working/REQ-EXPLICIT_STATE_MACHINE/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-EXPLICIT_STATE_MACHINE/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794211741-wf-agentstream-wf-08-cursor-composer25/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | undefined — REQ-EXPLICIT_STATE_MACHINE, draft CITDP, PLAN, tracker, methodology 4.2.1 evidence, phase handoff. No product code or RED tests. |
| 2 | `refine-plan` | undefined — Locked stack and transition table; ARCH/IMPL + pseudo-code; PLAN and CITDP updated; pre_implementation gate advisory blocked. No product cod |
| 3 | `build-plan` | undefined — RED/GREEN state machine under src/stateMachine/; npm test 4/4; verification manifest and RED stdout archived; close-out deferred. |
| 4 | `close-out` | undefined — Persisted CITDP; envelope backfill N/A receipt; close_out gate allowed; traceable commit; machine close-out pass, process/adherence partial  |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Sessions** | `c29805be…`, `af853a96…`, `5ef4f672…`, `715d7b60…` |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **2** commits; HEAD **`44569db`** |
| Inventory | Gaps in turn status |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **4** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Refine locks three states, two events, transition table, and `StateTransitionError` shape before RED — matches PROMPT-WF-08 stress; small ding for inventory omitting per-turn `status` fields. |
| Traceability closure | **A−** | REQ/ARCH/IMPL + pseudo-code on disk; traceable **`44569db`**; facilitator `tied_validate_consistency` **ok**; post-run dirty `phase-handoff-close-out` / traceable-commit evidence weakens close-out promotion vs REQ **Implemented**. |
| Test strategy | **B+** | **4/4** green `node:test` cases cover legal multi-step path, illegal transition, and documented error fields — meets catalog minimum; leaner than [Composer WF-08 @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md) RED archive narrative. |
| Algorithm / implementation | **A** | Table-driven explicit FSM under `src/stateMachine/`; illegal transitions throw `StateTransitionError` without mutating state — behavior matches locked PLAN table. |
| Process adherence | **B+** | `close_out` gate receipt **`allowed: true`** and CITDP persisted; turn-4 notes admit **process/adherence partial** at minimal depth; untracked orchestrator log tree and modified handoffs keep three-way **partial** despite harness **`0`**. |
| Workflow choreography | **A−** | Four distinct `session_id` lines and orchestrator **`exit_code: 0`**; inventory narrative complete but no turn `status`; **split signal** — product proof + machine pass vs incomplete facilitator completion table. |
| Methodology learning readout | **B+** | Contrasts this **1794205*** cell with **workflow complete** [grok47-med @ 1794202372](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) and prior Composer gold — separates harness success from evidence-tree hygiene without ranking models. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-08)

Compare with [grok47-med @ 1794202372](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) and prior Composer cells in [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) — no ranking.

---

## TIED version / dogfood

Session **4.2.1** — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-08-1794211741-wf-agentstream-wf-08-cursor-composer25/evidence/)
