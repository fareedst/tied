# Trial readout: PROMPT-WF-09 → Claude Haiku 5.5 (low effort) → `1795021618-wf-agentstream-wf-09-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-18 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_range`** / agentstream (`HARNESS=claude`; **interleaved** four-phase) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](../catalogs/catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `claude-haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1795021618-wf-agentstream-wf-09-claude-claudehaiku55low` |
| **Factory tag** | `1795021618-wf-agentstream-wf-09-claude-claudehaiku55low` |
| **Product REQ** | `REQ-ORDERED_CONCURRENT_MAP` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/evidence/tied-methodology-version.session.v1.json` |
| **SC-DCR-06 readout label** | **`partial_tier_b`** — verification **`allowed: true`**; orchestrator **`exit_code: 0`**; **no** `gates/close_out-*.json` (tier B diagnostic only) |
| **Verification receipt** | **Agent-persisted** — assist skipped (`receipt already present`); manifest has **no** `verification_receipt_assist` flag |
| **Cohort comparison** | Post–[VRCS](../../tied-project/working/REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC/PLAN.md) + [range default assist](../../tied-project/working/REQ-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST/PLAN.md); successor to [1794582335](trial-readout-PROMPT-WF-09-claudehaiku55low-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low.md) (**9/9** uncommitted, no verification receipt). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

**Catalog stress:** ordered concurrent map (**composition cohort**). **Proof boundary:** executable behavior + orchestrator log + facilitator replay — not HMEP pricing unless separately imported.

---

## RESOLVE (subject)

| Term | Resolution |
| --- | --- |
| API | `mapOrdered(items, fn, { concurrency? })` — index-aligned results |
| Stack | `wf-trial-ts-node-test-v1` |
| Depth | CITDP `profile_depth: minimal`, `gate_policy: advisory` |

---

## What was built

- **Product:** `src/map-ordered.ts`, `src/map-ordered.test.ts`; facilitator **10/10** pass.
- **TIED:** Four phase handoffs; CITDP persisted at close-out; verification receipt **`allowed: true`**; **no** `close_out-*.json` on disk.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~264s** (~4.4 min).
- **Git:** bootstrap **`e47a928`** + product **`02295b6`**.
- **Harness note:** Range-default receipt assist did not run — agent already wrote `gates/verification-*.json` before post-batch hook.

---

## Outcome record

**Implementation outcome:** **Pass (local)** — `mapOrdered` green at facilitator replay.

**Workflow outcome:** **Partial (machine tier B)** — orchestrator **`exit_code: 0`**; verification gate **pass**; honest incomplete close_out (no persisted close_out receipt file).

**Grading outcome:** **Grade mean (registry compact):** 3.33 · B+/B+/B+/A-/B-/B+/B.

**SC-DCR-06 three-way stress (store REQ):**

| Grade row | This cell |
| --- | --- |
| **Full** | **No** — missing `close_out` gate receipt file |
| **Partial (`partial_tier_b`)** | **Yes** — verification **`allowed: true`**; orchestrator **0** with tier B diagnostic only |
| **Fail (`fail`)** | **Not this cell** — unlike 1795019148-class verification pass **without** receipt |

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **partial** | Tier B: `wf_trial_machine_closeout_reason=no_close_out_gate_receipt`; close-out handoff claims gate **allowed** but **no** `gates/close_out-*.json` |
| **Process contract** | **partial** | Handoffs 1–4 on disk; verification receipt present; adherence hash mismatch noted in close-out handoff |
| **Adherence ledger** | **partial** | `tied_adherence_reconcile_run` band **B** per close-out handoff |
| **Orchestrator** | **pass** | **`exit_code: 0`**; phase handoff gate default on |
| **Composition stress** | **gap** | **0** composition test files (unit-only cohort) |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/PLAN.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Verification | `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/gates/verification-2026-11-18T17-10-39-979Z.json` |
| Proof manifest | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../../tied-project/working/FACILITATOR-WF-09-1795021618-wf-agentstream-wf-09-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN; session methodology **4.2.2** |
| 2 | `refine-plan` | API + concurrency decisions locked |
| 3 | `build-plan` | **10/10** GREEN; verification receipt persisted (`verification_receipt_status: persisted`) |
| 4 | `close-out` | CITDP persist + envelope gaps 0; product commit **`02295b6`**; adherence partial |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1795021618-wf-agentstream-wf-09-claude-claudehaiku55low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **264s** |

**Friction excerpts:**

- `DIAGNOSTIC: WF trial interleaved: four-phase batch complete`
- `DIAGNOSTIC: WF trial verification receipt assist: receipt already present (skip)`
- `DIAGNOSTIC: wf_trial_machine_closeout_reason=no_close_out_gate_receipt`
- `DIAGNOSTIC: wf-trial process log manifest=…/wf-trial-orchestrator-run.v1.json`

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | Product commit **`02295b6`** after green **10/10** tests |
| Verification vs assist | Agent receipt on disk before assist hook — validates VRCS arm A path without facilitator assist |
| Close_out receipt | Handoff claims pass; orchestrator tier B consistent with missing `close_out-*.json` |
| Composition | Unit tests only |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **10** pass |
| Composition cohort | **0** composition test files |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | Ordered concurrent map and concurrency rules locked in refine before RED. |
| Traceability closure | **B+** | Product **`02295b6`** and persisted CITDP; no close_out receipt file for machine Full. |
| Test strategy | **B+** | Ten deterministic cases including reverse completion order and invalid concurrency. |
| Algorithm / implementation | **A−** | `mapOrdered` with cap, fail-fast, and index-aligned output in one module. |
| Process adherence | **B−** | Verification gate satisfied; close-out partial on adherence hash and missing close_out artifact. |
| Workflow choreography | **B+** | Sub-five-minute interleaved four-phase run with orchestrator **0** and agent verification persist. |
| Methodology learning readout | **B** | First Haiku-low WF-09 after range-default assist ship where agent alone satisfied verification — not ranked vs [1794582335](trial-readout-PROMPT-WF-09-claudehaiku55low-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low.md). |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-09)

Pairs with [1794582335](trial-readout-PROMPT-WF-09-claudehaiku55low-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low.md) and [1794579829](trial-readout-PROMPT-WF-09-claudehaiku55low-1794579829-wf-agentstream-wf-09-claude-claudehaiku55low.md). Same Haiku **low** harness; **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Adds a **4.2.2** datapoint where **agent verification persist** avoids facilitator assist under range-default env. See [runs registry](../registries/traditional-workflow-trial-runs-registry.md) row **09 / 1795021618**.

---

## TIED version / dogfood

Session capture **4.2.2** from `tied-methodology-version.session.v1.json` at add-feature — documents disposable bootstrap on current store methodology, not effectiveness of model or effort tier.

---

## Facilitator follow-ups

- Optional HMEP import when range capture+jsonl present on client.
- Sponsor choice: persist `close_out` gate receipt in agent close-out vs accept tier B for matrix cohort.

---

## Related links

- [Traditional workflow catalog](../catalogs/catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../../tied-project/working/FACILITATOR-WF-09-1795021618-wf-agentstream-wf-09-claude-claudehaiku55low/evidence/)