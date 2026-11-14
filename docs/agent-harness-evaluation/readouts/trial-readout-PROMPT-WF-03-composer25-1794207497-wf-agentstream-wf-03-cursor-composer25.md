# Trial readout: PROMPT-WF-03 → Composer 2.5 (Cursor agentstream) → `1794207497-wf-agentstream-wf-03-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-03`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794207497-wf-agentstream-wf-03-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-03-cursor-composer25` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`**; evidence `…/tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Same **1794205*** batch; see WF-01 readout for matrix note. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-03.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | REQ, draft CITDP, PLAN, and tracker only. No production code or RED tests. |
| **2** | `refine-plan` | Locked stack table; TIED ARCH/IMPL pseudo-code; pre_implementation gate receipt. |
| **3** | `build-plan` | RED/GREEN TDD; verification gate allowed; npm test 8/8 pass. |
| **4** | `close-out` | Envelope blocking pass; tied_verify; traceable commit; phase-handoff-close-out.md |

**Cross-turn harness notes:** orchestrator **`exit_code: 0`**; **4** `session_id` lines; WritableIterable: **yes**.

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Product scope | `REQ-PRODUCER_CONSUMER_WIRING` | REQ + PLAN under `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | inventory + package |

---

## What was built

- **Product:** TypeScript `src/`; facilitator **`8`** green tests (`0` fail).
- **TIED:** Stack per inventory on disk.
- **Git:** **`fd88ea0`** — `docs(req): list feature and evidence-binding commit SHAs` (**4** commits on branch).
- **Orchestrator:** `workflow_trial_agentstream wf-03`, **`composer-2.5-fast`**.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **8** pass, **0** fail; `tied_validate_consistency` **`ok: true`**.

**Workflow outcome:** **Complete** — orchestrator **`exit_code: 0`**.

**Grading outcome:** Session-only bands; not a leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Per inventory turn 4 |
| **Process contract** | **pass** | Four-turn inventory |
| **Adherence ledger** | **partial** | Typical minimal depth |
| **Close-out honesty** | **pass** | Align git + tests with claims |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-PRODUCER_CONSUMER_WIRING.yaml` |
| PLAN | `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-03-1794207497-wf-agentstream-wf-03-cursor-composer25/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | scaffold_complete — REQ, draft CITDP, PLAN, and tracker only. No production code or RED tests. |
| 2 | `refine-plan` | refine_complete — Locked stack table; TIED ARCH/IMPL pseudo-code; pre_implementation gate receipt. |
| 3 | `build-plan` | build_complete — RED/GREEN TDD; verification gate allowed; npm test 8/8 pass. |
| 4 | `close-out` | close_out_complete — Envelope blocking pass; tied_verify; traceable commit; phase-handoff-close-out.md |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Sessions** | `c6b33567…`, `c483f8ed…`, `8f677929…`, `36167925…` |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **4** commits; HEAD **`fd88ea0`** |
| Inventory | Gaps in turn status |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **8** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator scope and invalid-input rule were locked in PLAN before implementation. |
| Traceability closure | **A−** | Decision records and code mostly align; traceability gaps remain vs full stack promotion. |
| Test strategy | **A** | 8 green tests cover core behavior with archived RED/GREEN evidence. |
| Algorithm / implementation | **A** | Implementation matches locked PLAN behavior with honest scope limits documented. |
| Process adherence | **A−** | Tracker and handoffs present; adherence ledger or envelope thinner than strict depth. |
| Workflow choreography | **A** | Four orchestrated turns with exit_code 0 and phase handoffs on disk. |
| Methodology learning readout | **A−** | Readout documents cohort friction (harness vs close-out) without turning into a model leaderboard. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-03)

Compare with [grok47-med @ 1794188384](trial-readout-PROMPT-WF-03-grok47-med-1794188384-wf-agentstream-wf-03-cursor-grok47med.md) and prior Composer cells in [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) — no ranking.

---

## TIED version / dogfood

Session **4.2.1** — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-03-1794207497-wf-agentstream-wf-03-cursor-composer25/evidence/)
