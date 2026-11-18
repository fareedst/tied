# Trial readout: PROMPT-WF-09 → Cursor Grok 4.7 (`low`) → `1795022513-wf-agentstream-wf-09-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-18 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_range`** / agentstream (`HARNESS=cursor`; **interleaved** four-phase) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](../catalogs/catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1795022513-wf-agentstream-wf-09-cursor-grok47low` |
| **Factory tag** | `1795022513-wf-agentstream-wf-09-cursor-grok47low` |
| **Product REQ** | `REQ-ORDERED_CONCURRENT_MAP` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/evidence/tied-methodology-version.session.v1.json` |
| **SC-DCR-06 readout label** | **`Full`** — verification + close_out gate receipts **allowed: true**; orchestrator **`exit_code: 0`** |
| **Cohort comparison** | Successor to [1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) (split signal / invalid slim slugs); same **grok47-low** cell — **no ranking**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

**Catalog stress:** ordered concurrent map (**TIED-DEMO-10**). **Proof boundary:** executable behavior + orchestrator log + facilitator replay — not HMEP token/cost metrics.

---

## RESOLVE (subject)

| Term | Resolution |
| --- | --- |
| API | `mapOrdered(items, worker, options?)` — index-aligned results |
| Stack | `wf-trial-ts-node-test-v1` |
| Depth | CITDP `profile_depth: minimal`, `gate_policy: advisory` |

---

## What was built

- **Product:** `src/map-ordered.ts`, `src/map-ordered.test.ts`; facilitator **6/6** pass.
- **TIED:** Four phase handoffs; CITDP at close-out; verification + close_out gate receipts on disk.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **754s** (~12.6 min).
- **Git:** bootstrap **`62f1920`** + product **`f8a6e19`** + close-out docs **`647c172`**.

### Project size layers (evidence-only)

MCP `tied_project_size_snapshot` @ client root: **atoms** index 1/1/1; **operational_intent** 37 applied lines; **proof_facets** **6** `unit.default` cases, **0** composition; `operational_intent_hash` `3c09ada7…`. Receipt **proof_boundary:** size evidence does not prove REQ satisfaction or grade.

### Composition evidence subcheck

| Check | Result |
| --- | --- |
| `composition_evidence_subcheck` | **fail** (no binding test) |
| `label_histogram` | `unit.default` × **6** |
| `binding_test_present` | **false** |

---

## Outcome record

**Implementation outcome:** **Pass (local)** — `mapOrdered` green at facilitator replay.

**Workflow outcome:** **Complete (machine)** — orchestrator **`exit_code: 0`**; verification and close_out gates **allowed: true**.

**Grading outcome:** **Grade mean (registry compact):** 3.59 · A/A-/B+/A-/A-/A-/B.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-18T17-33-11-977Z.json` **allowed: true** |
| **Process contract** | **partial** | Four-turn inventory; envelope gaps **0**; verification manifest missing `command_results` per handoff |
| **Adherence ledger** | **partial** | Reconcile grade **B**; `thin_ledger` warn on verification receipt hash |
| **Orchestrator** | **pass** | **`exit_code: 0`**; interleaved batch complete |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Verification | `…/gates/verification-2026-11-18T17-30-27-618Z.json` |
| Proof manifest | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../../tied-project/working/FACILITATOR-WF-09-1795022513-wf-agentstream-wf-09-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN; session methodology **4.2.2** |
| 2 | `refine-plan` | Ordered-map API + concurrency rules locked |
| 3 | `build-plan` | **6/6** GREEN; verification receipt **allowed: true** |
| 4 | `close-out` | Envelope blocking gaps **0**; commits **`f8a6e19`** / **`647c172`**; close_out **allowed: true** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1795022513-wf-agentstream-wf-09-cursor-grok47low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **754s** |

**Friction excerpts:**

- `DIAGNOSTIC: WF trial interleaved phase 1/4` … `4/4`
- `DIAGNOSTIC: WF trial slim tracker reconcile: valid slim shape`
- `DIAGNOSTIC: WF trial verification receipt assist: receipt already present (skip)`
- `DIAGNOSTIC: wf-trial process log manifest=…/wf-trial-orchestrator-run.v1.json`

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | Product **`f8a6e19`** after green **6/6** tests; close-out docs commit follows |
| Slim tracker | Canonical slugs at turn 1 — no `invalid_slug` close_out blocker (contrast [1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md)) |
| Composition | Unit tests only — cohort **composition_evidence_subcheck** fail expected for WF-09 v1 unit-only builds |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **6** pass |
| `npm run typecheck` | **fail** (import `.ts` extension — optional script present) |
| Composition cohort | **0** composition test files |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Concurrency cap, fail-fast, and order guarantees locked in refine before RED. |
| Traceability closure | **A−** | Product + close-out commits and CITDP persist; adherence ledger still partial. |
| Test strategy | **B+** | Six deterministic-delay cases; no binding test for composition cohort stress. |
| Algorithm / implementation | **A−** | `mapOrdered` honors cap, empty input, and index order under overlap. |
| Process adherence | **A−** | Verification and close_out receipts **allowed**; thin-ledger warn on verification hash. |
| Workflow choreography | **A−** | Interleaved four-phase run with orchestrator **0** and machine close_out pass. |
| Methodology learning readout | **B** | Documents Grok **low** WF-09 recovery on slim tracker — not ranked vs [1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md). |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-09)

Pairs with [1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) (same **grok47-low** harness, prior split signal) and [1794606142](trial-readout-PROMPT-WF-09-composer25med-1794606142-wf-agentstream-wf-09-cursor-composer25med.md) on the same prompt — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Adds registry row **09 / 1795022513** (Cursor `grok-4.7-low-fast`). Supersedes **cursor:grok47-low** matrix anchor vs [1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) when facilitators run `@publish-wf-trial-summaries`.

---

## TIED version / dogfood

Session capture **4.2.2** from `tied-methodology-version.session.v1.json` at add-feature — documents disposable bootstrap on current store methodology, not effectiveness of model or effort tier.

---

## Facilitator follow-ups

- Optional: fix `tsconfig` / test import style so `npm run typecheck` passes on disposable stack.
- Run `@publish-wf-trial-summaries` to refresh registry **Latest** and comparison matrix for **grok47-low**.

---

## Related links

- [Traditional workflow catalog](../catalogs/catalog-traditional-workflow-trial-prompts.md)
- [Runs registry](../registries/traditional-workflow-trial-runs-registry.md)
- [Facilitator evidence](../../../tied-project/working/FACILITATOR-WF-09-1795022513-wf-agentstream-wf-09-cursor-grok47low/evidence/)