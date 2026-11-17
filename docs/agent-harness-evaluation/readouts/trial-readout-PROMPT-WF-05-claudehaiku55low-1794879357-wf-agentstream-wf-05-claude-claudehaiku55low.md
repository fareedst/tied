# Trial readout: PROMPT-WF-05 → Claude Haiku 5.5 (low effort) → `1794879357-wf-agentstream-wf-05-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-05`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `claude-haiku-5-5 (low effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `low` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794879357-wf-agentstream-wf-05-claude-claudehaiku55low` |
| **Factory tag** | `1794879357-wf-agentstream-wf-05-claude-claudehaiku55low` |
| **Product REQ** | `REQ-CSV_ROW_TO_OBJECT_MAPPER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** |
| **Cohort comparison** | First Haiku **`@low`** WF-05 complete cell on **4.2.2**; contrasts incomplete default-effort @ 1794053115. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

---

## What was built

- **Product:** `parseCsvToObjects` library; facilitator **21/21** tests.
- **Git:** **`4821cd8`** — `feat(csv): add CSV row to object mapper`.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator wall **329s** (~5 min).
- **Project size layers:** unit **23**; composition **0** (facilitator snapshot **2026-11-16**).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **21/21**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.84 · A/A/A/B+/A-/A-/A.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate **allowed**; envelope blocking gaps **0** |
| **Process contract** | **pass** | Tracker sync matches turn-4 handoff |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN; empty-row AC explicit |
| 2 | `refine-plan` | Locked stack + refine defaults |
| 3 | `build-plan` | RED → GREEN **21/21** |
| 4 | `close-out` | **`4821cd8`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Empty-file rules written before implementation. |
| Traceability closure | **A** | Traceable commit after close_out **allowed: true**. |
| Test strategy | **A** | Twenty-one cases cover header-only and edge CSV rows. |
| Algorithm / implementation | **B+** | Mapper behavior matches PLAN at facilitator replay. |
| Process adherence | **A−** | Machine close_out pass on minimal depth advisory policy. |
| Workflow choreography | **A−** | Four turns; five-minute wall on Haiku **low**. |
| Methodology learning readout | **A** | Completes Haiku low WF-05 after legacy incomplete default-effort cell. |

**Feedback ingest:** N/A. **Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-05)

Pairs [Haiku default incomplete @ 1794053115](trial-readout-PROMPT-WF-05-claudehaiku55-1794053115-wf-agentstream-wf-05-claude-claudehaiku55.md) and [Haiku high complete @ 1794870183](trial-readout-PROMPT-WF-05-claudehaiku55high-1794870183-wf-agentstream-wf-05-claude-claudehaiku55high.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-05-1794879357-wf-agentstream-wf-05-claude-claudehaiku55low/evidence/)