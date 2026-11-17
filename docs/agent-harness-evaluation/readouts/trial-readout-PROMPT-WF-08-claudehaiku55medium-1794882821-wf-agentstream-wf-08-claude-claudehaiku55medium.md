# Trial readout: PROMPT-WF-08 → Claude Haiku 5.5 (medium effort) → `1794882821-wf-agentstream-wf-08-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-08`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `claude-haiku-5-5 (medium effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794882821-wf-agentstream-wf-08-claude-claudehaiku55medium` |
| **Factory tag** | `1794882821-wf-agentstream-wf-08-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-TINY_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** |
| **Cohort comparison** | Haiku **`@medium`** WF-08 **repeat**; supersedes split @ 1794605074 (**0** tests). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

---

## What was built

- **Product:** Three-state machine library; facilitator **6/6** tests.
- **Git:** **`29b348a`** — `feat(state-machine): add three-state machine`.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator wall **548s** (~9 min).
- **Project size layers:** unit **6**; R+A+I indexes present post-commit.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **6/6**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**. Process contract **partial** (`sub-close-out-evidence-sync` not run).

**Grading outcome:** **Grade mean (registry compact):** 3.71 · A/A/B+/A/B+/A-/A.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate **allowed**; envelope blocking gaps **0** |
| **Process contract** | **partial** | Verification manifest on disk; sync step skipped |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN scaffold |
| 2 | `refine-plan` | Illegal-transition error contract |
| 3 | `build-plan` | RED → GREEN **6/6** |
| 4 | `close-out` | **`29b348a`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Three states/two events locked before RED. |
| Traceability closure | **A** | Product commit after machine close_out pass. |
| Test strategy | **B+** | Six cases cover legal and illegal transitions. |
| Algorithm / implementation | **A** | State machine matches documented illegal-event rule. |
| Process adherence | **B+** | close_out allowed; partial process sync per handoff. |
| Workflow choreography | **A−** | Four turns; nine-minute wall on Haiku **medium**. |
| Methodology learning readout | **A** | Converts prior Haiku medium WF-08 empty-src split cell. |

**Feedback ingest:** N/A. **Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-08)

Pairs [Haiku medium split @ 1794605074](trial-readout-PROMPT-WF-08-claudehaiku55medium-1794605074-wf-agentstream-wf-08-claude-claudehaiku55medium.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-08-1794882821-wf-agentstream-wf-08-claude-claudehaiku55medium/evidence/)