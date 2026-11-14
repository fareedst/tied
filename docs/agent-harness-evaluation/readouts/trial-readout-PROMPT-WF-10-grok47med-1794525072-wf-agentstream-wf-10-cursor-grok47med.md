# Trial readout: PROMPT-WF-10 → Cursor Grok 4.7 (`medium`) → `1794525072-wf-agentstream-wf-10-cursor-grok47med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `grok47-med` |
| **Model slug** | `grok-4.7-medium-fast` |
| **Model effort** | `medium` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794525072-wf-agentstream-wf-10-cursor-grok47med` |
| **Factory tag** | `1794525072-wf-agentstream-wf-10-cursor-grok47med` (`disposable_tag` — canonical bucket **`grok47med`**) |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-10** **Cursor Grok 4.7** (`medium`) **workflow complete** cell with canonical disposable bucket **`grok47med`** per [REQ-WF_TRIAL_RANGE_CANONICAL_INPUT](../../tied-project/requirements/REQ-WF_TRIAL_RANGE_CANONICAL_INPUT.yaml). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste.

---

## RESOLVE (subject client)

| # | Decision |
| --- | --- |
| 1 | `--file` xor `--stdin`; documented misuse errors |
| 2 | Split parse / summary / CLI modules |
| 3 | `cli.binding.test.ts` wires CLI to `parseCsv` |
| 4 | ESM + `node:test`; stack **`wf-trial-ts-node-test-v1`** |

---

## What was built

- **Product:** TypeScript CSV summary CLI under `src/`; facilitator **`npm test` 34/34** pass.
- **TIED:** `REQ-CSV_SUMMARY_CLI` + ARCH/IMPL; **`applied_lines 136`**; persisted `tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml`; close-out commit **`d084fa2`**.
- **Stack:** orchestrator **`exit_code: 0`**; wall **1789s** (~30 min).
- **Project size layers:** unit **31**, comp **3** (receipt); batch **`wall_clock` 30** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794525072-wf-agentstream-wf-10-cursor-grok47med.json) · [summary row `wf-10-cursor-grok47med`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).
- **Proof manifest:** four `files[]` rows + one `bindings[]` wiring row.

---

## Outcome record

**Implementation outcome:** **Complete** — thirty-four passing tests at facilitator replay with full R+A+I indexes.

**Workflow outcome:** **Complete** — `close_out` **`allowed: true`**; inventory lists four canonical skills.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.57 · A/A/A−/A−/B+/A−/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-12T23-38-12-609Z.json` **`allowed: true`** |
| **Process contract** | **pass** | Phase handoff files present; proof manifest populated |
| **Adherence ledger** | **partial** | Minimal depth; typical waiver posture |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794525072-wf-agentstream-wf-10-cursor-grok47med/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** captured |
| 2 | `refine-plan` | PLAN + test strategy |
| 3 | `build-plan` | GREEN **34** tests |
| 4 | `close-out` | CITDP persist; **`d084fa2`**; close_out **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **1789s** (~30 min) |

**Friction excerpts (stderr):** `harness=cursor` `model=grok-4.7-medium-fast` `model_effort=medium`; **`RetriableError: WritableIterable is closed`** on turns **1** and **2**; four `--- turn N/4 ---` boundaries; phase handoff gate default on (no missing-handoff **ERROR**).

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs inventory | Product commit **`d084fa2`** in close-out turn |
| Proof manifest | Wiring binding + unit/composition rows |
| Close-out | CITDP under `tied-project/citdp/` |
| Disposable tag | **`grok47med`** single-tier bucket |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` (inventory) |
| Facilitator `npm test` | **34** pass |
| `package.json` `bin` | **Absent** — CLI exercised in tests |

---

## Proof labels (manifest vs path)

| label | cases (receipt) |
| --- | ---: |
| unit.default | 31 |
| composition.wiring | 3 |

Live runner **34** cases matches receipt unit + comp rollup.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | File vs stdin exclusivity and row/column rules covered by green tests. |
| Traceability closure | **A** | Close-out **`d084fa2`** with persisted CITDP and ARCH/IMPL indexes. |
| Test strategy | **A−** | **34** cases with binding manifest — fewer than [Grok 4.6 medium @ 1794518198](trial-readout-PROMPT-WF-10-grok46med-1794518198-wf-agentstream-wf-10-cursor-grok46medmedium.md) (**49**). |
| Algorithm / implementation | **A−** | Modular `src/` split with **136** applied pseudo-code lines vs **261** on Grok 4.6 medium peer. |
| Process adherence | **B+** | Close-out allowed at minimal depth with standard adversarial waiver posture. |
| Workflow choreography | **A−** | Orchestrator exit zero after four turns despite **WritableIterable** on turns 1–2. |
| Methodology learning readout | **A−** | First **Grok 4.7 medium** WF-10 **complete** row; confirms **`grok-4.7-medium-fast`** + **`grok47med`** disposable bucket. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Versus [Grok 4.7 low @ 1794522969](trial-readout-PROMPT-WF-10-grok47low-1794522969-wf-agentstream-wf-10-cursor-grok47low.md): **34** vs **8** tests, **30** vs **14** min wall, full R+A+I vs thin library delivery. Versus [Grok 4.6 medium @ 1794518198](trial-readout-PROMPT-WF-10-grok46med-1794518198-wf-agentstream-wf-10-cursor-grok46medmedium.md) on same paste — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Mid-high proof footprint for **goal-first-soc** WF-10 on **Grok 4.7**: receipt **`pf/atom` 2** with composition wiring, but longest wall clock among recorded **Grok 4.7** WF cells so far (**~30 min**).

---

## TIED version / dogfood

Session **4.2.2** on disposable client — facilitator replay only; not an effectiveness claim.

---

## Facilitator follow-ups

- Pair **grok47-high** on **PROMPT-WF-10** after compose catalog stabilizes.
- Track whether **WritableIterable** retries on early turns correlate with longer wall times across Grok 4.7 cohort.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794525072-wf-agentstream-wf-10-cursor-grok47med/evidence/build-plan-verification-evidence.md)
