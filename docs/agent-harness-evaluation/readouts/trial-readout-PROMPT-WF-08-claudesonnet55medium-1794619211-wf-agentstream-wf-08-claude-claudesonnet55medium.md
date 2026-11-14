# Trial readout: PROMPT-WF-08 → Claude Sonnet 5.5 (medium effort) → `1794619211-wf-agentstream-wf-08-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-08`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `claude-sonnet-5-5 (medium effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794619211-wf-agentstream-wf-08-claude-claudesonnet55medium` |
| **Factory tag** | `1794619211-wf-agentstream-wf-08-claude-claudesonnet55medium` |
| **Product REQ** | `REQ-ORDER_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-ORDER_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

---

## What was built

- **Product:** `REQ-ORDER_STATE_MACHINE`; facilitator **`npm test` 3/3** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **262s** (~4 min).
- **Git:** product pin **`81c37a3`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **3/3**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.63 · A/B+/A-/A/B+/A-/A-.

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
| 3 | `build-plan` | **3** green tests at facilitator replay |
| 4 | `close-out` | CITDP persist; **`81c37a3`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Illegal transition error documented. |
| Traceability closure | **A** | close_out allowed with `81c37a3`. |
| Test strategy | **B+** | Three cases—meets prompt minimum. |
| Algorithm / implementation | **A-** | State machine rejects illegal event once. |
| Process adherence | **A-** | close_out allowed on disposable client. |
| Workflow choreography | **A** | Batch capstone for Sonnet medium WF-01…08 wave. |
| Methodology learning readout | **A-** | Contrasts Haiku medium WF-08 failure cell. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-08)

Pairs [Haiku medium @ 1794605074](trial-readout-PROMPT-WF-08-claudehaiku55medium-1794605074-wf-agentstream-wf-08-claude-claudehaiku55medium.md) (**0** tests). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-08-1794619211-wf-agentstream-wf-08-claude-claudesonnet55medium/evidence/)
