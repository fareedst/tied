# Trial readout: PROMPT-WF-06 → Claude Sonnet 5.5 (medium effort) → `1794618721-wf-agentstream-wf-06-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-06`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `claude-sonnet-5-5 (medium effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794618721-wf-agentstream-wf-06-claude-claudesonnet55medium` |
| **Factory tag** | `1794618721-wf-agentstream-wf-06-claude-claudesonnet55medium` |
| **Product REQ** | `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

---

## What was built

- **Product:** `REQ-TOKEN_BUCKET_RATE_LIMITER`; facilitator **`npm test` 7/7** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **239s** (~3 min).
- **Git:** product pin **`691fd64`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **7/7**.

**Workflow outcome:** **Incomplete (split signal)** — close_out **not_run**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.53 · A/A-/A/A/B+/B/A-.

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
| 3 | `build-plan` | **7** green tests at facilitator replay |
| 4 | `close-out` | **7** green tests; close-out gate absent |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Exceed-limit behavior documented in PLAN. |
| Traceability closure | **A-** | Commit `691fd64`; no close_out JSON on disk. |
| Test strategy | **A** | Seven unit cases cover burst and refill edges. |
| Algorithm / implementation | **A** | In-memory limiter matches prompt scope. |
| Process adherence | **B+** | Orchestrator exit_code 0; close-out turn incomplete. |
| Workflow choreography | **B+** | Fast four-minute wall; TIED drift uncommitted. |
| Methodology learning readout | **A-** | Green tests without machine close_out. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-06)

Pairs Haiku medium complete [@ 1794603724](trial-readout-PROMPT-WF-06-claudehaiku55medium-1794603724-wf-agentstream-wf-06-claude-claudehaiku55medium.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-06-1794618721-wf-agentstream-wf-06-claude-claudesonnet55medium/evidence/)
