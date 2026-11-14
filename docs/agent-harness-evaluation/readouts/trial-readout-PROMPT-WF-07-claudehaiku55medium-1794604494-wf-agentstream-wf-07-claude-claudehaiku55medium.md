# Trial readout: PROMPT-WF-07 → Claude Haiku 5.5 (medium effort) → `1794604494-wf-agentstream-wf-07-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-07`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-07](catalog-traditional-workflow-trial-prompts.md#prompt-wf-07) |
| **Model config** | `claude-haiku-5-5 (medium effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794604494-wf-agentstream-wf-07-claude-claudehaiku55medium` |
| **Factory tag** | `1794604494-wf-agentstream-wf-07-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-LAYERED_CONFIG_LOADER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-LAYERED_CONFIG_LOADER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **4.2.2** Haiku **medium** WF-07 batch with Opus **low** WF-07 readouts on disk (no ranking). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that loads configuration from a defaults object and an override object. The sponsor has not decided whether an explicit null in the override clears a key or is treated as missing—resolve that in planning before coding. Include tests for override precedence and your null/missing rule.
```

---

## What was built

- **Product:** `REQ-LAYERED_CONFIG_LOADER` on disposable client; facilitator **`npm test` 14/14**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **537s** (~9 min).
- **Git:** product pin **`6225f0a`** (subject client; not store).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **14/14**.

**Workflow outcome:** **Complete (machine)** — orchestrator `exit_code: 0`; **`6225f0a`**; **14/14** tests; close_out **allowed**.

**Grading outcome:** **Grade mean (registry compact):** 3.81 · A/A-/A/A/A-/A/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | close_out allowed on client |
| **Process contract** | **partial** | Orchestrator manifest + four-turn inventory |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN/CITDP for `REQ-LAYERED_CONFIG_LOADER` |
| 3 | `build-plan` | Product tests **14** green at facilitator replay when present |
| 4 | `close-out` | **allowed**; **`6225f0a`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **537s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Null-vs-missing override rule resolved in refine-plan. |
| Traceability closure | **A** | close_out allowed; REQ stack consistent at replay. |
| Test strategy | **A-** | Fourteen precedence cases; null rule covered. |
| Algorithm / implementation | **A** | Layered merge honors documented override semantics. |
| Process adherence | **A-** | Machine close_out pass at minimal depth tier. |
| Workflow choreography | **A** | Orchestrator exit_code 0 end to end. |
| Methodology learning readout | **A-** | Haiku medium WF-07 pairs Opus low without ranking. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-07)

Compare with Opus **low** readout on the same prompt when present (`179458*` / `179459*` batch). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-07-1794604494-wf-agentstream-wf-07-claude-claudehaiku55medium/evidence/)
