# Trial readout: PROMPT-WF-09 → Claude Sonnet 5.5 (low effort) → `1794586024-wf-agentstream-wf-09-claude-claudesonnet55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-09`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `claude-sonnet-5-5` (`low` effort) |
| **Model slug** | `claude-sonnet-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794586024-wf-agentstream-wf-09-claude-claudesonnet55low` |
| **Factory tag** | `1794586024-wf-agentstream-wf-09-claude-claudesonnet55low` |
| **Product REQ** | `REQ-CONCURRENT_ORDERED_MAP` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-CONCURRENT_ORDERED_MAP/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | Second **4.2.2** Sonnet **low** WF-09 cell after [1794352390](trial-readout-PROMPT-WF-09-claudesonnet55low-1794352390-wf-agentstream-wf-09-claude-claudesonnet55low.md); **`workflow complete`** with product commit vs peer split signal. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

**Catalog stress:** ordered parallel map (**TIED-DEMO-10**). **Proof boundary:** executable behavior + orchestrator log + facilitator replay — HMEP metrics are independent of session grades.

---

## What was built

- **Product:** `src/orderedMap.ts` + colocated tests; facilitator **`npm test` 7/7** pass.
- **TIED:** `REQ-CONCURRENT_ORDERED_MAP` with persisted CITDP on client; R+A+I indexes + pseudo-code sidecar; client **CHANGELOG** and close-out gates.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~213s** (~3.5 min).
- **Git:** product pin **`e0183b7`** on client (not store).
- **Project size layers:** atoms REQ **1** / ARCH **1** / IMPL **1**; unit tests **7**; composition **0**; applied_lines **8** ([facilitator snapshot](../../tied-project/working/FACILITATOR-WF-09-1794586024-wf-agentstream-wf-09-claude-claudesonnet55low/evidence/project-size-snapshot.v1.json)).

---

## Outcome record

**Implementation outcome:** **Complete** — seven passing unit tests at facilitator replay.

**Workflow outcome:** **Complete (machine)** — `close_out` gate **allowed**; product traceable commit on disposable client. Process contract **partial** (adherence ledger not_run).

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry compact):** 3.28 · A−/B+/B/B+/B/A−/B+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `tied_gate_check` allowed=true; envelope blocking_gaps=0 per client `…/REQ-CONCURRENT_ORDERED_MAP/evidence/phase-handoff-close-out.md` |
| **Process contract** | **partial** | `verification-evidence-manifest.v1.json` missing; `tied_adherence_reconcile_run` not_run |
| **Adherence ledger** | **not_run** | Waived minimal/advisory per close-out handoff |
| **Orchestrator** | **pass** | **`exit_code: 0`** |
| **Composition stress** | **gap** | **`composition_tests: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CONCURRENT_ORDERED_MAP/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Proof manifest | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-09-1794586024-wf-agentstream-wf-09-claude-claudesonnet55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.2** |
| 2 | `refine-plan` | Concurrency + ordering contract (D1–D8) |
| 3 | `build-plan` | RED/GREEN unit tests; **7** cases green |
| 4 | `close-out` | CITDP persist; gates green; **`e0183b7`** product commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794586024-wf-agentstream-wf-09-claude-claudesonnet55low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **213s** |

**Friction excerpts:** `HARNESS=claude` `MODEL_SLUG=claude-sonnet-5-5` `model_effort=low`; default-on **proof manifest** + **phase handoff** gates; `DIAGNOSTIC: wf-trial process log manifest=…`.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs turns | Product commit **`e0183b7`** after build-plan tests; close-out persisted CITDP |
| Composition | No binding/composition test files — aligns with size receipt |
| Uncertainty | Seven unit cases vs nine on peer Sonnet low — not ranked |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **7** pass |
| Composition cohort | **0** composition test files |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Ordered concurrent map locked in refine with explicit concurrency and fail-fast rules. |
| Traceability closure | **B+** | Client REQ/ARCH/IMPL + CITDP on disk with product commit **`e0183b7`**. |
| Test strategy | **B** | Seven deterministic unit cases; still no composition facet for TIED-DEMO-10. |
| Algorithm / implementation | **B+** | `orderedMap` caps concurrency and preserves input order under delayed completions. |
| Process adherence | **B** | Machine close_out allowed; adherence ledger and verification manifest gaps remain. |
| Workflow choreography | **A−** | Orchestrator **`exit_code: 0`** and close-out turn finished with traceable product SHA. |
| Methodology learning readout | **B+** | **4.2.2** Sonnet low shows workflow-complete path vs split-signal Haiku peers on same prompt. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-09)

Pairs with [1794582335](trial-readout-PROMPT-WF-09-claudehaiku55low-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low.md) (Haiku low, split signal, uncommitted tests) and [1794352390](trial-readout-PROMPT-WF-09-claudesonnet55low-1794352390-wf-agentstream-wf-09-claude-claudesonnet55low.md) (Sonnet low **4.2.1**, nine tests, dirty R+A+I). **No ranking.**

---

## Cohort comparisons vs peer WF readouts

Replaces **latest** Sonnet **low** WF-09 registry cell for **4.2.2** with default-on proof manifest + phase-handoff gates. See [runs registry](traditional-workflow-trial-runs-registry.md) row **09 / 1794586024**.

---

## TIED version / dogfood

Session capture **4.2.2** from `tied-methodology-version.session.v1.json` at add-feature — documents disposable bootstrap on current store methodology, not effectiveness of model or effort tier.

---

## Harness-eval utilization (HMEP)

**Import run:** 2026-11-13 — stream-json (four turns). Evidence: [harness-eval-import.md](../../tied-project/working/FACILITATOR-WF-09-1794586024-wf-agentstream-wf-09-claude-claudesonnet55low/evidence/harness-eval-import.md).

| Metric | Value |
| --- | --- |
| `wall_clock_ms` | 213000 |
| `input_tokens` | 44 |
| `output_tokens` | 12030 |
| `reasoning_tokens` | 646 |
| `completeness` | complete |
| `harness_estimated_cost` | 0.180582 (list-price) |

---

## Facilitator follow-ups

- Optional adherence reconcile on disposable client if sponsor wants process contract **pass**.
- Composition/binding tests still open for strict TIED-DEMO-10 proof.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-09-1794586024-wf-agentstream-wf-09-claude-claudesonnet55low/evidence/)
