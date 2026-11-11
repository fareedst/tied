# Trial readout: PROMPT-WF-09 → Claude Haiku 5.5 (low effort) → `1794351557-wf-agentstream-wf-09-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-09`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794351557-wf-agentstream-wf-09-claude-claudehaiku55low` |
| **Factory tag** | `1794351557-wf-agentstream-wf-09-claude-claudehaiku55low` |
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

- **Product:** TypeScript ordered concurrent map under `src/`; facilitator **`npm test` 10/10** pass.
- **TIED:** `REQ-ORDERED_CONCURRENT_MAP` working tree; `src/map-ordered.*`; **composition_tests: 0**; minimal TIED atoms on receipt.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~3 min** (191s).
- **Git:** product / close-out pin **`9655773`** (see facilitator verification).
- **Project size layers:** atoms REQ **0** / ARCH **0** / IMPL **0**; unit tests **10**; composition **0**; applied_lines **0** ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794351557-wf-agentstream-wf-09-claude-claudehaiku55low.json)).

---

## Outcome record

**Implementation outcome:** **Partial** — 10 passing unit tests at facilitator replay.

**Workflow outcome:** **Incomplete** — build turn **complete_with_gaps**; no product commit.

**Grading outcome:** Session bands describe this cell only — not methodology effectiveness or a model leaderboard. **Grade mean (registry):** 2.51 · B+/D+/B−/B+/C/B−/C+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail/partial** | See phase handoff / gate receipts on client when present |
| **Process contract** | **partial** | Minimal advisory depth; adherence ledger often thin |
| **Orchestrator** | **pass** | **`exit_code: 0`**; Turn 3 **complete_with_gaps**; turn 4 **incomplete**; fast ~3.2 min wall clock. |
| **Composition stress** | **gap** | **`composition_tests: 0`** — unit-only proof for PROMPT-WF-09 |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-09-1794351557-wf-agentstream-wf-09-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.1** |
| 2 | `refine-plan` | Concurrency + ordering contract |
| 3 | `build-plan` | Unit tests green (10 cases) |
| 4 | `close-out` | **Incomplete or blocked** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794351557-wf-agentstream-wf-09-claude-claudehaiku55low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **191s** (~3 min) |

**Friction excerpts:** `HARNESS=claude` `MODEL_SLUG=claude-haiku-5-5`; four turn boundaries in `process.stderr.log`; **`DIAGNOSTIC: wf-trial process log manifest=…`**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | **Tests on disk without traceable product commit or dirty R+A+I** |
| Composition | No `tests/composition` or binding-inventory composition cases — aligns with size receipt |
| Uncertainty | Goal-first paste does not mandate module split; agents chose monolithic `src/` |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **10** pass |
| Composition cohort | **0** composition test files — noted for **TIED-DEMO-10** rubric |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | Sponsor goal interpreted as ordered map though REQ index never populated. |
| Traceability closure | **D+** | Bootstrap-only git; working tree holds tests and src without traceable commit. |
| Test strategy | **B−** | Ten unit tests only; no composition files under proof facet classifier. |
| Algorithm / implementation | **B+** | Behavioral core present in `map-ordered` with delay fixtures. |
| Process adherence | **C** | Turn 4 incomplete while orchestrator still reports success exit code. |
| Workflow choreography | **B−** | Short wall clock but build turn logged complete_with_gaps. |
| Methodology learning readout | **C+** | Low-effort Haiku baseline for WF-09 composition cohort comparisons. |

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
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-09-1794351557-wf-agentstream-wf-09-claude-claudehaiku55low/PLAN.md)
