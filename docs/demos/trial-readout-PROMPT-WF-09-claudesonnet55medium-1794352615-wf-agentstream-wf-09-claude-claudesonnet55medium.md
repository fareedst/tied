# Trial readout: PROMPT-WF-09 → Claude Sonnet 5.5 (medium effort) → `1794352615-wf-agentstream-wf-09-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-09`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `sonnet-5-5` (`medium` effort) |
| **Model slug** | `claude-sonnet-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794352615-wf-agentstream-wf-09-claude-claudesonnet55medium` |
| **Factory tag** | `1794352615-wf-agentstream-wf-09-claude-claudesonnet55medium` |
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

- **Product:** TypeScript ordered concurrent map under `src/`; facilitator **`npm test` 11/11** pass.
- **TIED:** `REQ-ORDERED_CONCURRENT_MAP` working tree; Single-module `ordered-map`; ARCH/IMPL indexes present on receipt.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~5 min** (286s).
- **Git:** product / close-out pin **`fbfaeda`** (see facilitator verification).
- **Project size layers:** atoms REQ **1** / ARCH **1** / IMPL **1**; unit tests **11**; composition **0**; applied_lines **23** ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794352615-wf-agentstream-wf-09-claude-claudesonnet55medium.json)).

---

## Outcome record

**Implementation outcome:** **Delivered** — 11 passing unit tests at facilitator replay.

**Workflow outcome:** **Complete** — product commit after bootstrap; facilitator tests green.

**Grading outcome:** Session bands describe this cell only — not methodology effectiveness or a model leaderboard. **Grade mean (registry):** 3.43 · A/B+/B/A−/B/A−/B+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | See phase handoff / gate receipts on client when present |
| **Process contract** | **partial** | Minimal advisory depth; adherence ledger often thin |
| **Orchestrator** | **pass** | **`exit_code: 0`**; Sonnet medium effort cell; ~4.8 min wall; committed product SHA. |
| **Composition stress** | **gap** | **`composition_tests: 0`** — unit-only proof for PROMPT-WF-09 |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-09-1794352615-wf-agentstream-wf-09-claude-claudesonnet55medium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.1** |
| 2 | `refine-plan` | Concurrency + ordering contract |
| 3 | `build-plan` | Unit tests green (11 cases) |
| 4 | `close-out` | **Gate pass + commit** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794352615-wf-agentstream-wf-09-claude-claudesonnet55medium/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **286s** (~5 min) |

**Friction excerpts:** `HARNESS=claude` `MODEL_SLUG=claude-sonnet-5-5`; four turn boundaries in `process.stderr.log`; **`DIAGNOSTIC: wf-trial process log manifest=…`**.

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
| Facilitator `npm test` | **11** pass |
| Composition cohort | **0** composition test files — noted for **TIED-DEMO-10** rubric |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Ordered async map acceptance criteria reflected in PLAN and tests. |
| Traceability closure | **B+** | Committed product SHA with ARCH/IMPL index entries on size receipt. |
| Test strategy | **B** | Eleven unit tests green; composition facet count remains zero. |
| Algorithm / implementation | **A−** | Implementation preserves input order under concurrent completion. |
| Process adherence | **B** | Close-out evidence lighter than high-effort peer but git is clean. |
| Workflow choreography | **A−** | Medium Sonnet effort completes four turns with exit 0. |
| Methodology learning readout | **B+** | Middle cell between low split signals and high complete readout. |

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
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-09-1794352615-wf-agentstream-wf-09-claude-claudesonnet55medium/PLAN.md)
