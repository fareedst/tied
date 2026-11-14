# Trial readout: PROMPT-WF-03 → Cursor Grok 4.7 (`low`) → `1794616912-wf-agentstream-wf-03-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-03`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794616912-wf-agentstream-wf-03-cursor-grok47low` |
| **Factory tag** | `1794616912-wf-agentstream-wf-03-cursor-grok47low` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

---

## What was built

- **Product:** `REQ-PRODUCER_CONSUMER_WIRING`; facilitator **`npm test` 1/1** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **602s** (~10 min).
- **Git:** bootstrap-only **`cfcc11e`**; product uncommitted.

---

## Outcome record

**Implementation outcome:** **Partial** — facilitator replay **1/1**.

**Workflow outcome:** **Incomplete (split signal)** — close_out **allowed: false** (`invalid_slug` slim tracker); orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 2.61 · B+/D+/B-/B+/C/B-/C+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | close_out **allowed: false** (`invalid_slug` slim tracker) |
| **Process contract** | **partial** | Orchestrator manifest present |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN locks prompt stress |
| 3 | `build-plan` | **1** green tests at facilitator replay |
| 4 | `close-out` | close_out **blocked** — slim checklist slugs |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | Producer/consumer modules exist; binding depth thin. |
| Traceability closure | **D+** | Bootstrap-only `cfcc11e`; close_out **allowed: false** (`invalid_slug`). |
| Test strategy | **B-** | Single deliver wiring test; composition stress under-covered. |
| Algorithm / implementation | **B+** | Wiring module connects libraries in-process. |
| Process adherence | **C** | Orchestrator exit_code 0 while close_out gate blocked. |
| Workflow choreography | **B-** | Ten-minute wall; slim checklist slug mismatch. |
| Methodology learning readout | **C+** | Mirrors Grok WF-09 split pattern on session **4.2.2**. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-03)

Pairs [Sonnet medium complete @ 1794617768](trial-readout-PROMPT-WF-03-claudesonnet55medium-1794617768-wf-agentstream-wf-03-claude-claudesonnet55medium.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-03-1794616912-wf-agentstream-wf-03-cursor-grok47low/evidence/)
