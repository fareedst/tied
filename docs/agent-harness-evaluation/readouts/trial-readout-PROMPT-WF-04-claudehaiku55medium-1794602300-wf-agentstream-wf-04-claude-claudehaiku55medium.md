# Trial readout: PROMPT-WF-04 → Claude Haiku 5.5 (medium effort) → `1794602300-wf-agentstream-wf-04-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-04`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `claude-haiku-5-5 (medium effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794602300-wf-agentstream-wf-04-claude-claudehaiku55medium` |
| **Factory tag** | `1794602300-wf-agentstream-wf-04-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-REQ_MARKER_ORPHAN_SCAN` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-REQ_MARKER_ORPHAN_SCAN/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **4.2.2** Haiku **medium** WF-04 batch with Opus **low** WF-04 readouts on disk (no ranking). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

---

## What was built

- **Product:** `REQ-REQ_MARKER_ORPHAN_SCAN` on disposable client; facilitator **`npm test` 17/17**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **539s** (~9 min).
- **Git:** product pin **`280aeeb`** (subject client; not store).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **17/17**.

**Workflow outcome:** **Complete (machine)** — orchestrator `exit_code: 0`; **`280aeeb`**; **17/17** tests; close_out **allowed**.

**Grading outcome:** **Grade mean (registry compact):** 3.83 · A/A/A/A-/A-/A/A-.

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
| 2 | `refine-plan` | PLAN/CITDP for `REQ-REQ_MARKER_ORPHAN_SCAN` |
| 3 | `build-plan` | Product tests **17** green at facilitator replay when present |
| 4 | `close-out` | **allowed**; **`280aeeb`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **539s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Fixture-only scan boundary explicit before implementation. |
| Traceability closure | **A** | close_out allowed after traceable product commit. |
| Test strategy | **A** | Seventeen fixture-scoped cases; no live index leakage. |
| Algorithm / implementation | **A-** | Orphan/match reporting aligned to PROMPT-WF-04. |
| Process adherence | **A-** | Machine close_out pass; adversarial depth minimal. |
| Workflow choreography | **A** | exit_code 0; four-turn orchestrator batch. |
| Methodology learning readout | **A-** | Haiku medium pairs Opus WF-04 readout without leaderboard. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-04)

Compare with Opus **low** readout on the same prompt when present (`179458*` / `179459*` batch). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-04-1794602300-wf-agentstream-wf-04-claude-claudehaiku55medium/evidence/)
