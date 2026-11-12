# Trial readout: PROMPT-WF-10 → Cursor Composer 2.5 (`medium`) → `1794514372-wf-agentstream-wf-10-cursor-composer25medmedium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `composer-2.5-med` |
| **Model slug** | `composer-2.5-fast` |
| **Model effort** | `medium` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794514372-wf-agentstream-wf-10-cursor-composer25medmedium` |
| **Factory tag** | `1794514372-wf-agentstream-wf-10-cursor-composer25medmedium` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-10** **Cursor Composer** **`medium`** cell with **workflow complete**, **default-on proof manifest**, and **fine `proof_subtype` labels** on six manifest rows. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste. **Proof boundary:** executable behavior + orchestrator log + facilitator replay.

---

## RESOLVE (subject client)

| # | Decision |
| --- | --- |
| 1 | `--file` xor `--stdin`; exit **2** on misuse |
| 2 | RFC 4180 CSV with documented lenient quote rules |
| 3 | Text vs JSON output; header row optional |
| 4 | ESM + `node --import tsx`; colocated `node:test` |

---

## What was built

- **Product:** TypeScript CSV summary CLI (`src/csv-summary.ts`, `src/cli.ts`, `src/args.ts`, `src/input.ts`); facilitator **`npm test` 36/36** pass.
- **TIED:** `REQ-CSV_SUMMARY_CLI` + ARCH/IMPL + persisted `tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml`; wave commit **`6e56f8e`** (+ post-close-out docs touch **`2b256fb`**).
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~908s** (~15.1 min).
- **Project size layers:** unit **27**, comp **3**, e2e **6**; batch **`wall_clock` 15** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794514372-wf-agentstream-wf-10-cursor-composer25medmedium.json) · [summary row `wf-10-cursor-composer25medmedium`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md) · fine labels **lbl:wiring 3**).
- **Proof manifest:** six `files[]` rows + one `bindings[]`; fine subtypes (`unit.default`, `composition.wiring`, `e2e.ui`); build-plan reports `tied_wf_proof_manifest_validate` ok.

---

## Outcome record

**Implementation outcome:** **Complete** — thirty-six passing tests at facilitator replay; traceable product commit on disk.

**Workflow outcome:** **Complete** — `close_out` **`allowed: true`**; envelope **0** blocking gaps; interaction inventory lists four turns.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.86 · A/A/A/A/B+/A/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-12T20-26-07-3NZ.json` **`allowed: true`** |
| **Process contract** | **pass** | RED/GREEN archived; proof manifest complete; tracker slug migration at close-out |
| **Adherence ledger** | **partial** | `process_grade` **B (88)**; hydration mismatch notes in close-out handoff |
| **Orchestrator** | **pass** | **`exit_code: 0`**; default-on manifest gate; no L3 subtype failure |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794514372-wf-agentstream-wf-10-cursor-composer25medmedium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.2** captured |
| 2 | `refine-plan` | xor input contract + RFC 4180 scope; pre-implementation gate receipt |
| 3 | `build-plan` | **36** green tests; six-row proof manifest; RED/GREEN stdout archived |
| 4 | `close-out` | CITDP persist; **`6e56f8e`** commit; close_out gate **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **908s** (~15.1 min) |

**Friction excerpts (stderr):** default-on proof manifest + scaffold seed; four `--- turn N/4 ---` boundaries; `harness=cursor` `model_effort=medium`; `MODEL_EFFORT=medium` diagnostic on Composer slug; phase-handoff gate default on; **no** `FACET_AS_SUBTYPE` ERROR lines.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs inventory | Product commit appears in turn-4 outputs; build-plan precedes `src/` in inventory ordering |
| Proof manifest | Six rows with **fine** `proof_subtype` values — passes default-on L3 gate |
| Tracker hygiene | Turn-3 `execution_evidence` used disposable slugs; close-out migrated to `unit-test-*` |
| Post-close-out | Docs commit **`2b256fb`** adjusts handoff SHA prose; minor unstaged handoff drift |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **36** pass |
| Typecheck | Declared in PLAN (`npm run typecheck`); not re-run at facilitator replay |

---

## Proof labels (manifest vs path)

`composition_evidence_subcheck`: **pass** · `binding_test_present`: **true** · `manifest_reconcile_ok`: **true**

| label | cases |
| --- | ---: |
| composition.wiring | 3 |
| e2e.ui | 6 |
| unit.default | 27 |

Manifest declares `src/cli.binding.test.ts` as **composition.wiring** with binding row **CLI→core**; receipt **composition_tests: 3** aligns with path rollup.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | File and stdin modes are mutually exclusive with tested error messages. |
| Traceability closure | **A** | Wave commit **`6e56f8e`** ships code, TIED indexes, and persisted CITDP. |
| Test strategy | **A** | Thirty-six tests with archived RED/GREEN and binding plus e2e coverage. |
| Algorithm / implementation | **A** | RFC 4180 parse, ragged columns, and I/O modes match refine contract. |
| Process adherence | **B+** | Close-out gate allowed with envelope zero gaps despite turn-3 slug drift. |
| Workflow choreography | **A** | Orchestrator exit zero after four turns with honest completion signals table. |
| Methodology learning readout | **A−** | First Composer WF-10 complete cell under default-on proof manifest on **4.2.2**. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Contrasts with [Claude Sonnet medium @ 1794360125](trial-readout-PROMPT-WF-10-claudesonnet55medium-1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium.md) (**28** tests, **composition_tests: 0** on receipt) and [Claude Haiku low @ 1794371036](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md) (close-out **incomplete** despite orchestrator pass). **No ranking.**

---

## Cohort comparisons vs peer WF readouts

First **Cursor** harness **workflow complete** on **PROMPT-WF-10** with **manifest_reconcile_ok** and **composition_evidence_subcheck: pass**. Wall time longer than several Claude **medium** cells but within the same argv-stress family.

---

## TIED version / dogfood

Session **4.2.2** on disposable client — facilitator replay only; not an effectiveness claim.

---

## Facilitator follow-ups

- Pair with additional Composer **low/high** cells for effort sensitivity on the same paste.
- Monitor whether post-close-out doc-only commits should stay out of product wave SHA citations.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794514372-wf-agentstream-wf-10-cursor-composer25medmedium/PLAN.md)
