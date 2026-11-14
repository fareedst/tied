# Trial readout: PROMPT-WF-01 → Claude Opus 5.5 (low effort) → `1794587975-wf-agentstream-wf-01-claude-claudeopus55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-01`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `claude-opus-5-5` (`low` effort) |
| **Model slug** | `claude-opus-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794587975-wf-agentstream-wf-01-claude-claudeopus55low` |
| **Factory tag** | `1794587975-wf-agentstream-wf-01-claude-claudeopus55low` |
| **Product REQ** | `REQ-SEMVER_SATISFIES` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-SEMVER_SATISFIES/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | First **4.2.2** Opus **low** WF-01 cell; workflow **complete** with traceable product commit. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** baseline four-phase — premature coding vs clean PLAN-only add-feature. **Proof boundary:** executable behavior + orchestrator log + facilitator replay.

---

## What was built

- **Product:** `satisfies()` SemVer comparator in `src/`; facilitator **`npm test` 8/8** pass.
- **TIED:** `REQ-SEMVER_SATISFIES` with CITDP, R+A+I, close-out gates, evidence envelope **0** blocking.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **391s** (~6.5 min).
- **Git:** product pin **`00faf0f`** on client (not store).
- **Project size layers:** atoms REQ **1** / ARCH **1** / IMPL **1**; unit **8**; composition **0** ([facilitator snapshot](../../tied-project/working/FACILITATOR-WF-01-1794587975-wf-agentstream-wf-01-claude-claudeopus55low/evidence/project-size-snapshot.v1.json)).

---

## Outcome record

**Implementation outcome:** **Complete** — eight green unit tests at facilitator replay.

**Workflow outcome:** **Complete (machine)** — `close_out` gate **allowed**; traceable product commit **`00faf0f`**.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry compact):** 3.80 · A/A/A/A/B+/A/B+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-13T16-45-20-915Z.json` **allowed: true** |
| **Process contract** | **partial** | Verification manifest + envelope ok; tracker slug fixes at close-out |
| **Adherence ledger** | **not_run** | Minimal/advisory depth |
| **Orchestrator** | **pass** | **`exit_code: 0`** |
| **Composition stress** | **gap** | **`composition_tests: 0`** (WF-01 baseline) |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-SEMVER_SATISFIES/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794587975-wf-agentstream-wf-01-claude-claudeopus55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.2** |
| 2 | `refine-plan` | Comparator operators + SemVer scope locked |
| 3 | `build-plan` | RED/GREEN; **8** unit cases green; verification gate pass after tracker slug fix |
| 4 | `close-out` | CITDP persist; gates green; **`00faf0f`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794587975-wf-agentstream-wf-01-claude-claudeopus55low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **391s** |

**Friction excerpts:** `HARNESS=claude` `MODEL_SLUG=claude-opus-5-5` `model_effort=low`; default-on **proof manifest** + **phase handoff**; template tracker slugs required canonical rename at verification.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs turns | Product commit **`00faf0f`** at close-out after green tests |
| Inventory | Four sponsor turns recorded |
| Uncertainty | Close-out repaired WF trial tracker slug drift — not ranked vs Sonnet **4.2.1** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **8** pass |
| Composition cohort | **0** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | SemVer operators and invalid-input `TypeError` locked in refine before RED. |
| Traceability closure | **A** | R+A+I + CITDP on disk; traceable commit **`00faf0f`**. |
| Test strategy | **A** | Eight colocated unit cases cover comparators and prerelease edges. |
| Algorithm / implementation | **A** | `satisfies()` matches locked §11-style precedence in tests. |
| Process adherence | **B+** | Machine close_out allowed but close-out turn fixed template tracker slug drift. |
| Workflow choreography | **A** | Orchestrator **`exit_code: 0`**; four turns through close-out with product SHA. |
| Methodology learning readout | **B+** | First **4.2.2** Opus low WF-01 complete cell; pairs Sonnet/Haiku rows without ranking. |

**Feedback ingest:** N/A (facilitator default).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-01)

Pairs with [1794101529](trial-readout-PROMPT-WF-01-claudesonnet55-1794101529-wf-agentstream-wf-01-claude-sonnet55.md) (Sonnet **4.2.1**, **11** tests) and [1794055051](trial-readout-PROMPT-WF-01-claudehaiku55-1794055051-wf-agentstream-wf-01-claude-claudehaiku55.md). **No ranking.**

---

## Cohort comparisons vs peer WF readouts

Adds **latest** Opus **low** WF-01 registry cell on **4.2.2** with default-on proof manifest + phase-handoff gates.

---

## TIED version / dogfood

Session capture **4.2.2** from `tied-methodology-version.session.v1.json` — documents disposable bootstrap on current store methodology, not model effectiveness.

---

## Harness-eval utilization (HMEP)

**Import run:** 2026-11-13 — stream-json (four turns). Evidence: [harness-eval-import.md](../../tied-project/working/FACILITATOR-WF-01-1794587975-wf-agentstream-wf-01-claude-claudeopus55low/evidence/harness-eval-import.md).

| Metric | Value |
| --- | --- |
| `wall_clock_ms` | 391000 |
| `input_tokens` | 52 |
| `output_tokens` | 13574 |
| `reasoning_tokens` | 882 |
| `completeness` | complete |
| `harness_estimated_cost` | null (list-price gap for Opus 5.5) |

---

## Facilitator follow-ups

- Methodology: align `wf-trial-minimal-checklist-tracker.yaml` slugs with canonical checklist.
- Optional HMEP list-price catalog row for `claude-opus-5-5`.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-01-1794587975-wf-agentstream-wf-01-claude-claudeopus55low/evidence/)
