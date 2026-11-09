# Trial readout: PROMPT-WF-06 → Composer 2.5 (Cursor agentstream) → `1794210060-wf-agentstream-wf-06-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-06`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794210060-wf-agentstream-wf-06-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-06-cursor-composer25` |
| **Product REQ** | `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`**; evidence `…/tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Same **1794205*** batch; see WF-01 readout for matrix note. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-06.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | — |
| **2** | `refine-plan` | — |
| **3** | `build-plan` | — |
| **4** | `close-out` | — |

**Cross-turn harness notes:** orchestrator **`exit_code: 0`**; **4** `session_id` lines; WritableIterable: **no**.

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Product scope | `REQ-TOKEN_BUCKET_RATE_LIMITER` | REQ + PLAN under `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | inventory + package |

---

## What was built

- **Product:** TypeScript `src/`; facilitator **`11`** green tests (`0` fail).
- **TIED:** Stack per inventory on disk.
- **Git:** **`a4f1cbc`** — `docs(req): record close-out commit SHA in handoff evidence` (**3** commits on branch).
- **Orchestrator:** `workflow_trial_agentstream wf-06`, **`composer-2.5-fast`**.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **11** pass, **0** fail; `tied_validate_consistency` **`ok: true`**.

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
| REQ | `tied-project/requirements/REQ-TOKEN_BUCKET_RATE_LIMITER.yaml` |
| PLAN | `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-06-1794210060-wf-agentstream-wf-06-cursor-composer25/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | complete — — |
| 2 | `refine-plan` | complete — — |
| 3 | `build-plan` | complete — — |
| 4 | `close-out` | complete — — |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Sessions** | `540e0f4a…`, `92a675ec…`, `d670e36c…`, `97e06a6a…` |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **3** commits; HEAD **`a4f1cbc`** |
| Inventory | Four turns **completed** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **11** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator scope and invalid-input rule were locked in PLAN before implementation. |
| Traceability closure | **A−** | Decision records and code mostly align; traceability gaps remain vs full stack promotion. |
| Test strategy | **A** | 11 green tests cover core behavior with archived RED/GREEN evidence. |
| Algorithm / implementation | **A** | Implementation matches locked PLAN behavior with honest scope limits documented. |
| Process adherence | **A−** | Tracker and handoffs present; adherence ledger or envelope thinner than strict depth. |
| Workflow choreography | **A** | Four orchestrated turns with exit_code 0 and phase handoffs on disk. |
| Methodology learning readout | **A−** | Readout documents cohort friction (harness vs close-out) without turning into a model leaderboard. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-06)

Compare with [grok47-med @ 1794197658](trial-readout-PROMPT-WF-06-grok47-med-1794197658-wf-agentstream-wf-06-cursor-grok47med.md) and prior Composer cells in [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) — no ranking.

---

## TIED version / dogfood

Session **4.2.1** — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-06-1794210060-wf-agentstream-wf-06-cursor-composer25/evidence/)
