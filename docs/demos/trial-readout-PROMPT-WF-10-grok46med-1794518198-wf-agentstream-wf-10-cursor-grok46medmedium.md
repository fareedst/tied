# Trial readout: PROMPT-WF-10 → Cursor Grok 4.6 (`medium`) → `1794518198-wf-agentstream-wf-10-cursor-grok46medmedium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `grok46-med` |
| **Model slug** | `cursor-grok-4.6-medium-fast` |
| **Model effort** | `medium` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794518198-wf-agentstream-wf-10-cursor-grok46medmedium` |
| **Factory tag** | `1794518198-wf-agentstream-wf-10-cursor-grok46medmedium` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-10** **Cursor Grok 4.6** (`medium`) cell with **workflow complete**, default-on proof manifest, and close-out commit **`2bd9ddb`**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

---

## RESOLVE (subject client)

| # | Decision |
| --- | --- |
| 1 | `--file` xor `--stdin`; exit **2** on misuse |
| 2 | Module split: parse-args, read-source, parse-csv, summarize, format-output |
| 3 | Colocated `node:test` under `src/` |
| 4 | ESM + stack id `wf-trial-ts-node-test-v1` |

---

## What was built

- **Product:** TypeScript CSV summary CLI; facilitator **`npm test` 49/49** pass (6 suites).
- **TIED:** `REQ-CSV_SUMMARY_CLI` + ARCH/IMPL; persisted CITDP; close-out commit **`2bd9ddb`**.
- **Stack:** orchestrator **`exit_code: 0`**; wall **~1052s** (~17.5 min).
- **Project size layers:** unit **44**, comp **5**, e2e **0**; **applied_lines 261**; **`wall_clock` 18** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794518198-wf-agentstream-wf-10-cursor-grok46medmedium.json) · [row `wf-10-cursor-grok46medmedium`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).
- **Proof manifest:** six file rows + **CLI→core** binding; no separate e2e manifest rows.

---

## Outcome record

**Implementation outcome:** **Complete** — forty-nine passing tests at facilitator replay.

**Workflow outcome:** **Complete** — `close_out` **`allowed: true`**; four-turn inventory.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.93 · A/A/A/A/B+/A/A.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-12T21-31-49-700Z.json` **`allowed: true`** |
| **Process contract** | **pass** | verification gate + proof manifest |
| **Adherence ledger** | **partial** | adversarial-inquiry waiver diagnostic (minimal depth) |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794518198-wf-agentstream-wf-10-cursor-grok46medmedium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; semver **4.2.2** |
| 2 | `refine-plan` | locked stack + argv contract |
| 3 | `build-plan` | **49** green tests; verification receipt |
| 4 | `close-out` | CITDP persist; **`2bd9ddb`**; close_out **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **1052s** (~17.5 min) |

**Friction (stderr):** proof manifest default on; `model=cursor-grok-4.6-medium-fast` `model_effort=medium`; four turn boundaries; no `FACET_AS_SUBTYPE` ERROR.

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **49** pass |

---

## Proof labels (receipt)

| label | cases |
| --- | ---: |
| unit.default | 44 |
| composition.wiring | 5 |

Live runner **49** cases vs receipt unit rollup **44** — five composition-classified cases in receipt.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Exclusive file vs stdin modes with tested misuse errors. |
| Traceability closure | **A** | Close-out **`2bd9ddb`** with persisted CITDP. |
| Test strategy | **A** | Forty-nine tests across six suites with binding manifest row. |
| Algorithm / implementation | **A** | Modular parse pipeline matches refined PLAN contract. |
| Process adherence | **B+** | Close-out allowed with minimal-depth adversarial waiver diagnostic. |
| Workflow choreography | **A** | Orchestrator exit zero; inventory matches four skills. |
| Methodology learning readout | **A** | **`grok46-med`** compose slug in orchestrator manifest; effort tier matches slug. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-10)

Versus [Grok 4.6 low @ 1794517047](trial-readout-PROMPT-WF-10-grok46low-1794517047-wf-agentstream-wf-10-cursor-grok46lowlow.md): **49** vs **29** tests, **18** vs **13** min wall, higher **applied_lines** (**261** vs **180**). Versus [Composer medium @ 1794514372](trial-readout-PROMPT-WF-10-composer25med-1794514372-wf-agentstream-wf-10-cursor-composer25medmedium.md): more tests (**49** vs **36**) but longer wall clock. **No ranking.**

---

## Cohort comparisons

Heavier operational-intent and proof-facet counts than the Grok 4.6 **low** cell on the same prompt; first **medium** Grok 4.6 WF-10 **workflow complete** row in the size comparison table.

---

## TIED version / dogfood

Session **4.2.2** — facilitator replay only; not an effectiveness claim.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Comparison table](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)
