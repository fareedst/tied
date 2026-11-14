# Trial readout: PROMPT-WF-10 → Claude Haiku 5.5 (medium effort) → `1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-haiku-5-5` (`medium` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium` |
| **Factory tag** | `1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Same prompt/cell as [Haiku medium @ 1794376176](trial-readout-PROMPT-WF-10-claudehaiku55medium-1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium.md) — this run **implements** the CSV CLI with **21/21** tests after **phase-handoff gate fix** (resolver accepts table handoff). |

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
| Input | `--file <path>` XOR `--stdin`; dual/neither → exit 2 usage |
| Header row | Excluded from row count (locked refine-plan) |
| Stack | `wf-trial-ts-node-test-v1`, colocated `src/**/*.test.ts` |

---

## What was built

- **Product:** TypeScript CSV summary CLI (`src/csv-summary.ts`, `src/cli.ts`, `src/bin.ts`); facilitator **`npm test` 21/21**.
- **TIED:** REQ index + detail; PLAN + handoffs 1–4; proof manifest **2** unit rows with **on-disk** paths; **no** persisted `tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml`.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator manifest **`exit_code: 0`**; wall **~427s** (7.1 min).
- **Git:** bootstrap pin **`eb83f76`** only — product tree **uncommitted**.
- **Project size layers:** unit **21**; comp **0**; `operational_intent_hash` empty; batch **`wall_clock` 7** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium.json) · [summary row `wf-10-claude-claudehaiku55medium`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).

---

## Outcome record

**Implementation outcome:** **Pass (local)** — sponsor CSV/argv contract exercised by automated tests.

**Workflow outcome:** **Split signal** — four turns complete; orchestrator **`exit_code: 0`**; machine **close-out not allowed** (CITDP adversarial open-record fields).

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** ~2.9 · mixed A/B bands with process **C+**.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` `missing_file` (no persisted CITDP); verification receipt `allowed: false` |
| **Process contract** | **partial** | RED/GREEN stdout archived; proof manifest validated; no `close_out-*.json` |
| **Adherence ledger** | **partial** | `tied_adherence_reconcile_run` process_grade **B (88)**; stale verification receipt hashes |
| **Orchestrator** | **pass shell / incomplete close** | **`exit_code: 0`**; phase handoff gate **passed** (post wave-2 resolver) |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Turn-1 handoff | Table `\| REQ token \|` + `request_token:` line — resolves under fixed gate |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN + table handoff |
| 2 | `refine-plan` | Locked argv, header semantics, tracker |
| 3 | `build-plan` | **21/21** GREEN; verification receipt stored **`allowed: false`** (CITDP adversarial fields) |
| 4 | `close-out` | **Incomplete** — honest handoff; CITDP persist rejected; no commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **427s** (~7.1 min) |

**Friction excerpts (stderr):** proof manifest + phase handoff gates default-on; slim tracker copy-if-absent; **no** `could not resolve product REQ` (contrast pre-fix run **1794406459**); four turn session boundaries logged.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Product vs bootstrap commit | All product files **untracked** — build-plan turn did not reach `traceable-commit` |
| Turn order | Inventory ordinals 1–4 align with orchestrator stderr turn markers |
| vs peer 1794376176 | Same medium cell previously skipped build-plan; this cell **shipped code** under same gate defaults |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **21/21** pass |
| Product under `src/` | **Present** (`cli.ts`, `csv-summary.ts`, tests) |

---

## Proof labels (manifest vs path)

| Path | On disk | Facet |
| --- | --- | --- |
| `src/csv-summary.test.ts` | yes | unit |
| `src/cli.test.ts` | yes | unit |

Composition subcheck MCP **not run** (tool unavailable this session). PROMPT-WF-10 is not in the WF-09..12 binding mandate row; unit coverage is primary stress.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | `--file` / `--stdin` mutex and header-excluded row count locked in PLAN before RED. |
| Traceability closure | **B−** | REQ indexed and tests align to PLAN; CITDP never persisted and no product commit. |
| Test strategy | **A−** | RED/GREEN archived with **21** cases; verification gate blocked on adversarial CITDP shape. |
| Algorithm / implementation | **A** | Facilitator `npm test` **21/21** on CSV parse and CLI argv paths. |
| Process adherence | **C+** | Registry slugs in `completed`; **no** `gates/close_out-*.json`; work uncommitted. |
| Workflow choreography | **B+** | Four sessions through build-plan; close-out documents blockers instead of false pass. |
| Methodology learning readout | **B** | Process log shows phase-handoff gate pass after table-token resolver ship. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; this cell is evidence that resolver hardening unblocks orchestrator exit 0 **with** product tests while CITDP open-record policy still blocks machine close-out.

---

## Cross-model notes (PROMPT-WF-10)

Contrast [Haiku medium @ 1794376176](trial-readout-PROMPT-WF-10-claudehaiku55medium-1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium.md) (**0** tests, scaffold manifest) and [Haiku low @ 1794371036](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md) (**16** tests, close-out incomplete). Same harness; **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Post **[REQ-WF_TRIAL_PHASE_HANDOFF_GATE](tied-project/working/REQ-WF_TRIAL_PHASE_HANDOFF_GATE/PLAN.md)** wave 2: table handoff + dirname resolver lets medium Haiku reach build-plan GREEN while minimal adversarial CITDP fields still block verification/close-out receipts.

---

## TIED version / dogfood

Session **4.2.2** captured on turn 1 — not an effectiveness claim for medium effort or resolver fix alone.

---

## Facilitator follow-ups

- Sponsor: decide adversarial open-record policy at **minimal** depth vs `sub-adversarial-inquiry-pass` N/A (same blocker as build-plan handoff).
- Optional: commit product tree manually if sponsor wants SHA pin for cohort compare.
- Re-run `@record-wf-trial` with `--force` after close-out repair.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Batch size comparison (summary row)](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md) — **WF-10** post-resolver Haiku effort matrix (`1794407806` / `1794408633` / `1794409094`)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium/evidence/build-plan-verification-evidence.md)
- [Peer negative control @ 1794376176](trial-readout-PROMPT-WF-10-claudehaiku55medium-1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium.md)
