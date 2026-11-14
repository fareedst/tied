# Trial readout: PROMPT-WF-02 → Claude Sonnet 5.5 (medium effort) → `1794617445-wf-agentstream-wf-02-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-02`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `claude-sonnet-5-5 (medium effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794617445-wf-agentstream-wf-02-claude-claudesonnet55medium` |
| **Factory tag** | `1794617445-wf-agentstream-wf-02-claude-claudesonnet55medium` |
| **Product REQ** | `REQ-DEDUP_STREAM_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-DEDUP_STREAM_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

---

## What was built

- **Product:** `REQ-DEDUP_STREAM_CLI`; facilitator **`npm test` 15/15** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **283s** (~4 min).
- **Git:** product pin **`916a95a`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **15/15**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.91 · A/A/A/A-/A-/A/A-.

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
| 3 | `build-plan` | **15** green tests at facilitator replay |
| 4 | `close-out` | CITDP persist; **`916a95a`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Dedup policy and non-goals documented. |
| Traceability closure | **A** | close_out allowed with `916a95a`. |
| Test strategy | **A** | Fifteen cases including multiple input orderings. |
| Algorithm / implementation | **A-** | CLI binding tested without UI. |
| Process adherence | **A-** | Machine close_out with thin adversarial depth. |
| Workflow choreography | **A** | Sub-five-minute orchestrator wall. |
| Methodology learning readout | **A-** | Dense test depth vs Grok WF-02 on same prompt. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-02)

Contrast [Grok low @ 1794616005](trial-readout-PROMPT-WF-02-grok47low-1794616005-wf-agentstream-wf-02-cursor-grok47low.md) (**5** tests). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-02-1794617445-wf-agentstream-wf-02-claude-claudesonnet55medium/evidence/)
