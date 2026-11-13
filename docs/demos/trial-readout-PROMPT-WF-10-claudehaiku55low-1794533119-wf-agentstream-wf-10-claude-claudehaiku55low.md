# Trial readout: PROMPT-WF-10 → Claude Haiku 5.5 (`low`) → `1794533119-wf-agentstream-wf-10-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794533119-wf-agentstream-wf-10-claude-claudehaiku55low` |
| **Factory tag** | `1794533119-wf-agentstream-wf-10-claude-claudehaiku55low` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Third **4.2.2** Haiku **low** WF-10 cell; peer [1794408633](trial-readout-PROMPT-WF-10-claudehaiku55low-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low.md) had **23** tests — this run **16/16** with wiring manifest on disk, same CITDP adversarial close-out blocker. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste.

---

## RESOLVE (subject)

| Term | Resolution |
| --- | --- |
| Input | `--file` XOR `--stdin` (refine-plan) |
| Stack | `wf-trial-ts-node-test-v1` |
| Modules | `summarize.ts`, `cli.ts`, colocated tests |

---

## What was built

- **Product:** `src/summarize.ts`, `src/cli.ts`, `src/summarize.test.ts`, `src/cli.test.ts`; facilitator **`npm test` 16/16**.
- **TIED:** PLAN + phase handoffs 1–4; slim tracker; **no** persisted `tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml`.
- **Stack:** orchestrator **`exit_code: 0`**; wall **240s** (~4.0 min).
- **Git:** bootstrap pin **`84da1b8`** — product tree **untracked**.
- **Project size layers:** snapshot unit **16**; **`applied_lines` 0**; batch **`wall_clock` 4** min · [summary row `wf-10-claude-claudehaiku55low`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md).
- **Proof manifest:** **2** `files[]` rows + **1** `bindings[]` (`composition.wiring`).

---

## Outcome record

**Implementation outcome:** **Pass (local)** — CSV CLI + summarize core green at facilitator replay.

**Workflow outcome:** **Split signal** — orchestrator **`exit_code: 0`** but close-out **incomplete** (CITDP adversarial fields; verification **`allowed: false`**; no traceable commit).

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 2.90 · A−/C+/A−/B+/D+/B/B.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `close_out_gate_allowed: false` — missing persisted CITDP path |
| **Process contract** | **partial** | RED/GREEN archived; proof manifest populated; verification blocked on adversarial CITDP fields |
| **Adherence ledger** | **not_run** | No reconcile in close-out pass |
| **Orchestrator** | **pass shell** | **`exit_code: 0`**; four turns in inventory |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794533119-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | PLAN + slim tracker; session **4.2.2** |
| 2 | `refine-plan` | Locked CLI contract |
| 3 | `build-plan` | **16/16** GREEN; verification gate **`allowed: false`** (adversarial CITDP fields) |
| 4 | `close-out` | **Incomplete** — no commit; envelope ok but close_out blocked |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **240s** (~4.0 min) |

**Friction excerpts (stderr):** `HARNESS=claude` `model=claude-haiku-5-5` `model_effort=low`; four `--- turn N/4 ---` boundaries; four distinct `session_id=` lines; proof manifest scaffold seeded.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Commits | Bootstrap only — close-out skipped `traceable-commit` |
| Build vs close | Product tests green; CITDP persist rejected at minimal depth |
| vs 1794408633 | Peer low cell **23** tests with same adversarial CITDP blocker |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **16/16** |
| Product under `src/` | **Present (untracked)** |

---

## Proof labels (manifest vs path)

| label | cases (receipt) |
| --- | ---: |
| unit.default | 16 |

Manifest also declares **`composition.wiring`** on `src/cli.test.ts` + binding row **CLI→core**.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Mutex argv and CSV summarize scope locked before RED tests. |
| Traceability closure | **C+** | Handoffs and tests align to PLAN; no persisted CITDP and no feature commit. |
| Test strategy | **A−** | RED/GREEN archived; **16/16** green including CLI wiring test — leaner than peer **23** cases. |
| Algorithm / implementation | **B+** | Facilitator replay confirms summarize + CLI behavior on disk. |
| Process adherence | **D+** | Verification and close_out blocked on adversarial CITDP validation at minimal depth. |
| Workflow choreography | **B** | Four orchestrator turns complete; inventory marks close-out **incomplete** honestly. |
| Methodology learning readout | **B** | Fast (**4** min) Haiku low cell reproduces known adversarial CITDP gate friction on **4.2.2**. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; split-signal cells need explicit pairing before cohort claims.

---

## Cross-model notes (PROMPT-WF-10)

Contrast [Haiku low @ 1794371036](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md), [Haiku low @ 1794408633](trial-readout-PROMPT-WF-10-claudehaiku55low-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low.md), and [Sonnet 4.6 low @ 1794525155](trial-readout-PROMPT-WF-10-claudesonnet46low-1794525155-wf-agentstream-wf-10-claude-claudesonnet46low.md) — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Shortest wall time among published **Haiku low** WF-10 readouts so far (**240s**), with the same **missing adversarial CITDP** close-out pattern as **1794408633**.

---

## TIED version / dogfood

Session **4.2.2** on turn 1 — not an effectiveness claim for low effort or Haiku 5.5.

---

## Facilitator follow-ups

- Sponsor/store: resolve **minimal-depth adversarial CITDP** vs `citdp_record_write` validation before expecting workflow-complete Haiku low cells.
- Re-run `@record-wf-trial --force` after close-out repair if desired.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Batch size comparison (summary row)](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794533119-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md)
