# Trial readout: PROMPT-WF-10 → Claude Haiku 5.5 (`low`) → `1795030819-wf-agentstream-wf-10-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-18 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](../catalogs/catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1795030819-wf-agentstream-wf-10-claude-claudehaiku55low` |
| **Factory tag** | `1795030819-wf-agentstream-wf-10-claude-claudehaiku55low` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.3.0** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First published **4.3.0** Haiku **low** WF-10 cell; prior low peers on **4.2.2** split on adversarial CITDP — this run **machine complete** with **`180b4e2`** and **21/21** tests. |

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
| Modules | `args.ts`, `summary.ts`, `cli.ts`; `cli.binding.test.ts` wiring |

---

## What was built

- **Product:** `src/args.ts`, `src/summary.ts`, `src/cli.ts`, colocated tests + **`src/cli.binding.test.ts`**; facilitator **`npm test` 21/21**.
- **TIED:** PLAN + phase handoffs 1–4; slim tracker; persisted **`tied-project/citdp/CITDP-REQ-CSV_SUMMARY_CLI.yaml`** (`minimal` depth).
- **Stack:** orchestrator **`exit_code: 0`**; wall **357s** (~6 min).
- **Git:** product commit **`180b4e27a31ab80fbc87b567f2f783fba7c56c8e`** after bootstrap **`bf91f1f`** (`TIED 4.3.0`).
- **Project size layers:** unit **20**, **composition_tests: 1**; **`applied_lines` 0**; receipt `proof_boundary` applies — see size subsection below.
- **Proof manifest:** **4** `files[]` rows + **1** `bindings[]` (`composition.wiring`).

### Project size layers

|MCP `layers.proof_facets` | Value |
| --- | ---: |
| `unit_tests` | 20 |
| `composition_tests` | 1 |
| `label_case_counts.composition.wiring` | 1 |
| `hashes.operational_intent_hash` | empty corpus (no IMPL sidecars on client) |

---

## Outcome record

**Implementation outcome:** **Pass (local)** — CSV CLI + summarize core green at facilitator replay (**21/21**).

**Workflow outcome:** **Complete (machine)** — orchestrator **`exit_code: 0`**; verification and close_out gates **`allowed: true`**; traceable commit **`180b4e2`** on disk.

**Grading outcome:** Session bands describe this cell only. **Grade mean (facilitator):** 3.87 · A/A/A−/A/B+/A/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-18T19-45-48-257Z.json` **`allowed: true`** |
| **Process contract** | **partial** | Dual-write + manifest present; **`traceable-commit` still pending** in tracker despite commit SHA |
| **Adherence ledger** | **not_run** | No `tied_adherence_reconcile_run` in close-out pass |
| **Orchestrator** | **pass shell** | **`exit_code: 0`**; four turns in inventory |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1795030819-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | PLAN + REQ yaml + session **4.3.0** capture |
| 2 | `refine-plan` | Locked CLI contract + exit codes |
| 3 | `build-plan` | **21/21** GREEN; verification gate **`allowed: true`** |
| 4 | `close-out` | CITDP persisted; close_out **allowed**; commit **`180b4e2`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **357s** (~6 min) |

**Friction excerpts (stderr):** `HARNESS=claude` `model=claude-haiku-5-5` `model_effort=low`; `tied_methodology_version=4.3.0`; four `WF trial interleaved phase N/4` boundaries; proof manifest default-on; verification receipt assist skipped (receipt already present); machine closeout exit check default-on.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Commits | Bootstrap **`bf91f1f`** then product **`180b4e2`** — feature after four-phase batch |
| Build vs close | Tests green before close_out; gate receipts timestamps order verification → close_out |
| vs 1794533119 | Prior **4.2.2** low peer blocked on CITDP adversarial — this **4.3.0** cell passes machine gates |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **21/21** |
| Product under `src/` | **Committed** in **`180b4e2`** |

---

## Proof labels (manifest vs path)

MCP `tied_trial_composition_evidence_subcheck` — **`composition_evidence_subcheck: pass`**.

| label | cases (receipt) |
| --- | ---: |
| unit.default | 20 |
| composition.wiring | 1 |

Manifest declares **`CLI→core`** binding on `src/cli.binding.test.ts`.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Mutex `--file` / `--stdin` and CSV summarize rules locked in PLAN before RED. |
| Traceability closure | **A** | REQ + CITDP on disk, envelope **0** blocking gaps, facilitator **`tied_validate_consistency` ok**. |
| Test strategy | **A−** | RED/GREEN archived with **21** cases and **composition.wiring** — leaner than [Haiku high @ 1794409094](trial-readout-PROMPT-WF-10-claudehaiku55high-1794409094-wf-agentstream-wf-10-claude-claudehaiku55high.md) **50** cases. |
| Algorithm / implementation | **A** | Facilitator replay **21/21** including quoted-field limitation tests. |
| Process adherence | **B+** | Registry slugs in `completed`; **`traceable-commit` pending** in tracker after commit landed. |
| Workflow choreography | **A** | Four orchestrator turns; inventory marks close-out **complete** with honest partial process contract. |
| Methodology learning readout | **A−** | Documents first **4.3.0** Haiku **low** WF-10 **machine complete** path vs prior split-signal low cohort. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; **4.3.0** complete here is evidence for this cell only, not a universal claim over **4.2.2** splits.

---

## Cross-model notes (PROMPT-WF-10)

Contrast [Haiku low split @ 1794533119](trial-readout-PROMPT-WF-10-claudehaiku55low-1794533119-wf-agentstream-wf-10-claude-claudehaiku55low.md) and [Haiku high complete @ 1794409094](trial-readout-PROMPT-WF-10-claudehaiku55high-1794409094-wf-agentstream-wf-10-claude-claudehaiku55high.md) — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Among published **Haiku low** WF-10 readouts, this is the first **session 4.3.0** row with **verification + close_out allowed** and a **product SHA** at **low** effort.

---

## TIED version / dogfood

Session **4.3.0** captured on turn 1 via `server_info` — not an effectiveness claim for **low** effort or Haiku 5.5 alone.

---

## Facilitator follow-ups

- Optional: reconcile tracker `traceable-commit` disposition to **completed** on the disposable client.
- Run `@publish-wf-trial-summaries` after readout land (registry/matrix refresh).

---

## Related links

- [Traditional workflow catalog](../catalogs/catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1795030819-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md)