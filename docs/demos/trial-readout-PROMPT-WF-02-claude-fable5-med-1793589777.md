# Trial readout: PROMPT-WF-02 → Claude Fable 5 Med → `1793589777-wf-02-claude-fable5-med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-02 |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793589777-wf-02-claude-fable5-med` |
| **Product REQ** | `REQ-DEDUP_CLI` |
| **Cohort comparison** | [WF-02 nine-model comparison](wf-02-nine-model-implementation-comparison.md) |

---

## What was built

Node **`bin/dedup.js`** + pure **`src/dedup.js`**. README documents **first-occurrence-wins** with streaming rationale (why not last-wins). Twelve `node --test` cases (unit + CLI spawn). REQ **Implemented**; eight gate JSON files.

**Behavior:** Matrix **Fa** — CRLF collapsed (row 5).

---

## Verification (2026-11-02)

`npm test` — **12/12** pass.

---

## Session grading

| Dimension | Band |
| --- | --- |
| Requirement interpretation | **A** |
| Traceability closure | **A** |
| Test strategy | **A−** |
| Algorithm / implementation | **A** |
| Process adherence | **A−** |
| Workflow choreography | **B+** — no inventory |
| Methodology learning readout | **N/A** |

**Feedback ingest:** N/A. **Future-test rule:** applies.
