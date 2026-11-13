# Trial readout: PROMPT-WF-10 → Cursor Grok 4.7 (`high`) → `1794528922-wf-agentstream-wf-10-cursor-grok47high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `grok47-high` |
| **Model slug** | `grok-4.7-high-fast` |
| **Model effort** | `high` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794528922-wf-agentstream-wf-10-cursor-grok47high` |
| **Factory tag** | `1794528922-wf-agentstream-wf-10-cursor-grok47high` (`disposable_tag` — canonical bucket **`grok47high`**) |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-10** **Cursor Grok 4.7 (`high`)** **workflow complete** cell with disposable bucket **`grok47high`**. |

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
| 1 | `--file` xor `--stdin`; documented usage and read errors |
| 2 | `csv-parse` / `summary` / `cli` modules |
| 3 | `cli.binding.test.ts` wires CLI to `parseCsv` |
| 4 | ESM + `node:test`; stack **`wf-trial-ts-node-test-v1`** |

---

## What was built

- **Product:** TypeScript CSV summary CLI under `src/`; facilitator **`npm test` 17/17** pass.
- **TIED:** `REQ-CSV_SUMMARY_CLI` + ARCH/IMPL; **`applied_lines 104`**; CITDP on disposable client; close-out commit **`65d6543`**.
- **Stack:** orchestrator **`exit_code: 0`**; wall **2169s** (~36 min).
- **Project size layers:** unit **15**, comp **2** (receipt); batch **`wall_clock` 36** min · [summary row `wf-10-cursor-grok47high`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md).
- **Proof manifest:** four `files[]` rows + one `bindings[]` wiring row.

---

## Outcome record

**Implementation outcome:** **Complete** — seventeen passing tests at facilitator replay with R+A+I indexes.

**Workflow outcome:** **Complete** — `close_out` **`allowed: true`**; inventory lists four canonical skills.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.71 · A/A/B+/A−/B+/A−/A.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-13T00-47-53-637Z.json` **`allowed: true`** |
| **Process contract** | **pass** | Phase handoff files present; proof manifest populated |
| **Adversarial ledger** | **partial** | Minimal depth; standard waiver posture |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794528922-wf-agentstream-wf-10-cursor-grok47high/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** captured |
| 2 | `refine-plan` | PLAN + test strategy |
| 3 | `build-plan` | GREEN **17** tests |
| 4 | `close-out` | CITDP persist; **`65d6543`**; close_out **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **2169s** (~36 min) |

**Friction excerpts (stderr):** `harness=cursor` `model=grok-4.7-high-fast` `model_effort=high`; **`RetriableError: WritableIterable is closed`** on turn **2**; four `--- turn N/4 ---` boundaries; phase handoff gate default on.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs inventory | Product commit **`65d6543`** in close-out turn |
| Proof manifest | Wiring binding + unit/composition rows |
| Close-out | CITDP on disposable client |
| Disposable tag | **`grok47high`** single-tier bucket |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` (inventory) |
| Facilitator `npm test` | **17** pass |
| `package.json` `bin` | **Absent** — CLI exercised in tests |

---

## Proof labels (manifest vs path)

| label | cases (receipt) |
| --- | ---: |
| unit.default | 15 |
| composition.wiring | 2 |

Live runner **17** cases matches receipt unit + comp rollup.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | File vs stdin exclusivity and count-line rules covered by green tests. |
| Traceability closure | **A** | Close-out **`65d6543`** with persisted CITDP and ARCH/IMPL indexes. |
| Test strategy | **B+** | **17** facilitator cases vs **34** on [Grok 4.7 medium @ 1794525072](trial-readout-PROMPT-WF-10-grok47med-1794525072-wf-agentstream-wf-10-cursor-grok47med.md) for the same paste. |
| Algorithm / implementation | **A−** | Modular `src/` split with **104** applied pseudo-code lines and proof manifest wiring. |
| Process adherence | **B+** | Close-out allowed at minimal depth with standard adversarial waiver posture. |
| Workflow choreography | **A−** | Orchestrator exit zero after four turns despite **WritableIterable** on turn 2. |
| Methodology learning readout | **A** | First **Grok 4.7 high** WF-10 **complete** row; confirms **`grok-4.7-high-fast`** + **`grok47high`** bucket. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Versus [Grok 4.7 medium @ 1794525072](trial-readout-PROMPT-WF-10-grok47med-1794525072-wf-agentstream-wf-10-cursor-grok47med.md): **17** vs **34** tests, **36** vs **30** min wall, similar R+A+I depth — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Strong **goal-first-soc** delivery on **Grok 4.7 high**: receipt **`pf/atom` 1** with composition wiring; wall clock slightly above **medium** peer (~36 min).

---

## TIED version / dogfood

Session **4.2.2** on disposable client — facilitator replay only; not an effectiveness claim.

---

## Facilitator follow-ups

- Compare **high** vs **medium** test breadth on a future paired replay (same paste, fixed test budget note).
- Track **WritableIterable** on turn 2 across Grok 4.7 cohort.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794528922-wf-agentstream-wf-10-cursor-grok47high/evidence/build-plan-verification-evidence.md)
