# Trial readout: PROMPT-WF-10 → Claude Sonnet 4.6 (`medium`) → `1794526284-wf-agentstream-wf-10-claude-claudesonnet46medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-12 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-sonnet-4-6` |
| **Model slug** | `claude-sonnet-4-6` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794526284-wf-agentstream-wf-10-claude-claudesonnet46medium` |
| **Factory tag** | `1794526284-wf-agentstream-wf-10-claude-claudesonnet46medium` |
| **Product REQ** | `REQ-CSV_SUMMARIZER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARIZER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-10** **Claude Sonnet 4.6** (`medium`) cell; **split signal** vs [Sonnet 4.6 low complete @ 1794525155](trial-readout-PROMPT-WF-10-claudesonnet46low-1794525155-wf-agentstream-wf-10-claude-claudesonnet46low.md). |

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
| 1 | `summarizeCsv` core + thin `cli.ts` |
| 2 | Composition binding test to `summarizeCsv` |
| 3 | `REQ-CSV_SUMMARIZER` token (not `REQ-CSV_SUMMARY_CLI`) |
| 4 | ESM + `node:test`; stack **`wf-trial-ts-node-test-v1`** |

---

## What was built

- **Product:** `src/summarize.ts`, `src/cli.ts`, `summarize.test.ts`, `cli.binding.test.ts`; facilitator **`npm test` 7/7** pass.
- **TIED:** REQ + ARCH + IMPL on disk (**uncommitted**); `CITDP-REQ-CSV_SUMMARIZER.yaml` under `tied-project/citdp/` (**uncommitted**); **`applied_lines 43`**.
- **Git:** bootstrap-only **`c919189`** — no traceable product commit.
- **Stack:** orchestrator **`exit_code: 0`**; wall **1044s** (~17 min).
- **Project size layers:** unit **3**, comp **4** (receipt); batch **`wall_clock` 17** min ([receipt](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/1794526284-wf-agentstream-wf-10-claude-claudesonnet46medium.json) · [summary row `wf-10-claude-claudesonnet46medium`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).
- **Proof manifest:** two `files[]` rows + one `bindings[]` wiring row.

---

## Outcome record

**Implementation outcome:** **Partial** — seven passing tests at facilitator replay; delivery on disk only.

**Workflow outcome:** **Split signal** — orchestrator **`exit_code: 0`** but close-out **`INCOMPLETE`** (`traceable_commit: skipped`; envelope **`blocking_gap_count: 1`**).

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 2.86 · B+/C/C+/B/C/A−/B+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail / ambiguous** | Manual receipt **`allowed: true`** but inventory **`close_out_outcome: INCOMPLETE`** — envelope `evidence_chain_profile` **error** gap |
| **Process contract** | **partial** | Four phase handoffs on disk; verification gate receipts from build turn |
| **Adherence ledger** | **partial** | CITDP **minimal** vs project **integrated** depth mismatch documented in gate receipt |
| **Orchestrator** | **pass** | **`exit_code: 0`**; no missing phase-handoff **ERROR** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARIZER/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARIZER/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Close-out gate (manual)** | `tied-project/working/REQ-CSV_SUMMARIZER/gates/close_out-gate-check-2026-11-12.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794526284-wf-agentstream-wf-10-claude-claudesonnet46medium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** captured |
| 2 | `refine-plan` | PLAN + phase handoff |
| 3 | `build-plan` | GREEN **7** tests; verification receipt |
| 4 | `close-out` | Envelope gap; **no** traceable commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **1044s** (~17 min) |

**Friction excerpts (stderr):** `harness=claude` `model=claude-sonnet-4-6` `model_effort=medium`; four `--- turn N/4 ---` boundaries; phase handoff gate default on (clean).

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs inventory | **No** product commit; inventory marks close-out **INCOMPLETE** |
| Proof manifest | Wiring binding present |
| CITDP | On disk under `tied-project/citdp/` but **uncommitted** |
| Depth tier | Envelope builder **integrated** vs CITDP **minimal** — documented mismatch in close-out gate |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` (inventory) |
| Facilitator `npm test` | **7** pass |
| Full CLI contract | **Partial** — summarize + binding tests; limited file/stdin coverage vs paste |

---

## Proof labels (manifest vs path)

| label | cases (receipt) |
| --- | ---: |
| unit.default | 3 |
| composition.wiring | 4 |

Live runner **7** cases matches receipt rollup.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | Core count logic tested; thin argv / I/O surface vs full goal-first-soc paste. |
| Traceability closure | **C** | Bootstrap-only git pin — product and CITDP **uncommitted**; close-out **INCOMPLETE**. |
| Test strategy | **C+** | **7** green cases only — lighter than Sonnet 4.6 **low** complete peer (**10**). |
| Algorithm / implementation | **B** | Small `summarize` module plus binding test; **43** applied pseudo-code lines. |
| Process adherence | **C** | Close-out blocked on envelope **`evidence_chain_profile`** gap despite advisory gate receipt. |
| Workflow choreography | **A−** | Orchestrator exit zero after four turns; close-out phase did not land traceable commit. |
| Methodology learning readout | **B+** | First Sonnet **4.6 medium** WF-10 readout — surfaces **depth_tier** resolution mismatch at close-out. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Contrasts with [Claude Sonnet 4.6 low @ 1794525155](trial-readout-PROMPT-WF-10-claudesonnet46low-1794525155-wf-agentstream-wf-10-claude-claudesonnet46low.md) (**workflow complete**, **`745e41d`**, **10/10** tests) and [Claude Sonnet 5.5 low split @ 1794366012](trial-readout-PROMPT-WF-10-claudesonnet55low-1794366012-wf-agentstream-wf-10-claude-claudesonnet55low.md) — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

**Split signal** cell: green tests and R+A+I YAML on disk, orchestrator **zero**, but **no** traceable close-out commit and envelope **blocking** gap — same disposition family as other Claude WF-10 incomplete close-outs.

---

## TIED version / dogfood

Session **4.2.2** on disposable client — facilitator replay only; not an effectiveness claim.

---

## Facilitator follow-ups

- Re-run close-out after fixing **depth_tier** alignment or supplying **`evidence_chain_profile`** when envelope resolves **integrated**.
- Commit product wave locally if sponsor wants a **workflow complete** replay label on this client id.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794526284-wf-agentstream-wf-10-claude-claudesonnet46medium/evidence/build-plan-verification-evidence.md)
