# Trial readout: PROMPT-WF-03 → Cursor Grok 4.7 (`low`) → `1795023644-wf-agentstream-wf-03-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-18 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_range`** / agentstream (`HARNESS=cursor`; **interleaved** four-phase) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](../catalogs/catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1795023644-wf-agentstream-wf-03-cursor-grok47low` |
| **Factory tag** | `1795023644-wf-agentstream-wf-03-cursor-grok47low` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/tied-methodology-version.session.v1.json` |
| **SC-DCR-06 readout label** | **`Full`** — verification + close_out gate receipts **allowed: true**; orchestrator **`exit_code: 0`** |
| **Cohort comparison** | Successor to [1794616912](trial-readout-PROMPT-WF-03-grok47low-1794616912-wf-agentstream-wf-03-cursor-grok47low.md) (split signal / `invalid_slug`); same **grok47-low** WF-03 cell — **no ranking**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

**Catalog stress:** composition seam (**TIED-DEMO-08**). **Proof boundary:** executable behavior + orchestrator log + facilitator replay — not HMEP metrics.

---

## RESOLVE (subject)

| Term | Resolution |
| --- | --- |
| Modules | `producer`, `consumer`, `wiring` under `src/` |
| Stack | `wf-trial-ts-node-test-v1` |
| Depth | CITDP `profile_depth: minimal`, `gate_policy: advisory` |

---

## What was built

- **Product:** `src/producer.ts`, `src/consumer.ts`, `src/wiring.ts`, `src/wiring.test.ts`; facilitator **1/1** pass.
- **TIED:** Four phase handoffs; CITDP at close-out; verification + close_out receipts on disk.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **661s** (~11 min).
- **Git:** bootstrap **`51f71ed`** + product **`c2cfaae`**.

### Project size layers (evidence-only)

MCP `tied_project_size_snapshot`: **atoms** 1/1/1; **operational_intent** 25 applied lines; **proof_facets** **1** `unit.default` case; `operational_intent_hash` `b7ade097…`. Receipt **proof_boundary:** size evidence does not prove REQ satisfaction or grade.

### Composition evidence subcheck

| Check | Result |
| --- | --- |
| `composition_evidence_subcheck` | **n_a** (WF-03 binding lens) |
| `binding_test_present` | **true** |
| `label_histogram` | `composition.wiring` × **1** |

---

## Outcome record

**Implementation outcome:** **Pass (local)** — wiring test green at facilitator replay.

**Workflow outcome:** **Complete (machine)** — orchestrator **`exit_code: 0`**; verification and close_out **allowed: true**.

**Grading outcome:** **Grade mean (registry compact):** 3.59 · A/A-/B+/A-/A/A-/B.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-18T17-50-31-335Z.json` **allowed: true** |
| **Process contract** | **pass** | Four-turn inventory; envelope blocking gaps **0** |
| **Adherence ledger** | **partial** | Reconcile grade **B**; `thin_ledger` warn (non-blocking) |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Verification | `…/gates/verification-2026-11-18T17-47-55-928Z.json` |
| Proof manifest | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../../tied-project/working/FACILITATOR-WF-03-1795023644-wf-agentstream-wf-03-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN; session **4.2.2** |
| 2 | `refine-plan` | Three-module seam locked; stack closed |
| 3 | `build-plan` | **1/1** GREEN; verification **allowed: true** |
| 4 | `close-out` | Envelope gaps **0**; commit **`c2cfaae`**; close_out **allowed: true** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1795023644-wf-agentstream-wf-03-cursor-grok47low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **661s** |

**Friction excerpts:**

- `DIAGNOSTIC: WF trial interleaved phase 1/4` … `4/4`
- `DIAGNOSTIC: WF trial slim tracker reconcile: valid slim shape`
- `DIAGNOSTIC: WF trial verification receipt assist: receipt already present (skip)`
- `DIAGNOSTIC: wf-trial process log manifest=…/wf-trial-orchestrator-run.v1.json`

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | Product **`c2cfaae`** after green wiring test |
| Slim tracker | Valid at turn 1 — contrasts [1794616912](trial-readout-PROMPT-WF-03-grok47low-1794616912-wf-agentstream-wf-03-cursor-grok47low.md) `invalid_slug` close_out |
| Binding proof | `composition.wiring` label on single test — satisfies minimum binding, thinner than multi-case peers |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **1** pass |
| Composition | **1** wiring test (`binding_test_present: true`) |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Producer, consumer, and wiring responsibilities locked before implementation. |
| Traceability closure | **A−** | Product commit and CITDP persist; thin adherence ledger warn only. |
| Test strategy | **B+** | One `composition.wiring` case proves the seam; depth below [grok47-med @ 1794188384](trial-readout-PROMPT-WF-03-grok47-med-1794188384-wf-agentstream-wf-03-cursor-grok47med.md). |
| Algorithm / implementation | **A−** | In-process wiring returns consumer result for producer payload. |
| Process adherence | **A** | Verification and close_out receipts **allowed** with envelope gaps **0**. |
| Workflow choreography | **A−** | Interleaved ~11m run; machine close_out pass vs prior split cell. |
| Methodology learning readout | **B** | Documents Grok WF-03 recovery on slim tracker — not ranked vs [1794616912](trial-readout-PROMPT-WF-03-grok47low-1794616912-wf-agentstream-wf-03-cursor-grok47low.md). |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-03)

Pairs [1794616912](trial-readout-PROMPT-WF-03-grok47low-1794616912-wf-agentstream-wf-03-cursor-grok47low.md) (same harness, prior split) and [1794617768](trial-readout-PROMPT-WF-03-claudesonnet55medium-1794617768-wf-agentstream-wf-03-claude-claudesonnet55medium.md) on the same prompt — **no ranking**.

---

## Cohort comparisons vs peer WF readouts

Adds registry row **03 / 1795023644** when facilitators run `@publish-wf-trial-summaries`; supersedes **cursor:grok47-low** WF-03 matrix anchor vs [1794616912](trial-readout-PROMPT-WF-03-grok47low-1794616912-wf-agentstream-wf-03-cursor-grok47low.md).

---

## TIED version / dogfood

Session capture **4.2.2** from `tied-methodology-version.session.v1.json` at add-feature — documents disposable bootstrap on current store methodology, not effectiveness of model or effort tier.

---

## Facilitator follow-ups

- Run `@publish-wf-trial-summaries` to insert master registry row and refresh **Latest** for **grok47-low** WF-03.

---

## Related links

- [Traditional workflow catalog](../catalogs/catalog-traditional-workflow-trial-prompts.md)
- [Runs registry](../registries/traditional-workflow-trial-runs-registry.md)
- [Facilitator evidence](../../../tied-project/working/FACILITATOR-WF-03-1795023644-wf-agentstream-wf-03-cursor-grok47low/evidence/)