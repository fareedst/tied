# Trial readout: PROMPT-WF-01 → Composer 2.5 (Cursor agentstream) → `1794205559-wf-agentstream-wf-01-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794205559-wf-agentstream-wf-01-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-01-cursor-composer25` |
| **Product REQ** | `REQ-SEMVER_SATISFIES` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`**; evidence `…/tied-project/working/REQ-SEMVER_SATISFIES/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **Composer 2.5** batch **1794205***…**1794211*** on **4.2.1**; pairs [grok47-med matrix @ 2026-11-09](CHANGELOG.md). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-01.

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
| Product scope | `REQ-SEMVER_SATISFIES` | REQ + PLAN under `tied-project/working/REQ-SEMVER_SATISFIES/` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | inventory + package |

---

## What was built

- **Product:** TypeScript `src/`; facilitator **`12`** green tests (`0` fail).
- **TIED:** Stack per inventory on disk.
- **Git:** **`85e8127`** — `feat(semver): satisfy comparator predicate for WF trial` (**2** commits on branch).
- **Orchestrator:** `workflow_trial_agentstream wf-01`, **`composer-2.5-fast`**.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **12** pass, **0** fail; `tied_validate_consistency` **`ok: true`**.

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
| REQ | `tied-project/requirements/REQ-SEMVER_SATISFIES.yaml` |
| PLAN | `tied-project/working/REQ-SEMVER_SATISFIES/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-SEMVER_SATISFIES/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794205559-wf-agentstream-wf-01-cursor-composer25/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | completed — — |
| 2 | `refine-plan` | completed — — |
| 3 | `build-plan` | completed — — |
| 4 | `close-out` | completed — — |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Sessions** | `0dbd5e12…`, `4368e729…`, `80d15d36…`, `81ca6da9…` |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **2** commits; HEAD **`85e8127`** |
| Inventory | Gaps in turn status |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **12** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator scope and invalid-input rule were locked in PLAN before implementation. |
| Traceability closure | **A−** | Decision records and code mostly align; traceability gaps remain vs full stack promotion. |
| Test strategy | **A** | 12 green tests cover core behavior with archived RED/GREEN evidence. |
| Algorithm / implementation | **A** | Implementation matches locked PLAN behavior with honest scope limits documented. |
| Process adherence | **A−** | Tracker and handoffs present; adherence ledger or envelope thinner than strict depth. |
| Workflow choreography | **A** | Four orchestrated turns with exit_code 0 and phase handoffs on disk. |
| Methodology learning readout | **A−** | Readout documents cohort friction (harness vs close-out) without turning into a model leaderboard. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-01)

Compare with [grok47-med @ 1794181275](trial-readout-PROMPT-WF-01-grok47-med-1794181275-wf-agentstream-wf-01-cursor-grok47med.md) and prior Composer cells in [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) — no ranking.

---

## TIED version / dogfood

Session **4.2.1** — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-01-1794205559-wf-agentstream-wf-01-cursor-composer25/evidence/)
