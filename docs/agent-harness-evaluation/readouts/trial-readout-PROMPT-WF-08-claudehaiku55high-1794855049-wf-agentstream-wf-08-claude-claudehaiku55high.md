# Trial readout: PROMPT-WF-08 → Claude Haiku 5.5 (high effort) → `1794855049-wf-agentstream-wf-08-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `claude-haiku-5-5 (high effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794855049-wf-agentstream-wf-08-claude-claudehaiku55high` |
| **Product REQ** | `REQ-THREE_STATE_TWO_EVENT_MACHINE` |
| **TIED methodology version (session)** | **4.2.2** |

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

---

## What was built

- **Product:** Three-state machine + `IllegalTransitionError`; **7/7** tests; **`fdf0b65`**.
- **Stack:** orchestrator **`exit_code: 0`**; wall **675s** (~11 min).

---

## Outcome record

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; process contract **partial** on client.

**Grading outcome:** **Grade mean (registry compact):** 3.61 · A/A-/B+/A/B+/A-/A-.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Illegal transition error documented in refine. |
| Traceability closure | **A−** | Commit present; partial tracker sync noted on client. |
| Test strategy | **B+** | Seven tests meet prompt minimum plus table guards. |
| Algorithm / implementation | **A** | Transition table rejects illegal events. |
| Process adherence | **B+** | Machine close_out allowed with partial contract. |
| Workflow choreography | **A−** | Eleven-minute Haiku high cell. |
| Methodology learning readout | **A−** | Pairs Sonnet high 24-test cell @ 1794797980. |

**Feedback ingest:** N/A. **Future-test rule:** One trial does not prove methodology effectiveness.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-08-1794855049-wf-agentstream-wf-08-claude-claudehaiku55high/evidence/)