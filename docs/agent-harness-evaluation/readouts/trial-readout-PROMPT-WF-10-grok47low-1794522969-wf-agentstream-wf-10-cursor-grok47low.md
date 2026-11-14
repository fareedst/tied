# Trial readout: PROMPT-WF-10 → Cursor Grok 4.7 (`low`) → `1794522969-wf-agentstream-wf-10-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794522969-wf-agentstream-wf-10-cursor-grok47low` |
| **Factory tag** | `1794522969-wf-agentstream-wf-10-cursor-grok47low` (`disposable_tag` — canonical bucket **`grok47low`**, not `grok47lowlow`) |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — evidence under client `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/` |
| **Cohort comparison** | First **PROMPT-WF-10** **Cursor Grok 4.7** (`low`) cell with **workflow complete**, **`grok-4.7`** compose ref, and single-tier disposable tag per [REQ-WF_TRIAL_RANGE_CANONICAL_INPUT](../../tied-project/requirements/REQ-WF_TRIAL_RANGE_CANONICAL_INPUT.yaml). |

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
| 1 | `--file` xor `--stdin`; documented usage string on misuse |
| 2 | Lenient CSV field split in-library |
| 3 | Two-line count output contract via library entrypoints |
| 4 | ESM + `node:test`; colocated tests under `src/` |

---

## What was built

- **Product:** Monolithic `src/csv-summary.ts` + `src/csv-summary.test.ts` (no separate `cli.ts` / `package.json` `bin`); facilitator **`npm test` 8/8** pass.
- **TIED:** `REQ-CSV_SUMMARY_CLI` + ARCH/IMPL; persisted `tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml`; wave commit **`c326354`**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **868s** (~14.5 min).
- **Project size layers:** unit **8** only (receipt); **applied_lines 41**; batch **`wall_clock` 14** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794522969-wf-agentstream-wf-10-cursor-grok47low.json) · [summary row `wf-10-cursor-grok47low`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).
- **Proof manifest:** one `files[]` row (`unit.default` on `src/csv-summary.test.ts`); empty `bindings[]`.

---

## Outcome record

**Implementation outcome:** **Partial vs paste contract** — eight passing unit tests; library-style delivery without shipped CLI entry wiring.

**Workflow outcome:** **Complete** — `close_out` **`allowed: true`**; interaction inventory lists four turns.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.61 · A−/A/C+/B+/B+/A/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-12T22-49-25-874Z.json` **`allowed: true`** |
| **Process contract** | **pass** | Four-turn inventory; slim proof manifest |
| **Adherence ledger** | **partial** | Minimal depth; typical waiver posture for adversarial inquiry |
| **Orchestrator** | **pass** | **`exit_code: 0`**; `disposable_tag` matches bucket rule |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794522969-wf-agentstream-wf-10-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | xor input contract + stack lock |
| 3 | `build-plan` | GREEN **8** tests; single-file proof manifest |
| 4 | `close-out` | CITDP persist; **`c326354`**; close_out gate **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **868s** (~14.5 min) |

**Friction excerpts (stderr):** `harness=cursor` `model=grok-4.7-low-fast` `model_effort=low`; `model_config=grok47-low`; `disposable_tag=wf-agentstream-wf-10-cursor-grok47low`; four `--- turn N/4 ---` boundaries.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs inventory | Product commit in turn-4 window; four skills in inventory |
| Proof manifest | One unit row; no binding row |
| Close-out | CITDP on disk under `tied-project/citdp/` |
| Disposable tag | **`grok47low`** bucket (validates canonical compose wave) |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **8** pass |

---

## Proof labels (manifest vs path)

| label | cases (receipt) |
| --- | ---: |
| unit.default | 8 |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Exclusive `--file` / `--stdin` logic and counts exist in-library; no `bin` or standalone CLI script in `package.json`. |
| Traceability closure | **A** | Close-out commit **`c326354`** ships product code and persisted CITDP. |
| Test strategy | **C+** | Eight green unit cases only — no composition wiring or e2e vs the Grok 4.6 low peer’s **29** cases on the same prompt. |
| Algorithm / implementation | **B+** | Single-module delivery; argv parsing and CSV split are present but not decomposed into CLI/core modules. |
| Process adherence | **B+** | Close-out allowed at minimal depth with standard waiver posture. |
| Workflow choreography | **A** | Orchestrator exit zero after four turns with matching inventory. |
| Methodology learning readout | **A−** | First **Grok 4.7 low** WF-10 complete cell; confirms **`grok-4.7`** slug + **`grok47low`** disposable bucket after range-canonical-input wave. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Contrasts with [Cursor Grok 4.6 low @ 1794517047](trial-readout-PROMPT-WF-10-grok46low-1794517047-wf-agentstream-wf-10-cursor-grok46lowlow.md) (**29** tests, **`applied_lines` 180**, full CLI stack) and [Cursor Grok 4.6 high @ 1794519432](trial-readout-PROMPT-WF-10-grok46high-1794519432-wf-agentstream-wf-10-cursor-grok46highhigh.md) on the same paste — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Lightest recorded **workflow complete** CSV-summary cell on **PROMPT-WF-10** so far by test count and applied pseudo-code mass (**41** lines vs **180** on Grok 4.6 low). Workflow machinery still reached **`close_out` allowed**.

---

## TIED version / dogfood

Session **4.2.2** on disposable client — facilitator replay only; not an effectiveness claim.

---

## Facilitator follow-ups

- Pair **grok47** **medium/high** on **PROMPT-WF-10** after compose catalog stabilizes.
- Decide whether library-only delivery should grade as **split signal** in future rubric revisions.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794522969-wf-agentstream-wf-10-cursor-grok47low/evidence/build-plan-verification-evidence.md)
