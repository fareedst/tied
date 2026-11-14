# Trial readout: PROMPT-WF-08 → Claude Haiku 5.5 (medium effort) → `1794605074-wf-agentstream-wf-08-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-08`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `claude-haiku-5-5 (medium effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794605074-wf-agentstream-wf-08-claude-claudehaiku55medium` |
| **Factory tag** | `1794605074-wf-agentstream-wf-08-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-TINY_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-TINY_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **4.2.2** Haiku **medium** WF-08 batch with Opus **low** WF-08 readouts on disk (no ranking). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

---

## What was built

- **Product:** `REQ-TINY_STATE_MACHINE` on disposable client; facilitator **`npm test` 0/0**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **227s** (~4 min).
- **Git:** product pin **`8e0122e`** (subject client; not store).

---

## Outcome record

**Implementation outcome:** **Incomplete** — no automated tests.

**Workflow outcome:** **Split signal** — orchestrator `exit_code: 0`; **0** tests; empty `src/`; close_out **not_run**.

**Grading outcome:** **Grade mean (registry compact):** 1.14 · C/F/F/F/C+/D/B-.

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
| 2 | `refine-plan` | PLAN/CITDP for `REQ-TINY_STATE_MACHINE` |
| 3 | `build-plan` | Product tests **0** green at facilitator replay when present |
| 4 | `close-out` | **not_run** or blocked |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **227s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **C** | PLAN exists but three-state machine never landed in src. |
| Traceability closure | **F** | No product tests; close_out gate absent. |
| Test strategy | **F** | Facilitator npm test reports zero cases. |
| Algorithm / implementation | **F** | No state machine implementation under src/. |
| Process adherence | **C+** | Orchestrator exited zero despite empty product tree. |
| Workflow choreography | **D** | Four-turn shell only; build-plan delivered no green tests. |
| Methodology learning readout | **B-** | Documents Haiku medium miss on WF-08; not a leaderboard row. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-08)

Compare with Opus **low** readout on the same prompt when present (`179458*` / `179459*` batch). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-08-1794605074-wf-agentstream-wf-08-claude-claudehaiku55medium/evidence/)
