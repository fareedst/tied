# Trial readout: PROMPT-WF-01 → Cursor Grok 4.7 (`low`) → `1794531738-wf-agentstream-wf-01-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794531738-wf-agentstream-wf-01-cursor-grok47low` |
| **Factory tag** | `1794531738-wf-agentstream-wf-01-cursor-grok47low` (`disposable_tag` — canonical bucket **`grok47low`**) |
| **Product REQ** | `REQ-SEMVER_RANGE_SATISFIES` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-SEMVER_RANGE_SATISFIES/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-01** **Cursor Grok 4.7 (`low`)** **workflow complete** cell with disposable bucket **`grok47low`** on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** executable_behavior — semver comparator library (numeric `MAJOR.MINOR.PATCH`).

---

## RESOLVE (subject client)

| # | Decision |
| --- | --- |
| 1 | `satisfies(version, comparator): boolean` — operators `>`, `>=`, `<`, `<=`, `=`, `==` |
| 2 | Invalid input returns `false` (no throw) |
| 3 | `npm test` on **`wf-trial-ts-node-test-v1`** |

---

## What was built

- **Product:** `src/satisfies.ts` + colocated tests; facilitator **`npm test` 6/6** pass.
- **TIED:** `REQ-SEMVER_RANGE_SATISFIES` + ARCH/IMPL; **`applied_lines 35`**; CITDP on disposable client; feature commit **`8a2411f`**.
- **Stack:** orchestrator **`exit_code: 0`**; wall **778s** (~13 min).
- **Project size layers:** unit **6** only (receipt); batch **`wall_clock` 13** min · [summary row `wf-01-cursor-grok47low`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md).
- **Proof manifest:** one `unit.default` row for `src/satisfies.test.ts`.

---

## Outcome record

**Implementation outcome:** **Complete** — six passing tests at facilitator replay with R+A+I indexes.

**Workflow outcome:** **Complete** — `close_out` **`allowed: true`**; inventory lists four canonical skills.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.87 · A/A/A−/A−/A/A/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-13T01-13-17-309Z.json` **`allowed: true`** |
| **Process contract** | **pass** | Phase handoff files present; proof manifest populated |
| **Adversarial ledger** | **partial** | Minimal depth; standard waiver posture |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-SEMVER_RANGE_SATISFIES/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-SEMVER_RANGE_SATISFIES/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794531738-wf-agentstream-wf-01-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** captured at add-feature |
| 2 | `refine-plan` | PLAN locked numeric comparator contract |
| 3 | `build-plan` | RED/GREEN **6** tests; verification gate **allowed** |
| 4 | `close-out` | CITDP persist; **`8a2411f`**; close_out **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **778s** (~13 min) |

**Friction excerpts (stderr):** `harness=cursor` `model=grok-4.7-low-fast` `model_effort=low`; `model_config=grok47-low`; `disposable_tag=wf-agentstream-wf-01-cursor-grok47low`; four `--- turn N/4 ---` boundaries; four distinct `session_id=` lines; proof manifest scaffold seeded.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs inventory | Feature **`8a2411f`** before close-out docs commit; four skills **completed** in inventory |
| Proof manifest | Fine **`unit.default`** subtype (not coarse facet) |
| Disposable tag | **`grok47low`** bucket |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **6** pass |

---

## Proof labels (manifest vs path)

| label | cases (receipt) |
| --- | ---: |
| unit.default | 6 |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Numeric comparator and invalid-input rules locked in refine before RED tests. |
| Traceability closure | **A** | Close-out traceable commit **`8a2411f`** ships product code and persisted CITDP. |
| Test strategy | **A−** | Six green unit cases — leaner than the seven-case [grok47-med WF-01 peer](trial-readout-PROMPT-WF-01-grok47-med-1794181275-wf-agentstream-wf-01-cursor-grok47med.md). |
| Algorithm / implementation | **A−** | Single-module delivery matching PROMPT-WF-01 scope. |
| Process adherence | **A** | Close-out allowed at minimal depth with envelope blocking gaps zero. |
| Workflow choreography | **A** | Orchestrator exit zero after four turns with matching inventory. |
| Methodology learning readout | **A−** | First **Grok 4.7 low** WF-01 complete cell on **4.2.2** with canonical **`grok47low`** disposable bucket. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-01)

Contrasts with [Grok 4.7 medium @ 1794181275](trial-readout-PROMPT-WF-01-grok47-med-1794181275-wf-agentstream-wf-01-cursor-grok47med.md) (**7** tests, session **4.2.1**) and [Grok 4.7 low WF-10 @ 1794522969](trial-readout-PROMPT-WF-10-grok47low-1794522969-wf-agentstream-wf-10-cursor-grok47low.md) on a different prompt — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-12 Cursor grok-4.7-low-fast** **workflow complete** row for **PROMPT-WF-01** with **`applied_lines` 35** and six unit tests.

---

## TIED version / dogfood

Session **4.2.2** on disposable client — facilitator replay only; not an effectiveness claim.

---

## Facilitator follow-ups

- Pair **grok47** **medium/high** on **PROMPT-WF-01** after compose catalog stabilizes on **4.2.2**.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-01-1794531738-wf-agentstream-wf-01-cursor-grok47low/evidence/build-plan-verification-evidence.md)
