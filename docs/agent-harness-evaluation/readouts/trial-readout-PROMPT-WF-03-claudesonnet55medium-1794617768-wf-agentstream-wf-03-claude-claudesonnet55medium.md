# Trial readout: PROMPT-WF-03 → Claude Sonnet 5.5 (medium effort) → `1794617768-wf-agentstream-wf-03-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-03`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `claude-sonnet-5-5 (medium effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794617768-wf-agentstream-wf-03-claude-claudesonnet55medium` |
| **Factory tag** | `1794617768-wf-agentstream-wf-03-claude-claudesonnet55medium` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

---

## What was built

- **Product:** `REQ-PRODUCER_CONSUMER_WIRING`; facilitator **`npm test` 8/8** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **279s** (~4 min).
- **Git:** product pin **`96e3442`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **8/8**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.87 · A/A/A-/A/A-/A/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | close_out **allowed** |
| **Process contract** | **partial** | Orchestrator manifest present |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN locks prompt stress |
| 3 | `build-plan` | **8** green tests at facilitator replay |
| 4 | `close-out` | CITDP persist; **`96e3442`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Module split and binding test before UI. |
| Traceability closure | **A** | close_out allowed; `96e3442` committed. |
| Test strategy | **A-** | Eight tests including wiring proof without GUI. |
| Algorithm / implementation | **A** | Producer/consumer wiring matches PLAN. |
| Process adherence | **A-** | Standard four-turn gate receipts. |
| Workflow choreography | **A** | Orchestrator exit_code 0. |
| Methodology learning readout | **A-** | Contrasts Grok WF-03 split on same prompt. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-03)

See [Grok split @ 1794616912](trial-readout-PROMPT-WF-03-grok47low-1794616912-wf-agentstream-wf-03-cursor-grok47low.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-03-1794617768-wf-agentstream-wf-03-claude-claudesonnet55medium/evidence/)
