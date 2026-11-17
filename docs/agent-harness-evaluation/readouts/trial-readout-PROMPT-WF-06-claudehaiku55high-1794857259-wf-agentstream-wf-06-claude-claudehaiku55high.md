# Trial readout: PROMPT-WF-06 → Claude Haiku 5.5 (high effort) → `1794857259-wf-agentstream-wf-06-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | Four-phase workflow + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `claude-haiku-5-5 (high effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794857259-wf-agentstream-wf-06-claude-claudehaiku55high` |
| **Product REQ** | `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| **TIED methodology version (session)** | **4.2.2** |

---

## Sponsor intent (verbatim)

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

---

## What was built

- **Product:** Token-bucket library; **20/20** tests; commit **`eeab0ab`**.
- **Stack:** orchestrator **`exit_code: 0`**; wall **976s** (~16 min).

---

## Outcome record

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; partial process/adherence on client.

**Grading outcome:** **Grade mean (registry compact):** 3.61 · A/B+/B+/A/B+/A-/A-.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Exceed-limit behavior documented. |
| Traceability closure | **B+** | Traceable commit after allowed close_out. |
| Test strategy | **B+** | Twenty unit tests; no network. |
| Algorithm / implementation | **A** | Token bucket matches minimal scope. |
| Process adherence | **B+** | Machine pass; reconcile hash stale notes. |
| Workflow choreography | **A−** | Sixteen-minute wall on Haiku high. |
| Methodology learning readout | **A−** | Fills Haiku **`@high`** WF-06 column. |

**Feedback ingest:** N/A. **Future-test rule:** One trial does not prove methodology effectiveness.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-06-1794857259-wf-agentstream-wf-06-claude-claudehaiku55high/evidence/)