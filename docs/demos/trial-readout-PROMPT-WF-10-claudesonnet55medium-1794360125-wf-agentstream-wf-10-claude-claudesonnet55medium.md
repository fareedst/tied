# Trial readout: PROMPT-WF-10 → Claude Sonnet 5.5 (medium effort) → `1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `sonnet-5-5` (`medium` effort) |
| **Model slug** | `claude-sonnet-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium` |
| **Factory tag** | `1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** (inventory + session evidence) |
| **Cohort comparison** | First **PROMPT-WF-10** Claude Sonnet **`medium`** cell on **4.2.1**; **`composition_tests: 0`** on size receipt. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste. **Proof boundary:** executable behavior + orchestrator log + facilitator replay.

---

## What was built

- **Product:** TypeScript CSV summary CLI — `csv-parse`, `csv-summary`, `cli-args`, `cli`, `main`; optional `--json`; facilitator **`npm test` 28/28** pass.
- **TIED:** `REQ-CSV_SUMMARY_CLI` with committed indexes; ARCH **1** / IMPL **4**; **27** applied pseudo-code lines.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~5 min** (307s).
- **Git:** traceable product pin **`8cf1dde`** (`feat(csv-summary): add CSV summary CLI`).
- **Project size layers:** unit tests **28**; composition **0**; `operational_intent_hash` `0a529053…` ([MCP snapshot](../../tied-project/working/FACILITATOR-WF-10-1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium/evidence/project-size-snapshot.v1.json)).

---

## Outcome record

**Implementation outcome:** **Complete** — 28 passing tests at facilitator replay.

**Workflow outcome:** **Complete** — machine close-out **`allowed: true`**; traceable commit on disk.

**Grading outcome:** Session bands describe this cell only — not methodology effectiveness or a model leaderboard. **Grade mean (registry):** 3.47 · A/B+/B/A−/B+/A−/B+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-11T01-26-38-855Z.json` **`allowed: true`** |
| **Process contract** | **pass** | Four turn skills recorded in inventory |
| **Orchestrator** | **pass** | **`exit_code: 0`**; **307s** wall |
| **Composition stress** | **gap** | **`composition_tests: 0`** despite multi-module CLI |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold |
| 2 | `refine-plan` | Module boundaries + optional `--json` |
| 3 | `build-plan` | **28** green tests; typecheck clean at close-out |
| 4 | `close-out` | Gate pass; **`8cf1dde`** commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **307s** (~5 min) |

**Friction excerpts:** `model_effort=medium`; four turn boundaries; no ERROR lines in stderr tail.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | Product commit **`8cf1dde`** includes implementation and tests |
| Module split | Five source modules as planned in refine |
| Composition | Facet counter **0** — facilitator notes rubric gap vs TIED-DEMO-13 binding taxonomy |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **28** pass |
| Facilitator typecheck | `npm run typecheck` reported clean at agent close-out |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Both/neither stdin and file modes documented and tested. |
| Traceability closure | **B+** | Committed SHA with four IMPL sidecars on size receipt. |
| Test strategy | **B** | Twenty-eight tests green; composition facet count remains zero. |
| Algorithm / implementation | **A−** | RFC 4180 coverage and ragged-row reporting match refine contract. |
| Process adherence | **B+** | Close-out gate and envelope with zero blocking gaps. |
| Workflow choreography | **A−** | Medium effort completes four turns with exit 0 and traceable commit. |
| Methodology learning readout | **B+** | Contrasts with low-effort split signal on the same PROMPT-WF-10 paste. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Pairs with [Sonnet low @ 1794359532](trial-readout-PROMPT-WF-10-claudesonnet55low-1794359532-wf-agentstream-wf-10-claude-claudesonnet55low.md) — medium completes close-out where low stops on CITDP. No ranking.

---

## Cohort comparisons vs peer WF readouts

First **workflow complete** **PROMPT-WF-10** readout in the store cohort. Aligns with **PROMPT-WF-09** Sonnet medium disposition pattern (`fbfaeda` cohort).

---

## TIED version / dogfood

Session **4.2.1** on disposable client — not an effectiveness claim.

---

## Facilitator follow-ups

- Add Cursor-harness WF-10 cells for cross-harness argv stress.
- Clarify whether injected `cli.test.ts` should count toward composition facet in future snapshots.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium/PLAN.md)
