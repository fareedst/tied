# Trial readout: PROMPT-WF-09 → Claude Haiku 5.5 (high effort) → `1794350685-wf-agentstream-wf-09-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-09`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `haiku-5-5` (`high` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794350685-wf-agentstream-wf-09-claude-claudehaiku55high` |
| **Factory tag** | `1794350685-wf-agentstream-wf-09-claude-claudehaiku55high` |
| **Product REQ** | `REQ-ORDERED_CONCURRENT_MAP` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** (`tied-methodology-version.session.v1.json` turn add-feature) |
| **Cohort comparison** | Claude **WF-09** effort matrix (`low` / `medium` / `high`) on **4.2.1**; composition stress **TIED-DEMO-10** — all cells **`composition_tests: 0`** on size receipt. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

**Catalog stress:** ordered parallel map (**TIED-DEMO-10**) — goal-first paste; facilitator grades **Composition evidence** from binding/composition test files. **Proof boundary:** executable behavior + orchestrator log + facilitator replay.

---

## What was built

- **Product:** TypeScript ordered concurrent map under `src/`; facilitator **`npm test` 20/20** pass.
- **TIED:** `REQ-ORDERED_CONCURRENT_MAP` working tree; Monolithic mapper; close-out documents thin adherence ledger (process grade D waived).
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~14 min** (838s).
- **Git:** product / close-out pin **`1f311d9`** (see facilitator verification).
- **Project size layers:** atoms REQ **1** / ARCH **1** / IMPL **1**; unit tests **14**; composition **0**; applied_lines **75** ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794350685-wf-agentstream-wf-09-claude-claudehaiku55high.json)).

---

## Outcome record

**Implementation outcome:** **Delivered** — 20 passing unit tests at facilitator replay.

**Workflow outcome:** **Complete** — machine close_out pass; traceable commit; orchestrator **`0`** aligned.

**Grading outcome:** Session bands describe this cell only — not methodology effectiveness or a model leaderboard. **Grade mean (registry):** 3.57 · A/B+/B/A/B+/A−/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | See phase handoff / gate receipts on client when present |
| **Process contract** | **partial** | Minimal advisory depth; adherence ledger often thin |
| **Orchestrator** | **pass** | **`exit_code: 0`**; Inventory documents add-feature → refine-plan → build-plan → close-out with gate pass. |
| **Composition stress** | **gap** | **`composition_tests: 0`** — unit-only proof for PROMPT-WF-09 |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-09-1794350685-wf-agentstream-wf-09-claude-claudehaiku55high/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.1** |
| 2 | `refine-plan` | Concurrency + ordering contract |
| 3 | `build-plan` | Unit tests green (20 cases) |
| 4 | `close-out` | **Gate pass + commit** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794350685-wf-agentstream-wf-09-claude-claudehaiku55high/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **838s** (~14 min) |

**Friction excerpts:** `HARNESS=claude` `MODEL_SLUG=claude-haiku-5-5`; four turn boundaries in `process.stderr.log`; **`DIAGNOSTIC: wf-trial process log manifest=…`**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | **Product commit after bootstrap** |
| Composition | No `tests/composition` or binding-inventory composition cases — aligns with size receipt |
| Uncertainty | Goal-first paste does not mandate module split; agents chose monolithic `src/` |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **20** pass |
| Composition cohort | **0** composition test files — noted for **TIED-DEMO-10** rubric |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | REFINE locked concurrency semantics and rejection behavior before implementation. |
| Traceability closure | **B+** | Traceable commit and envelope pass; adherence ledger thin per close-out handoff. |
| Test strategy | **B** | Twenty unit tests pass; TIED-DEMO-10 composition facet still absent on disk. |
| Algorithm / implementation | **A** | Delivered ordered concurrent map with documented fail-fast semantics. |
| Process adherence | **B+** | Machine close_out allowed with honest waiver on process grade D. |
| Workflow choreography | **A−** | Four sponsor turns align with exit 0 and committed SHA. |
| Methodology learning readout | **A−** | High-effort Haiku shows complete workflow without multi-module binding proof. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-09)

Six-cell Claude matrix (`haiku-5-5` and `sonnet-5-5` × `low` / `medium` / `high` effort) recorded **2026-11-10** batch. All cells satisfy ordered-map **unit** behavior; **none** recorded composition/binding test files. No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **PROMPT-WF-09** Claude agentstream rows for the **REQ-WF_TRIAL_MODEL_EFFORT** matrix. See [project size comparison table](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md).

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** on disposable bootstrap line — not an effectiveness claim for Claude or effort tiers.

---

## Facilitator follow-ups

- Record Cursor `composer-2.5` / `grok47-med` WF-09 cells for cross-harness composition comparison.
- Optional: architect-in-paste or graded **Composition evidence** follow-up trials with required binding tests.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-09-1794350685-wf-agentstream-wf-09-claude-claudehaiku55high/PLAN.md)
