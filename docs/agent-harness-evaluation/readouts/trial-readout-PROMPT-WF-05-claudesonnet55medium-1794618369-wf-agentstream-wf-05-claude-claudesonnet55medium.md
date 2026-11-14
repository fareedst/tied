# Trial readout: PROMPT-WF-05 → Claude Sonnet 5.5 (medium effort) → `1794618369-wf-agentstream-wf-05-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-05`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `claude-sonnet-5-5 (medium effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794618369-wf-agentstream-wf-05-claude-claudesonnet55medium` |
| **Factory tag** | `1794618369-wf-agentstream-wf-05-claude-claudesonnet55medium` |
| **Product REQ** | `REQ-CSV_ROW_MAPPER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-CSV_ROW_MAPPER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

---

## What was built

- **Product:** `REQ-CSV_ROW_MAPPER`; facilitator **`npm test` 11/11** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **305s** (~5 min).
- **Git:** product pin **`aa3ecd7`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **11/11**.

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
| 3 | `build-plan` | **11** green tests at facilitator replay |
| 4 | `close-out` | CITDP persist; **`aa3ecd7`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Empty-file AC written before build. |
| Traceability closure | **A** | close_out allowed with `aa3ecd7`. |
| Test strategy | **A-** | Eleven CSV cases including header-only path. |
| Algorithm / implementation | **A** | Mapper matches documented zero-row rule. |
| Process adherence | **A-** | Verification gate present on disposable client. |
| Workflow choreography | **A** | Five-minute wall. |
| Methodology learning readout | **A-** | Sonnet medium WF-05 on **4.2.2** batch. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-05)

Compare Haiku medium split [@ 1794603007](trial-readout-PROMPT-WF-05-claudehaiku55medium-1794603007-wf-agentstream-wf-05-claude-claudehaiku55medium.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-05-1794618369-wf-agentstream-wf-05-claude-claudesonnet55medium/evidence/)
