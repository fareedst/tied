# Trial readout: PROMPT-WF-10 → Claude Sonnet 4.6 (`low`) → `1794533928-wf-agentstream-wf-10-claude-claudesonnet46low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-sonnet-4-6` |
| **Model slug** | `claude-sonnet-4-6` |
| **Model effort** | `low` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794533928-wf-agentstream-wf-10-claude-claudesonnet46low` |
| **Factory tag** | `1794533928-wf-agentstream-wf-10-claude-claudesonnet46low` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` (working folder only — **no** committed index) |
| **TIED methodology version (session)** | **4.2.2** — **bootstrap-inferred only** (orchestrator resolver in stderr; no `tied-methodology-version.session.v1.json`) |
| **Cohort comparison** | Re-run **Sonnet 4.6 low** on **4.2.2**; peer [1794525155](trial-readout-PROMPT-WF-10-claudesonnet46low-1794525155-wf-agentstream-wf-10-claude-claudesonnet46low.md) **workflow complete** with **10** tests — this cell **22/22** uncommitted with phase-handoff gate **ERROR**. |

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
| Input | `--file` XOR `--stdin` |
| Modules | `csv`, `args`, `cli`, `cli.binding` tests |
| Stack | `wf-trial-ts-node-test-v1` |

---

## What was built

- **Product:** `src/` CSV summary CLI stack; facilitator **`npm test` 22/22**.
- **TIED:** Working `REQ-CSV_SUMMARY_CLI` PLAN + build-plan handoff only — **no** `phase-handoff-add-feature.md`, **no** `trial-workflow-interaction-inventory.v1.json`, **no** close-out pass.
- **Stack:** orchestrator **`exit_code: 0`**; wall **302s** (~5.0 min).
- **Git:** bootstrap **`9eb957e`** — product **untracked**.
- **Project size layers:** unit **20**, comp **2** (receipt); **`applied_lines` 0**; batch **`wall_clock` 5** min · [summary row `wf-10-claude-claudesonnet46low`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md).
- **Proof manifest:** **4** `files[]` rows + **1** `bindings[]` (`composition.wiring`).

---

## Outcome record

**Implementation outcome:** **Pass (local)** — twenty-two green tests including **2** composition wiring cases.

**Workflow outcome:** **Split signal** — orchestrator **`exit_code: 0`** but **no** close-out; stderr **ERROR** `could not resolve product REQ from working folder` (missing turn-1 handoff / index).

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 2.94 · A−/C+/A/B+/D+/B/B.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **not_run** | No close-out gate receipt on client |
| **Process contract** | **fail partial** | Build-plan GREEN archived; missing add-feature handoff |
| **Adherence ledger** | **not_run** | — |
| **Orchestrator** | **pass shell** | **`exit_code: 0`**; phase-handoff gate **ERROR** post turn 4 |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | **missing** |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794533928-wf-agentstream-wf-10-claude-claudesonnet46low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` (expected) | **No** `phase-handoff-add-feature.md` on disk — resolver could not pin product REQ |
| 2 | `refine-plan` | PLAN + refine handoff present |
| 3 | `build-plan` | **22/22** GREEN; slim tracker marks verify steps done |
| 4 | `close-out` (expected) | **Not observed** — no close-out handoff or gate |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **302s** (~5.0 min) |

**Friction excerpts (stderr):** four `--- turn N/4 ---` banners; **`ERROR: WF trial phase handoff gate: could not resolve product REQ from working folder`**; diagnostics list `REQ-CSV_SUMMARY_CLI` alongside non-REQ working children.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Commits | Bootstrap only |
| Turn-1 contract | Missing `request_token` handoff breaks default-on phase-handoff gate |
| vs 1794525155 | Peer **workflow complete** with **10** tests and **`close_out` allowed** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` (PLAN) |
| Facilitator `npm test` | **22/22** |
| Product under `src/` | **Present (untracked)** |

---

## Proof labels (manifest vs path)

| label | cases (receipt) |
| --- | ---: |
| unit.default | 20 |
| composition.wiring | 2 |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | PLAN locks CSV CLI mutex argv before build-plan GREEN. |
| Traceability closure | **C+** | Proof manifest and handoffs on disk but no REQ index commit or CITDP persist. |
| Test strategy | **A** | **22/22** green including binding tests — deeper than peer **10** case complete cell. |
| Algorithm / implementation | **B+** | Modular parser/args/cli split passes facilitator replay. |
| Process adherence | **D+** | Missing add-feature handoff yields orchestrator phase-handoff **ERROR** despite shell exit zero. |
| Workflow choreography | **B** | Four sessions ran; workflow machinery did not reach close-out. |
| Methodology learning readout | **B** | Documents **Sonnet 4.6 low** re-run where test depth improved but turn-1 resolver contract regressed. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; compare harness exit with handoff completeness before cohort claims.

---

## Cross-model notes (PROMPT-WF-10)

Contrast [Sonnet 4.6 low complete @ 1794525155](trial-readout-PROMPT-WF-10-claudesonnet46low-1794525155-wf-agentstream-wf-10-claude-claudesonnet46low.md) and [Haiku low split @ 1794533119](trial-readout-PROMPT-WF-10-claudehaiku55low-1794533119-wf-agentstream-wf-10-claude-claudehaiku55low.md) — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Same batch label **`wf-10-claude-claudesonnet46low`** as the **1794525155** complete cell; this epoch adds **more** automated tests (**22** vs **10**) without reaching machine close-out.

---

## TIED version / dogfood

Session **4.2.2** bootstrap-inferred — not an effectiveness claim for Sonnet 4.6 low effort.

---

## Facilitator follow-ups

- Client repair: add **`phase-handoff-add-feature.md`** with `request_token: REQ-CSV_SUMMARY_CLI` and committed `requirements.yaml` before re-running close-out.
- Store: correlate phase-handoff gate **ERROR** with orchestrator **`exit_code: 0`** in operator runbooks.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794533928-wf-agentstream-wf-10-claude-claudesonnet46low/evidence/build-plan-verification-evidence.md)
- [Peer complete @ 1794525155](trial-readout-PROMPT-WF-10-claudesonnet46low-1794525155-wf-agentstream-wf-10-claude-claudesonnet46low.md)
