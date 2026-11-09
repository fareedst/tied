# Trial readout: PROMPT-WF-02 → Grok 4.7 Med → `1793574114-wf-02-grok47-med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-02 |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793574114-wf-02-grok47-med` |
| **Product REQ** | `REQ-LINE_DEDUPE` |
| **Cohort comparison** | [WF-02 nine-model comparison](wf-02-nine-model-implementation-comparison.md) |

---

## What was built

Native TypeScript **`line-dedupe`** with **first-seen default** and **`--keep last`**, exit codes 0/1/2 documented in CITDP. Twenty-one colocated tests. Strong **interaction inventory** and CITDP; product **`src/`** and **`package.json`** **uncommitted** at inspect (`HEAD` TIED baseline).

**Behavior:** Matrix **Gr** — matches Ge/Op/Wn on keep-last rows 6–7.

---

## Verification (2026-11-02)

`npm test` — **21/21** pass on working tree.

---

## Workflow choreography (observed)

| Sub-check | Signal |
| --- | --- |
| Phase boundary | **Weak git closure** — no feature commit |
| Skill hygiene | **Pass** — interaction inventory |
| Close-out honesty | REQ **Planned** despite runnable product |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator scope and invalid-input rule were locked in PLAN before implementation. |
| Traceability closure | **B+** | YAML/plan strong; git gap |
| Test strategy | **A** | depth + both policies |
| Algorithm / implementation | **A** | Implementation matches locked PLAN behavior with honest scope limits documented. |
| Process adherence | **B+** | Tracker and handoffs present; adherence ledger or envelope thinner than strict depth. |
| Workflow choreography | **C+** | inventory yes; commit no |
| Methodology learning readout | **N/A** | Future-test rule stated; session evidence supports operator reproducibility only. |

**Feedback ingest:** N/A. **Future-test rule:** applies.
