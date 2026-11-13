# Trial readout: PROMPT-WF-03 → Claude Opus 5.5 (low effort) → `1794588694-wf-agentstream-wf-03-claude-claudeopus55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-03`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `claude-opus-5-5` (`low` effort) |
| **Model slug** | `claude-opus-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794588694-wf-agentstream-wf-03-claude-claudeopus55low` |
| **Factory tag** | `1794588694-wf-agentstream-wf-03-claude-claudeopus55low` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **4.2.2** Opus **low** WF-03; producer/consumer/wiring modules with wiring tests. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

**Catalog stress:** module binding (TIED-DEMO-02). **Proof boundary:** wiring test without UI.

---

## What was built

- **Product:** `producer`, `consumer`, `wiring` modules + `wiring.test.ts`; facilitator **`npm test` 12/12** pass.
- **TIED:** `REQ-PRODUCER_CONSUMER_WIRING`; close_out **allowed**; envelope **0** blocking.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **328s** (~5.5 min).
- **Git:** product pin **`ac8a871`**.
- **Project size layers:** unit **12**; **composition_inferred_cases: 4** on `wiring.test.ts` ([facilitator snapshot](../../tied-project/working/FACILITATOR-WF-03-1794588694-wf-agentstream-wf-03-claude-claudeopus55low/evidence/project-size-snapshot.v1.json)).

---

## Outcome record

**Implementation outcome:** **Complete** — twelve green tests; wiring module proven in-process.

**Workflow outcome:** **Complete (machine)** — `close_out` **allowed**; **`ac8a871`** committed.

**Grading outcome:** **Grade mean (registry compact):** 3.90 · A/A/B+/A/B+/A/A−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-13T16-56-30-097Z.json` **allowed: true** |
| **Process contract** | **partial** | `legacy_no_adherence_chain` advisory on reconcile script (non-blocking) |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; **4.2.2** |
| 2 | `refine-plan` | Three-module boundary + wiring AC |
| 3 | `build-plan` | Unit + wiring tests **12** green |
| 4 | `close-out` | CITDP; **`ac8a871`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **328s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Producer/consumer/wiring split locked before RED. |
| Traceability closure | **A** | R+A+I + CITDP; traceable **`ac8a871`**. |
| Test strategy | **B+** | Wiring coverage via `wiring.test.ts`; no separate composition-tier file label. |
| Algorithm / implementation | **A** | Modules connected without CLI business logic. |
| Process adherence | **B+** | close_out allowed; reconcile reported legacy adherence advisory. |
| Workflow choreography | **A** | Orchestrator **`exit_code: 0`**; full four-turn close-out. |
| Methodology learning readout | **A−** | Opus low WF-03 **4.2.2** complete; pairs [Sonnet 1794102131](trial-readout-PROMPT-WF-03-claudesonnet55-1794102131-wf-agentstream-wf-03-claude-sonnet55.md) without ranking. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-03)

Pairs with [1794102131](trial-readout-PROMPT-WF-03-claudesonnet55-1794102131-wf-agentstream-wf-03-claude-sonnet55.md) (Sonnet **9** tests, complete). **No ranking.**

---

## Harness-eval utilization (HMEP)

**Import run:** 2026-11-13 — stream-json (four turns). Evidence: [harness-eval-import.md](../../tied-project/working/FACILITATOR-WF-03-1794588694-wf-agentstream-wf-03-claude-claudeopus55low/evidence/harness-eval-import.md).

| Metric | Value |
| --- | --- |
| `wall_clock_ms` | 328000 |
| `input_tokens` | 64 |
| `output_tokens` | 16356 |
| `reasoning_tokens` | 645 |
| `completeness` | complete |
| `harness_estimated_cost` | null (list-price gap for Opus 5.5) |

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-03-1794588694-wf-agentstream-wf-03-claude-claudeopus55low/evidence/)
