# Trial readout: PROMPT-WF-02 → GPT-5.6 Sol Med → `1793587208-wf-02-gpt56-sol-med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-02 |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793587208-wf-02-gpt56-sol-med` |
| **Product REQ** | `REQ-STREAM_LINE_DEDUPLICATION` |
| **Cohort comparison** | [WF-02 nine-model comparison](wf-02-nine-model-implementation-comparison.md) |

---

## What was built

Python **`dedup.py`** with **opaque-byte** duplicate keys, **first-seen** order, streaming flush semantics documented in README (explicit rejection of last-wins). Eleven unittest cases. Feature commit `f481059`.

**Behavior:** Matrix **So** — distinct CRLF/LF (row 5).

---

## Verification (2026-11-02)

`python3 -m unittest discover -s tests` — **11/11** OK.

---

## Session grading

| Dimension | Band |
| --- | --- |
| Requirement interpretation | **A** — policy + non-goals in README |
| Traceability closure | **B+** |
| Test strategy | **A−** |
| Algorithm / implementation | **A** — honest byte contract |
| Process adherence | **B+** |
| Workflow choreography | **B+** |
| Methodology learning readout | **N/A** |

**Feedback ingest:** N/A. **Future-test rule:** applies.
