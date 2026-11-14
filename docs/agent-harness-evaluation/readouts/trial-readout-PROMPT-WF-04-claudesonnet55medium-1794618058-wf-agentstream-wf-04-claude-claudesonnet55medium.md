# Trial readout: PROMPT-WF-04 → Claude Sonnet 5.5 (medium effort) → `1794618058-wf-agentstream-wf-04-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-04`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `claude-sonnet-5-5 (medium effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794618058-wf-agentstream-wf-04-claude-claudesonnet55medium` |
| **Factory tag** | `1794618058-wf-agentstream-wf-04-claude-claudesonnet55medium` |
| **Product REQ** | `REQ-REQ_MARKER_ORPHAN_SCAN` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-REQ_MARKER_ORPHAN_SCAN/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

---

## What was built

- **Product:** `REQ-REQ_MARKER_ORPHAN_SCAN`; facilitator **`npm test` 10/10** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **273s** (~4 min).
- **Git:** product pin **`f2b94db`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **10/10**.

**Workflow outcome:** **Incomplete (split signal)** — close_out **not_run**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.44 · A/A-/B+/A/B+/B/B+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **missing** | close_out **not_run** |
| **Process contract** | **partial** | Orchestrator manifest present |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN locks prompt stress |
| 3 | `build-plan` | **10** green tests at facilitator replay |
| 4 | `close-out` | **10** green tests; close-out gate absent |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Fixture index compare scope locked in PLAN. |
| Traceability closure | **A-** | Product commit `f2b94db`; no close_out receipt on disk. |
| Test strategy | **B+** | Ten fixture-scoped cases green at facilitator replay. |
| Algorithm / implementation | **A** | Scanner reports orphans and matches. |
| Process adherence | **B+** | Orchestrator exit_code 0; machine close-out **not_run**. |
| Workflow choreography | **B** | Four-turn batch; orchestrator evidence uncommitted. |
| Methodology learning readout | **B+** | Sonnet medium WF-04 split vs Grok complete thin cell. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-04)

Pairs [Grok WF-04 @ 1794617515](trial-readout-PROMPT-WF-04-grok47low-1794617515-wf-agentstream-wf-04-cursor-grok47low.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-04-1794618058-wf-agentstream-wf-04-claude-claudesonnet55medium/evidence/)
