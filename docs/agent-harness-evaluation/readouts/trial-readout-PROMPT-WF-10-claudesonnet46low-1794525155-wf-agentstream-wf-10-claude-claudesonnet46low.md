# Trial readout: PROMPT-WF-10 → Claude Sonnet 4.6 (`low`) → `1794525155-wf-agentstream-wf-10-claude-claudesonnet46low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-sonnet-4-6` |
| **Model slug** | `claude-sonnet-4-6` |
| **Model effort** | `low` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794525155-wf-agentstream-wf-10-claude-claudesonnet46low` |
| **Factory tag** | `1794525155-wf-agentstream-wf-10-claude-claudesonnet46low` |
| **Product REQ** | `REQ-CSV_SUMMARIZER` |
| **TIED methodology version (session)** | **4.2.2** — **bootstrap-inferred only** (commit `4088e6d`; orchestrator resolver in stderr; no `tied-methodology-version.session.v1.json` on client) |
| **Cohort comparison** | First **workflow complete** **PROMPT-WF-10** cell on **Claude Sonnet 4.6** (`low`); batch label **`wf-10-claude-claudesonnet46low`** supersedes zero-test pilot **`1794509066-wf-agentstream-wf-10-claude-claudesonnet46low`**. |

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
| 1 | `--file` xor `--stdin`; documented error on misuse |
| 2 | Parser + file reader modules; `runPipeline` core |
| 3 | `cli.binding.test.ts` composition wiring to `runPipeline` |
| 4 | ESM + `node:test`; colocated tests under `src/` |

---

## What was built

- **Product:** `src/cli.ts`, `src/pipeline.ts`, `src/csv-parser.ts`, `src/input-reader.ts` + three test files; facilitator **`npm test` 10/10** pass.
- **TIED:** `REQ-CSV_SUMMARIZER` index only (**ARCH/IMPL indexes empty**); persisted `tied-project/citdp/CITDP-REQ-CSV_SUMMARIZER.yaml`; product commit **`745e41d`**; post-close handoff **`b545a5d`**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **777s** (~13 min).
- **Project size layers:** unit **6**, comp **4** (receipt); **applied_lines 0** (no IMPL pseudo-code sidecars); batch **`wall_clock` 13** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794525155-wf-agentstream-wf-10-claude-claudesonnet46low.json) · [summary row `wf-10-claude-claudesonnet46low`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).
- **Proof manifest:** three `files[]` rows + one `bindings[]` wiring row (`composition.wiring`).

---

## Outcome record

**Implementation outcome:** **Partial vs full TIED stack** — ten passing tests and shipped CLI modules; **no** ARCH/IMPL index rows or IMPL pseudo-code mass.

**Workflow outcome:** **Complete** — `close_out` **`allowed: true`**; interaction inventory lists four sponsor turns.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.24 · A−/C+/B/B+/B−/A/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-12T23-23-46-074Z.json` **`allowed: true`** |
| **Process contract** | **partial** | Proof manifest populated; orchestrator **ERROR** missing `phase-handoff-add-feature.md` |
| **Adherence ledger** | **partial** | Minimal depth; typical waiver posture |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARIZER/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARIZER/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794525155-wf-agentstream-wf-10-claude-claudesonnet46low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `refine-plan` (inventory) | PLAN + tracker seeded |
| 2 | `refine-plan` advisory | Pre-implementation handoff only |
| 3 | `build-plan` | GREEN **10** tests; verification gate advisory |
| 4 | `close-out` | CITDP persist; **`745e41d`**; close_out gate **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **777s** (~13 min) |

**Friction excerpts (stderr):** `harness=claude` `model=claude-sonnet-4-6` `model_effort=low`; four `--- turn N/4 ---` boundaries; **`ERROR: WF trial phase handoff gate: missing …/phase-handoff-add-feature.md`** after turn 4.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs inventory | Product commit **`745e41d`** in turn-4 window |
| Proof manifest | Wiring binding + unit/composition file rows |
| Close-out | CITDP under `tied-project/citdp/` |
| TIED indexes | **REQ only** — ARCH/IMPL YAML indexes empty at facilitator replay |

---

## Stack compliance

| Check | Result |
| --- | --- |
| Harness notes | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **10** pass |
| `package.json` `bin` | **Absent** — CLI exercised via tests / direct `cli.ts` import |

---

## Proof labels (manifest vs path)

| label | cases (receipt) |
| --- | ---: |
| unit.default | 6 |
| composition.wiring | 4 |

**Composition evidence subcheck:** MCP tool unavailable this pass; receipt `comp` **4** aligns with manifest `composition.wiring`.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | File/stdin exclusivity and row/column counts covered by **10** green cases at facilitator replay. |
| Traceability closure | **C+** | Close-out commit ships product + CITDP but **empty** ARCH/IMPL indexes and **zero** applied pseudo-code lines. |
| Test strategy | **B** | Ten cases with **four** composition wiring tests — lighter than [Grok 4.6 low @ 1794517047](trial-readout-PROMPT-WF-10-grok46low-1794517047-wf-agentstream-wf-10-cursor-grok46lowlow.md) (**29** cases). |
| Algorithm / implementation | **B+** | Modular `src/` split and binding test without full packaged `bin` wiring. |
| Process adherence | **B−** | Machine close-out **allowed** despite missing **`phase-handoff-add-feature.md`** orchestrator error. |
| Workflow choreography | **A** | Orchestrator **`exit_code: 0`** after four agentstream turns with inventory alignment. |
| Methodology learning readout | **A−** | First **Sonnet 4.6 low** WF-10 **complete** cell; supersedes zero-test pilot epoch on batch label **`wf-10-claude-claudesonnet46low`**. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Contrasts with [Claude Sonnet 5.5 low @ 1794366012](trial-readout-PROMPT-WF-10-claudesonnet55low-1794366012-wf-agentstream-wf-10-claude-claudesonnet55low.md) (**split signal**, **8** tests uncommitted) and [Cursor Grok 4.6 low @ 1794517047](trial-readout-PROMPT-WF-10-grok46low-1794517047-wf-agentstream-wf-10-cursor-grok46lowlow.md) on the same paste — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Mid-weight proof footprint for **goal-first-soc** WF-10: **6** unit + **4** composition receipt cases vs **50** Haiku high or **57** Grok 4.6 high cells, but **workflow machinery** still reached **`close_out` allowed** with default-on proof manifest.

---

## TIED version / dogfood

Session **4.2.2** on disposable client (bootstrap + orchestrator resolver) — facilitator replay only; not an effectiveness claim.

---

## Facilitator follow-ups

- Pair **Sonnet 4.6** **medium/high** on **PROMPT-WF-10** when Claude agentstream catalog stabilizes.
- Revisit whether **close_out allowed** with empty ARCH/IMPL indexes should down-rank **Process adherence** in the grading contract.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794525155-wf-agentstream-wf-10-claude-claudesonnet46low/evidence/build-plan-verification-evidence.md)
