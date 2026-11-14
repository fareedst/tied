# Trial readout: PROMPT-WF-04 → Cursor Grok 4.7 (`low`) → `1794617515-wf-agentstream-wf-04-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-04`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794617515-wf-agentstream-wf-04-cursor-grok47low` |
| **Factory tag** | `1794617515-wf-agentstream-wf-04-cursor-grok47low` |
| **Product REQ** | `REQ-FIXTURE_COMMENT_ID_SCAN` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-FIXTURE_COMMENT_ID_SCAN/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

---

## What was built

- **Product:** `REQ-FIXTURE_COMMENT_ID_SCAN`; facilitator **`npm test` 1/1** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **700s** (~11 min).
- **Git:** product pin **`4b393ae`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **1/1**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.59 · A-/A/B-/A-/A-/A/B+.

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
| 3 | `build-plan` | **1** green tests at facilitator replay |
| 4 | `close-out` | CITDP persist; **`4b393ae`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A-** | Fixture-only scan scope honored. |
| Traceability closure | **A** | close_out allowed with `4b393ae`. |
| Test strategy | **B-** | Single automated case—prompt allows more fixture coverage. |
| Algorithm / implementation | **A-** | Scanner CLI uses committed fixture tree only. |
| Process adherence | **A-** | Gates pass despite minimal proof depth. |
| Workflow choreography | **A** | Interleaved with Sonnet medium WF-03/04 batch. |
| Methodology learning readout | **B+** | Thin test count vs Sonnet WF-04 peer. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-04)

Pairs [Sonnet medium @ 1794618058](trial-readout-PROMPT-WF-04-claudesonnet55medium-1794618058-wf-agentstream-wf-04-claude-claudesonnet55medium.md) (**10** tests). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-04-1794617515-wf-agentstream-wf-04-cursor-grok47low/evidence/)
