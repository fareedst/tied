# Trial readout: PROMPT-WF-02 → Claude Haiku 5.5 (low effort) → `1794601194-wf-agentstream-wf-02-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-02`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `claude-haiku-5-5 (low effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794601194-wf-agentstream-wf-02-claude-claudehaiku55low` |
| **Factory tag** | `1794601194-wf-agentstream-wf-02-claude-claudehaiku55low` |
| **Product REQ** | `REQ-DEDUP_LINES_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-DEDUP_LINES_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **4.2.2** Haiku **low** WF-02 batch with Opus **low** WF-02 readouts on disk (no ranking). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

---

## What was built

- **Product:** `REQ-DEDUP_LINES_CLI` on disposable client; facilitator **`npm test` 14/14**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **353s** (~6 min).
- **Git:** product pin **`e44e18f`** (subject client; not store).

---

## Outcome record

**Implementation outcome:** **Split** — facilitator replay **14/14**.

**Workflow outcome:** **Split signal** — orchestrator `exit_code: 0`; **14/14** tests; **`e44e18f`**; close_out **not_run**.

**Grading outcome:** **Grade mean (registry compact):** 3.67 · A-/B+/A/A-/B+/A-/B.

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
| 2 | `refine-plan` | PLAN/CITDP for `REQ-DEDUP_LINES_CLI` |
| 3 | `build-plan` | Product tests **14** green at facilitator replay when present |
| 4 | `close-out` | **not_run** or blocked |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **353s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A-** | Duplicate-line policy documented in PLAN before CLI implementation. |
| Traceability closure | **B+** | REQ on disk but no machine close_out gate on client. |
| Test strategy | **A** | Two input orderings covered in fourteen passing node tests. |
| Algorithm / implementation | **A-** | Dedup CLI matches documented first-seen policy under facilitator replay. |
| Process adherence | **B+** | Four-turn orchestrator exit zero; close-out step absent. |
| Workflow choreography | **A-** | Batch completed with exit_code 0; machine close_out missing. |
| Methodology learning readout | **B** | Haiku low WF-02 on 4.2.2; pairs Opus low readout without ranking. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-02)

Compare with Opus **low** readout on the same prompt when present (`179458*` / `179459*` batch). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-02-1794601194-wf-agentstream-wf-02-claude-claudehaiku55low/evidence/)
