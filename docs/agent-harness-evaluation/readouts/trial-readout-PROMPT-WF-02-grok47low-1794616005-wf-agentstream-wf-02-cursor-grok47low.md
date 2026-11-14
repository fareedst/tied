# Trial readout: PROMPT-WF-02 → Cursor Grok 4.7 (`low`) → `1794616005-wf-agentstream-wf-02-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-02`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794616005-wf-agentstream-wf-02-cursor-grok47low` |
| **Factory tag** | `1794616005-wf-agentstream-wf-02-cursor-grok47low` |
| **Product REQ** | `REQ-STDIN_DEDUP_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-STDIN_DEDUP_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

---

## What was built

- **Product:** `REQ-STDIN_DEDUP_CLI`; facilitator **`npm test` 5/5** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **904s** (~15 min).
- **Git:** product pin **`75973f0`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **5/5**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.77 · A/A/B+/A/A-/A/A-.

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
| 3 | `build-plan` | **5** green tests at facilitator replay |
| 4 | `close-out` | CITDP persist; **`75973f0`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | First-occurrence dedup policy documented in refine. |
| Traceability closure | **A** | close_out allowed with commit `75973f0`. |
| Test strategy | **B+** | Five cases; two orderings per prompt minimum. |
| Algorithm / implementation | **A** | CLI streams deduped lines per PLAN. |
| Process adherence | **A-** | Gates allowed; fifteen-minute wall. |
| Workflow choreography | **A** | Chained after WF-01 in same orchestrator wave. |
| Methodology learning readout | **A-** | Grok low WF-02 datapoint; no ranking vs Sonnet medium batch. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-02)

Contrast [Sonnet medium WF-02 @ 1794617445](trial-readout-PROMPT-WF-02-claudesonnet55medium-1794617445-wf-agentstream-wf-02-claude-claudesonnet55medium.md) (**15** tests). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-02-1794616005-wf-agentstream-wf-02-cursor-grok47low/evidence/)
