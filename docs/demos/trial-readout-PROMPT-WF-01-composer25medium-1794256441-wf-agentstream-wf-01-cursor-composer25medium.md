# Trial readout: PROMPT-WF-01 → Composer 2.5 medium (cursor agentstream) → `1794256441-wf-agentstream-wf-01-cursor-composer25medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `composer.2.5` + effort `medium` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794256441-wf-agentstream-wf-01-cursor-composer25medium` |
| **Factory tag** | `wf-agentstream-wf-01-cursor-composer25medium` |
| **Product REQ** | `REQ-SEMVER_SATISFIES` |
| **TIED methodology version (session)** | **4.2.1** — bootstrap / install_json when session file absent |
| **Cohort comparison** | **REQ-WF_TRIAL_MODEL_EFFORT** matrix batch **1794246*** — model slug + effort tier dogfood |

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
| **1–4** | four-phase | Model-effort bracket / effort CLI ([REQ-WF_TRIAL_MODEL_EFFORT]); see orchestrator stderr |
| **Harness** | — | orchestrator **`exit_code: 0`**; **4** `session_id` lines; WritableIterable: **yes** |

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Product scope | `REQ-SEMVER_SATISFIES` | `tied-project/working/REQ-SEMVER_SATISFIES` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | package.json |

---

## What was built

- **Product:** TypeScript `src/`; facilitator **`7`** green tests (`0` fail).
- **TIED:** Stack per working PLAN/REQ on disk.
- **Git:** **`69ea2bd`** — docs(semver): record final traceable commit SHA in close-out evidence (**3** commits).
- **Orchestrator:** `model_effort=medium`; wall **1416**s.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **7** pass, **0** fail; `tied_validate_consistency` **ok**.

**Workflow outcome:** **Complete** — orchestrator **`exit_code: 0`**.

**Grading outcome:** Session-only bands; not a leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Per four-turn completion |
| **Process contract** | **pass** | Orchestrated four-phase batch |
| **Adherence ledger** | **partial** | minimal depth |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-SEMVER_SATISFIES.yaml` |
| PLAN | `tied-project/working/REQ-SEMVER_SATISFIES/PLAN.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794256441-wf-agentstream-wf-01-cursor-composer25medium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN scaffold |
| 2 | `refine-plan` | ARCH/IMPL lock |
| 3 | `build-plan` | npm test **7** pass (facilitator) |
| 4 | `close-out` | traceable commit **`69ea2bd`** when present |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Sessions** | `ad6ec179…`, `9f424494…`, `81af4f36…`, `f525d2f8…` |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **3** commits; HEAD **`69ea2bd`** |
| Inventory | not captured |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` (expected) |
| Facilitator `npm test` | **7** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Scope and acceptance criteria locked in PLAN for REQ-SEMVER_SATISFIES before RED tests. |
| Traceability closure | **A−** | Project REQ/ARCH/IMPL present with facilitator npm test 7 pass. |
| Test strategy | **A** | Facilitator npm test reports 7 passing with stack wf-trial-ts-node-test-v1. |
| Algorithm / implementation | **A** | Implementation matches PLAN with 7 green facilitator tests. |
| Process adherence | **A−** | Tracker and phase handoffs on disk; minimal-depth adherence ledger typical. |
| Workflow choreography | **A** | Four session_id lines; orchestrator exit_code 0. |
| Methodology learning readout | **A−** | Documents model-effort matrix run without leaderboard framing. |

**Feedback ingest:** N/A (`--skip-feedback-ingest` batch).

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-01)

Model-effort matrix cell — compare sibling readouts in [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) for same PROMPT-WF; no ranking.

---

## TIED version / dogfood

Session **4.2.1** on **REQ-WF_TRIAL_MODEL_EFFORT** bracket slugs — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-01-1794256441-wf-agentstream-wf-01-cursor-composer25medium/evidence/)
