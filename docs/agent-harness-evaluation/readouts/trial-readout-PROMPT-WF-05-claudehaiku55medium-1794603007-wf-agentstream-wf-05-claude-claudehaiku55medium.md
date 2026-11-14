# Trial readout: PROMPT-WF-05 → Claude Haiku 5.5 (medium effort) → `1794603007-wf-agentstream-wf-05-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-05`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `claude-haiku-5-5 (medium effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794603007-wf-agentstream-wf-05-claude-claudehaiku55medium` |
| **Factory tag** | `1794603007-wf-agentstream-wf-05-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-CSV_OBJECT_MAPPER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-CSV_OBJECT_MAPPER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **4.2.2** Haiku **medium** WF-05 batch with Opus **low** WF-05 readouts on disk (no ranking). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

---

## What was built

- **Product:** `REQ-CSV_OBJECT_MAPPER` on disposable client; facilitator **`npm test` 26/26**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **489s** (~8 min).
- **Git:** product pin **`81ed1b3`** (subject client; not store).

---

## Outcome record

**Implementation outcome:** **Split** — facilitator replay **26/26**.

**Workflow outcome:** **Split signal** — orchestrator `exit_code: 0`; **26/26** tests **uncommitted**; close_out **not_run**.

**Grading outcome:** **Grade mean (registry compact):** 3.24 · A-/B+/A/A-/C+/A-/B.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | No close_out gate artifact |
| **Process contract** | **partial** | Orchestrator manifest + four-turn inventory |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN/CITDP for `REQ-CSV_OBJECT_MAPPER` |
| 3 | `build-plan` | Product tests **26** green at facilitator replay when present |
| 4 | `close-out` | **not_run** or blocked |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **489s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A-** | Empty-file behavior stated in AC before coding. |
| Traceability closure | **B+** | TIED YAML drift on disk; no close_out gate artifact. |
| Test strategy | **A** | Twenty-six cases cover header-only and data rows. |
| Algorithm / implementation | **A-** | Mapper behavior matches documented empty-file rule. |
| Process adherence | **C+** | Product tree largely untracked at facilitator replay. |
| Workflow choreography | **A-** | Orchestrator exit zero; close-out never recorded. |
| Methodology learning readout | **B** | Haiku medium WF-05 contrasts Opus complete cell without ranking. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-05)

Compare with Opus **low** readout on the same prompt when present (`179458*` / `179459*` batch). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-05-1794603007-wf-agentstream-wf-05-claude-claudehaiku55medium/evidence/)
