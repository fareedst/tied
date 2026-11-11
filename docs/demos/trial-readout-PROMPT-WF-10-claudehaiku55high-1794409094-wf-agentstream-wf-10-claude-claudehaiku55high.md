# Trial readout: PROMPT-WF-10 → Claude Haiku 5.5 (high effort) → `1794409094-wf-agentstream-wf-10-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-haiku-5-5` (`high` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794409094-wf-agentstream-wf-10-claude-claudehaiku55high` |
| **Factory tag** | `1794409094-wf-agentstream-wf-10-claude-claudehaiku55high` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-10** Haiku **`high`** on **4.2.2** post phase-handoff resolver; peers [medium @ 1794407806](trial-readout-PROMPT-WF-10-claudehaiku55medium-1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium.md) / [low @ 1794408633](trial-readout-PROMPT-WF-10-claudehaiku55low-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low.md) stopped at incomplete close-out. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste.

---

## What was built

- **Product:** CSV summary CLI + tests (`src/cli.ts`, `src/csv-summary.ts`); facilitator **`npm test` 50/50**.
- **TIED:** REQ/ARCH/IMPL records; persisted **`tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml`**; registry slugs in tracker `completed`.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~812s** (13.5 min).
- **Git:** product commit **`705835c`** (`feat(csv-summary): add CSV summary CLI`).
- **Project size layers:** unit **50**; applied_lines **176**; atoms REQ/ARCH/IMPL indexed; batch **`wall_clock` 14** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794409094-wf-agentstream-wf-10-claude-claudehaiku55high.json) · [summary row `wf-10-claude-claudehaiku55high`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).
- **Proof manifest:** **2** `files[]` + binding; `cli.test.ts` labeled composition.wiring.

---

## Outcome record

**Implementation outcome:** **Pass** — sponsor contract implemented with broad automated coverage.

**Workflow outcome:** **Complete with waivers** — `tied_gate_check` close_out **`allowed: true`**; partial process/adherence signals documented in close-out handoff.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** ~3.7 · strongest WF-10 Haiku cohort cell in the 1794408* batch.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Close-out handoff claims gate `allowed: true`, envelope zero blocking gaps |
| **Process contract** | **partial** | No `verification-evidence-manifest.v1.json`; `traceable-commit` still **pending** in committed tracker |
| **Adherence ledger** | **partial** | Reconcile band **B (88)**; `evidence_stale` on receipt hashes |
| **Orchestrator** | **pass** | **`exit_code: 0`**; phase handoff gate default-on without resolve ERROR |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **CITDP** | `tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml` |
| **Verification receipt** | `tied-project/working/REQ-CSV_SUMMARY_CLI/gates/verification-2026-11-11T15-06-49-420Z.json` (`allowed: true`) |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794409094-wf-agentstream-wf-10-claude-claudehaiku55high/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold + table handoff |
| 2 | `refine-plan` | Locked argv + CSV semantics |
| 3 | `build-plan` | RED/GREEN archived; **50** tests; verification **allowed** |
| 4 | `close-out` | **Completed with waivers** — commit **`705835c`**; envelope valid |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **812s** (~13.5 min) |

**Friction excerpts (stderr):** default-on proof + phase handoff gates; slim tracker seeded; **MODEL_EFFORT=high**; four turn boundaries.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Commits | **`705835c`** product after bootstrap **`1ccde63`** — build-plan before close-out commit |
| Tracker slugs | Registry-shaped (`unit-test-red`, `unit-test-green`, `verification-gate`) — contrast [low @ 1794408633](trial-readout-PROMPT-WF-10-claudehaiku55low-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low.md) template slugs |
| `tied_verify` | **Not run** — REQ status promotion not claimed |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **50/50** |
| Product under `src/` | **Present** + **committed** |

---

## Proof labels (manifest vs path)

| Path | On disk | Manifest |
| --- | --- | --- |
| `src/csv-summary.test.ts` | yes | unit |
| `src/cli.test.ts` | yes | composition.wiring (`subprocess` tag) |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Mutex input contract and header/blank-line semantics exercised in tests. |
| Traceability closure | **A−** | ARCH/IMPL + CITDP on disk and commit **`705835c`**; `tied_verify` not run. |
| Test strategy | **A** | RED/GREEN archived; **50** cases; verification gate **`allowed: true`**. |
| Algorithm / implementation | **A** | Facilitator **`npm test` 50/50** on CSV edge cases. |
| Process adherence | **B+** | Registry slugs in `completed`; **`traceable-commit` pending** despite product commit. |
| Workflow choreography | **A−** | Four turns through honest close-out with documented runner waivers. |
| Methodology learning readout | **B+** | Longest WF-10 Haiku cell; shows adversarial CITDP fields can be satisfied when agent invests. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; high effort here is evidence for depth of testing, not a universal ranking over medium/low cells.

---

## Cross-model notes (PROMPT-WF-10)

Contrast incomplete peers [medium @ 1794407806](trial-readout-PROMPT-WF-10-claudehaiku55medium-1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium.md) and [low @ 1794408633](trial-readout-PROMPT-WF-10-claudehaiku55low-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low.md). **No ranking** — effort and session variance.

---

## Cohort comparisons vs peer WF readouts

Same post-resolver orchestrator defaults; **high** is the only cell in the **1794408*** trio with **machine close-out pass**, **persisted CITDP**, and a **product SHA**.

---

## TIED version / dogfood

Session **4.2.2** — not an effectiveness claim for `high` effort alone.

---

## Facilitator follow-ups

- Optional: regenerate verification/close-out receipts against committed tree to clear `evidence_stale`.
- Mark `traceable-commit` completed in tracker or accept waiver as documented.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Batch size comparison (summary row)](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md) — **WF-10** Haiku effort trio (`1794407806` / `1794408633` / `1794409094`)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794409094-wf-agentstream-wf-10-claude-claudehaiku55high/evidence/build-plan-verification-evidence.md)
