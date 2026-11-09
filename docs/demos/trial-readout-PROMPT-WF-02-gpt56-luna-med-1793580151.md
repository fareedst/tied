# Trial readout: PROMPT-WF-02 → GPT-5.6 Luna Med → `1793580151-wf-02-gpt56-luna-med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-02 |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793580151-wf-02-gpt56-luna-med` |
| **Product REQ** | `REQ-DEDUP_STREAM_CLI` |
| **Cohort comparison** | [WF-02 nine-model comparison](wf-02-nine-model-implementation-comparison.md) |

---

## What was built

Python **`dedup_stream.py`** — **first-occurrence** policy in README with LF-normalized output. Five unittest cases including two orderings. Product **uncommitted** on TIED baseline; no interaction inventory.

**Behavior:** Matrix **Lu** — CRLF/LF collapsed (row 5).

---

## Verification (2026-11-02)

`python3 -m unittest discover -s tests` — **5/5** OK.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | clear README; first-only only |
| Traceability closure | **B** | REQ Planned; WT product |
| Test strategy | **B+** | meets two-ordering minimum |
| Algorithm / implementation | **A−** | Shipped behavior matches PROMPT shape; gaps leave some fault paths lightly exercised. |
| Process adherence | **C+** | no gates on disk |
| Workflow choreography | **C** | WT-only product |
| Methodology learning readout | **N/A** | Future-test rule stated; session evidence supports operator reproducibility only. |

**Feedback ingest:** N/A. **Future-test rule:** applies.
