# Trial readout: PROMPT-WF-06 → Claude Haiku 5.5 (medium effort) → `1794603724-wf-agentstream-wf-06-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-06`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `claude-haiku-5-5 (medium effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794603724-wf-agentstream-wf-06-claude-claudehaiku55medium` |
| **Factory tag** | `1794603724-wf-agentstream-wf-06-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **4.2.2** Haiku **medium** WF-06 batch with Opus **low** WF-06 readouts on disk (no ranking). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

---

## What was built

- **Product:** `REQ-TOKEN_BUCKET_RATE_LIMITER` on disposable client; facilitator **`npm test` 17/17**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **657s** (~11 min).
- **Git:** product pin **`0c971af`** (subject client; not store).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **17/17**.

**Workflow outcome:** **Complete (machine)** — orchestrator `exit_code: 0`; **`0c971af`**; **17/17** tests; close_out **allowed**.

**Grading outcome:** **Grade mean (registry compact):** 3.87 · A/A-/A/A/A-/A/A-.

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
| 2 | `refine-plan` | PLAN/CITDP for `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| 3 | `build-plan` | Product tests **17** green at facilitator replay when present |
| 4 | `close-out` | **allowed**; **`0c971af`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **657s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Burst and exceed behavior documented before unit tests. |
| Traceability closure | **A** | close_out allowed with committed product pin. |
| Test strategy | **A-** | Seventeen in-memory cases; no network facet. |
| Algorithm / implementation | **A** | Token bucket matches PLAN limits and exceed rule. |
| Process adherence | **A-** | Standard four-phase with allowed close_out. |
| Workflow choreography | **A** | exit_code 0 across orchestrated turns. |
| Methodology learning readout | **A-** | Haiku medium WF-06 on 4.2.2 cohort; no ranking. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-06)

Compare with Opus **low** readout on the same prompt when present (`179458*` / `179459*` batch). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-06-1794603724-wf-agentstream-wf-06-claude-claudehaiku55medium/evidence/)
