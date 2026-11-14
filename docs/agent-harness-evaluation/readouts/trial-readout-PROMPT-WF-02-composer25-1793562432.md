# Trial readout: PROMPT-WF-02 → Composer 2.5 → `1793562432-wf-02-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-02 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `composer-2.5` |
| **Client root** | `/Users/fareed/Documents/dev/test/1793562432-wf-02-composer25` |
| **Product REQ** | `REQ-STDIN_DEDUP_CLI` |
| **Cohort comparison** | [WF-02 nine-model comparison](wf-02-nine-model-implementation-comparison.md) |

Store documentation only; not a catalog `[REQ-*]` token.

---

## What was built

TypeScript **`line-dedup`** CLI with modular `src/` (`dedupe-lines`, `read-stdin-lines`, `run-cli`). **First-occurrence-wins** policy and non-guarantees in README. Seven Vitest tests (unit + CLI). Feature commits present; REQ YAML **Draft** after verify chore.

**Behavior (default):** See consolidated [matrix rows 1–5](wf-02-nine-model-implementation-comparison.md#same-input-behavior-matrix) column **Co**.

---

## Verification (2026-11-02)

`npm test` — **7/7** pass. Evidence: [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-02-matrix/evidence/build-plan-verification-evidence.md).

---

## Workflow choreography (observed)

| Sub-check | Signal |
| --- | --- |
| Phase boundary | Product committed (`b7162f4` feat) |
| Skill hygiene | No `trial-workflow-interaction-inventory.v1.json` |
| Gate discipline | Six gate JSON under bundle working |
| Close-out honesty | REQ **Draft** vs green tests |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | First-only policy + non-guarantees documented before ship |
| Traceability closure | **A−** | R+A+I in code; REQ status lag |
| Test strategy | **A−** | Two orderings + CLI composition; modest count |
| Algorithm / implementation | **A** | Clear streaming first-win |
| Process adherence | **B+** | Gates present; no interaction inventory |
| Workflow choreography | **B+** | Committed feature; inventory gap |
| Methodology learning readout | **N/A** | Not requested |

**Feedback ingest:** N/A (`--skip-feedback-ingest`).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline and pairing disposition.
