# Trial readout: PROMPT-WF-09 → Cursor Grok 4.7 (`low`) → `1794608051-wf-agentstream-wf-09-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-09`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794608051-wf-agentstream-wf-09-cursor-grok47low` |
| **Factory tag** | `1794608051-wf-agentstream-wf-09-cursor-grok47low` |
| **Product REQ** | `REQ-ORDERED_CONCURRENT_MAP` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | First **4.2.2** Cursor **Grok 4.7 low** WF-09 cell; pairs [Composer medium @ 1794606142](trial-readout-PROMPT-WF-09-composer25med-1794606142-wf-agentstream-wf-09-cursor-composer25med.md) and Haiku-low split readouts without ranking. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

**Catalog stress:** ordered parallel map (**TIED-DEMO-10**). **Proof boundary:** executable behavior + orchestrator log + facilitator replay — not HMEP token/cost metrics.

---

## What was built

- **Product:** `src/map-ordered.ts` + `src/map-ordered.test.ts`; facilitator **`npm test` 4/4** pass.
- **TIED:** Working tree under `REQ-ORDERED_CONCURRENT_MAP`; slim checklist tracker slugs block verification/close_out gates.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **727s** (~12 min).
- **Git:** bootstrap-only **`9fcaaa1`** (`TIED 4.2.2`); product + TIED artifacts uncommitted.

---

## Outcome record

**Implementation outcome:** **Partial** — four passing unit tests at facilitator replay.

**Workflow outcome:** **Incomplete (split signal)** — orchestrator batch finished; **`close_out` allowed: false** (`invalid_slug` on slim tracker); no product commit.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry compact):** 2.56 · B+/D+/B/B+/C/B−/C+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `close_out-2026-11-13T22-25-38-629Z.json` **allowed: false** |
| **Process contract** | **partial** | Four-turn manifest; verification gate also **allowed: false** (same slugs) |
| **Adherence ledger** | **partial** | Events on disk; reconcile grade **B** with thin-ledger warnings per close-out handoff |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Proof manifest | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-09-1794608051-wf-agentstream-wf-09-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.2** |
| 2 | `refine-plan` | PLAN locks ordered-map contract + stack |
| 3 | `build-plan` | **4/4** green tests; verification receipt **allowed: false** (slim slugs) |
| 4 | `close-out` | **incomplete_close_out_gate_blocked** — no commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794608051-wf-agentstream-wf-09-cursor-grok47low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **727s** |

**Friction excerpts:**

- `DIAGNOSTIC: harness=cursor model=grok-4.7-low-fast model_effort=low`
- `DIAGNOSTIC: proof manifest scaffold seeded` (default-on proof manifest gate)
- `DIAGNOSTIC: WF trial phase handoff gate: default on`
- `DIAGNOSTIC: wf-trial process log manifest=…/wf-trial-orchestrator-run.v1.json`

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | **4/4** tests on disk; only bootstrap commit **`9fcaaa1`** — no traceable product commit |
| Gate mismatch | Slim tracker slugs `red-tests` / `implement-code` outside canonical registry — blocks verification and close_out |
| Inventory vs machine | Inventory records **`close_out_allowed: false`** while orchestrator **`exit_code: 0`** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **4** pass |
| Composition cohort | No composition test files declared |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | Ordered concurrent map contract locked in PLAN before implementation. |
| Traceability closure | **D+** | Bootstrap-only git; green tests and R+A+I indexes uncommitted; close_out blocked. |
| Test strategy | **B** | Four deterministic-delay cases; thinner than peer eight-test WF-09 cells. |
| Algorithm / implementation | **B+** | `mapOrdered` preserves input order under concurrency cap and fail-fast. |
| Process adherence | **C** | Orchestrator success while close_out gate reports **allowed: false**. |
| Workflow choreography | **B−** | Twelve-minute wall; verification and close_out not satisfied on slim checklist slugs. |
| Methodology learning readout | **C+** | Adds **4.2.2** Grok 4.7 **low** WF-09 split-signal datapoint — not ranked vs [Composer @ 1794606142](trial-readout-PROMPT-WF-09-composer25med-1794606142-wf-agentstream-wf-09-cursor-composer25med.md). |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-09)

Contrasts [Claude Haiku low @ 1794582335](trial-readout-PROMPT-WF-09-claudehaiku55low-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low.md) (**9/9** tests, similar close_out blocker pattern) and [Grok 4.7 low WF-10 @ 1794522969](trial-readout-PROMPT-WF-10-grok47low-1794522969-wf-agentstream-wf-10-cursor-grok47low.md) on a different prompt — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Adds registry row **09 / 1794608051** (Cursor `grok-4.7-low-fast`). **Latest-run comparison matrix** cell **`cursor:grok47-low`** (see [runs registry](traditional-workflow-trial-runs-registry.md#latest-run-comparison-matrix)).

---

## TIED version / dogfood

Session capture **4.2.2** from `tied-methodology-version.session.v1.json` at add-feature — documents disposable bootstrap on current store methodology, not effectiveness of model or effort tier.

---

## Facilitator follow-ups

- Sponsor choice: align slim WF checklist slugs with canonical registry vs waive on disposable close-out cells.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Runs registry](traditional-workflow-trial-runs-registry.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-09-1794608051-wf-agentstream-wf-09-cursor-grok47low/evidence/)
