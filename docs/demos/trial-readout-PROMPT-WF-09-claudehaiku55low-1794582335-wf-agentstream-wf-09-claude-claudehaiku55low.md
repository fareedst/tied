# Trial readout: PROMPT-WF-09 → Claude Haiku 5.5 (low effort) → `1794582335-wf-agentstream-wf-09-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-09`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `claude-haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794582335-wf-agentstream-wf-09-claude-claudehaiku55low` |
| **Factory tag** | `1794582335-wf-agentstream-wf-09-claude-claudehaiku55low` |
| **Product REQ** | `REQ-ORDERED_CONCURRENT_MAP` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | Third **4.2.2** Haiku **low** WF-09 cell after [1794579829](trial-readout-PROMPT-WF-09-claudehaiku55low-1794579829-wf-agentstream-wf-09-claude-claudehaiku55low.md); same close-out blocker pattern; **9/9** unit tests vs peer **8/8**; **composition_tests: 0**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

**Catalog stress:** ordered parallel map (**TIED-DEMO-10**). **Proof boundary:** executable behavior + orchestrator log + facilitator replay — not HMEP token/cost metrics.

---

## What was built

- **Product:** `src/ordered-concurrent-map.ts` with limit / fail-fast; facilitator **`npm test` 9/9** pass.
- **TIED:** Working tree under `REQ-ORDERED_CONCURRENT_MAP`; R+A+I persist and traceable commit **not** completed.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~206s** (~3.4 min).
- **Git:** bootstrap-only **`eb027b6`** (`TIED 4.2.2`); product + TIED artifacts uncommitted.
- **Project size layers:** atoms REQ **1** / ARCH **0** / IMPL **0**; unit tests **9**; composition **0**; applied_lines **0** ([facilitator snapshot](../../tied-project/working/FACILITATOR-WF-09-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low/evidence/project-size-snapshot.v1.json)).

---

## Outcome record

**Implementation outcome:** **Partial** — nine passing unit tests at facilitator replay.

**Workflow outcome:** **Incomplete** — build turn finished implementation and proof-manifest validate; **verification** and **close_out** gates blocked; no product commit.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry compact):** 2.56 · B+/D+/B/B+/C/B−/C+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` — missing persisted CITDP + adversarial fields |
| **Process contract** | **partial** | `sub-close-out-evidence-sync` / traceable-commit not run |
| **Adherence ledger** | **not_run** | No `tied_adherence_reconcile_run` on client |
| **Orchestrator** | **pass** | **`exit_code: 0`** |
| **Composition stress** | **gap** | **`composition_tests: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` (sparse turn list — validate at next recorder pass) |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Proof manifest | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` — `tied_wf_proof_manifest_validate` **ok** per build handoff |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-09-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold in client index; session semver **4.2.2** |
| 2 | `refine-plan` | **complete** — D1–D8 + test strategy design |
| 3 | `build-plan` | **complete_verification_gate_skipped** — 9/9 tests; proof manifest green |
| 4 | `close-out` | **incomplete_close_out_gate_blocked** — no commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794582335-wf-agentstream-wf-09-claude-claudehaiku55low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **206s** |

**Friction excerpts:**

- `DIAGNOSTIC: tied_methodology_version=4.2.2 source=orchestrator_resolver`
- `DIAGNOSTIC: harness=claude model=claude-haiku-5-5 model_effort=low`
- `DIAGNOSTIC: proof manifest scaffold seeded` (default-on proof manifest gate)
- `DIAGNOSTIC: WF trial phase handoff gate: default on`
- `DIAGNOSTIC: wf-trial process log manifest=…/wf-trial-orchestrator-run.v1.json`

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | **9/9** tests on disk; only bootstrap commit **`eb027b6`** — no traceable product commit |
| R+A+I persist | `persist-implementation-records` still pending per build-plan handoff |
| Composition | No composition test files — consistent with size receipt |
| Gate mismatch | Close-out blocked on missing CITDP adversarial block; verification gate never run |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **9** pass |
| Composition cohort | **0** composition test files |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | Ordered concurrent map matches sponsor paste; D1–D8 locked in refine. |
| Traceability closure | **D+** | Bootstrap-only git; green tests uncommitted; ARCH/IMPL + CITDP not persisted. |
| Test strategy | **B** | Nine deterministic cases including input immutability; still unit-only. |
| Algorithm / implementation | **B+** | Concurrency cap, fail-fast, and index-aligned output in one module. |
| Process adherence | **C** | Close-out blocked while orchestrator reports success. |
| Workflow choreography | **B−** | Sub-four-minute wall; verification and close_out gates not satisfied. |
| Methodology learning readout | **C+** | Repeat **4.2.2** Haiku-low WF-09 split-signal; proof manifest validated on disk — not ranked vs [1794579829](trial-readout-PROMPT-WF-09-claudehaiku55low-1794579829-wf-agentstream-wf-09-claude-claudehaiku55low.md). |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-09)

Pairs with [1794579829](trial-readout-PROMPT-WF-09-claudehaiku55low-1794579829-wf-agentstream-wf-09-claude-claudehaiku55low.md) (**8/8** tests, **229s**) and [1794351557](trial-readout-PROMPT-WF-09-claudehaiku55low-1794351557-wf-agentstream-wf-09-claude-claudehaiku55low.md) (**4.2.1**). Same Haiku **low** harness path; **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Adds a **4.2.2** replay datapoint for PROMPT-WF-09 Claude Haiku low. See [runs registry](traditional-workflow-trial-runs-registry.md) row **09 / 1794582335**.

---

## TIED version / dogfood

Session capture **4.2.2** from `tied-methodology-version.session.v1.json` at add-feature — documents disposable bootstrap on current store methodology, not effectiveness of model or effort tier.

---

## Harness-eval utilization (HMEP)

**Import run:** 2026-11-13 manifest-only, then **stream-json re-import** (four turns). Evidence: [harness-eval-import.md](../../tied-project/working/FACILITATOR-WF-09-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low/evidence/harness-eval-import.md).

| Metric | Value |
| --- | --- |
| `wall_clock_ms` | 206000 |
| `input_tokens` | 32 |
| `output_tokens` | 14424 |
| `reasoning_tokens` | 3731 |
| `completeness` | complete |
| `harness_estimated_cost` | 0.057722 (list-price) |

---

## Facilitator follow-ups

- Sponsor choice: minimal-depth adversarial CITDP waiver vs integrated inquiry before close-out on future cells.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-09-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low/evidence/)
