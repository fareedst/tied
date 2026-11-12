# Trial readout: PROMPT-WF-10 → Cursor Grok 4.6 (`low`) → `1794517047-wf-agentstream-wf-10-cursor-grok46lowlow`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `grok46-low` |
| **Model slug** | `cursor-grok-4.6-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794517047-wf-agentstream-wf-10-cursor-grok46lowlow` |
| **Factory tag** | `1794517047-wf-agentstream-wf-10-cursor-grok46lowlow` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-10** **Cursor Grok 4.6** (`low`) cell with **workflow complete**, default-on proof manifest, and traceable close-out commit **`027809a`**. |

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
| 1 | `--file` xor `--stdin`; exit **2** on misuse |
| 2 | Lenient CSV parse with documented ragged-column rules |
| 3 | Text vs JSON output modes |
| 4 | ESM + `node:test`; colocated tests under `src/` |

---

## What was built

- **Product:** TypeScript CSV summary CLI (`src/csv-summary.ts`, `src/cli.ts`, `src/args.ts`, `src/input.ts`); facilitator **`npm test` 29/29** pass.
- **TIED:** `REQ-CSV_SUMMARY_CLI` + ARCH/IMPL; persisted `tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml`; wave commit **`027809a`**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~803s** (~13.4 min).
- **Project size layers:** unit **23**, comp **2**, e2e **4** (receipt counter); **applied_lines 180**; batch **`wall_clock` 13** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794517047-wf-agentstream-wf-10-cursor-grok46lowlow.json) · [summary row `wf-10-cursor-grok46lowlow`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).
- **Proof manifest:** six `files[]` rows + one `bindings[]` wiring row; fine subtypes on manifest paths.

---

## Outcome record

**Implementation outcome:** **Complete** — twenty-nine passing tests at facilitator replay; product commit on disk.

**Workflow outcome:** **Complete** — `close_out` **`allowed: true`**; interaction inventory lists four turns.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.86 · A/A/A−/A/B+/A/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-12T21-09-34-977Z.json` **`allowed: true`** |
| **Process contract** | **pass** | RED/GREEN archived; proof manifest populated |
| **Adherence ledger** | **partial** | Close-out hinge `adversarial_inquiry` waiver diagnostic only |
| **Orchestrator** | **pass** | **`exit_code: 0`**; default-on proof manifest |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794517047-wf-agentstream-wf-10-cursor-grok46lowlow/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.2** captured |
| 2 | `refine-plan` | xor input contract + stack lock; pre-implementation gate |
| 3 | `build-plan` | GREEN **29** tests; proof-facet manifest completed |
| 4 | `close-out` | CITDP persist; **`027809a`** commit; close_out gate **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **803s** (~13.4 min) |

**Friction excerpts (stderr):** default-on proof manifest + stack seed; four `--- turn N/4 ---` boundaries; `harness=cursor` `model=cursor-grok-4.6-low-fast` `model_effort=low`; phase-handoff gate default on; **no** `FACET_AS_SUBTYPE` ERROR lines.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs inventory | Product commit in turn-4 outputs; inventory matches four skills |
| Proof manifest | Six file rows + binding; matches build-plan handoff |
| Close-out | CITDP on disk under `tied-project/citdp/` |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **29** pass |

---

## Proof labels (manifest vs path)

Manifest declares binding **CLI→core** on `src/cli.binding.test.ts`; receipt **composition_tests: 2**, **e2e_tests: 4**, **unit_tests: 23** (path rollup; live runner reports **29** cases).

| label | cases (receipt) |
| --- | ---: |
| unit.default | 23 |
| composition.wiring | 2 |
| e2e.ui | 4 |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | File and stdin modes are mutually exclusive with tested error messages. |
| Traceability closure | **A** | Close-out commit **`027809a`** ships product code and persisted CITDP. |
| Test strategy | **A−** | Twenty-nine green tests with manifest wiring row; fewer cases than the Composer **36** peer on the same prompt. |
| Algorithm / implementation | **A** | CSV parse, ragged columns, and I/O modes match refine contract. |
| Process adherence | **B+** | Close-out allowed with adversarial-inquiry waiver diagnostic on minimal depth. |
| Workflow choreography | **A** | Orchestrator exit zero after four turns with matching inventory. |
| Methodology learning readout | **A−** | First **Grok 4.6 low** WF-10 complete cell; compose slug `grok46-low` validated in orchestrator manifest. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Contrasts with [Cursor Composer medium @ 1794514372](trial-readout-PROMPT-WF-10-composer25med-1794514372-wf-agentstream-wf-10-cursor-composer25medmedium.md) (**36** tests, **`wall_clock` 15** min) on the same paste. Higher **applied_lines** and pseudo-code mass on this cell; **no ranking**.

---

## Cohort comparisons vs peer WF readouts

First **Cursor Grok 4.6** **workflow complete** on **PROMPT-WF-10** under default-on proof manifest. Size receipt shows heavier operational-intent layer (**180** applied lines) than Composer medium peer (**63**).

---

## TIED version / dogfood

Session **4.2.2** on disposable client — facilitator replay only; not an effectiveness claim.

---

## Facilitator follow-ups

- Pair **grok46** **medium/high** on the same prompt for effort sensitivity.
- Reconcile receipt **23** vs runner **29** test counts in future size-validator notes if needed.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794517047-wf-agentstream-wf-10-cursor-grok46lowlow/evidence/build-plan-verification-evidence.md)
