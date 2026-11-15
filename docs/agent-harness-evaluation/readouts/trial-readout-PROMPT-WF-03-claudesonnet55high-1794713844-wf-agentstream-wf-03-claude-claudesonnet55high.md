# Trial readout: PROMPT-WF-03 → Claude Sonnet 5.5 (high effort) → `1794713844-wf-agentstream-wf-03-claude-claudesonnet55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-14 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-03`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `claude-sonnet-5-5 (high effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794713844-wf-agentstream-wf-03-claude-claudesonnet55high` |
| **Factory tag** | `1794713844-wf-agentstream-wf-03-claude-claudesonnet55high` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Repeat Sonnet **high** WF-03 on session **4.2.2**; succeeds where prior high cell **1794675875** split on close_out. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

---

## What was built

- **Product:** producer, consumer, and wiring modules; facilitator **`npm test` 41/41** pass.
- **TIED:** close_out **allowed**; minimal-depth gate receipts on disk.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **700s** (~12 min).
- **Git:** product pin **`0976ba1d`**.
- **Project size layers:** unit **27**; composition **16** (facilitator snapshot **2026-11-14**).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **41/41**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.87 · A/A/A-/A/A-/A/A-.

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
| 2 | `refine-plan` | Wiring contract in PLAN |
| 3 | `build-plan` | **41** green tests at facilitator replay |
| 4 | `close-out` | **`0976ba1d`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Module split and wiring test without GUI. |
| Traceability closure | **A** | close_out allowed; commit `0976ba1d`. |
| Test strategy | **A-** | Deep unit and composition suite versus lean medium peer. |
| Algorithm / implementation | **A** | Producer/consumer wiring matches PLAN. |
| Process adherence | **A-** | Twelve-minute wall; gate receipts on disk. |
| Workflow choreography | **A** | Four turns complete under Sonnet **high** effort. |
| Methodology learning readout | **A-** | Contrasts prior Sonnet high WF-03 split @ 1794675875. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-03)

Pairs [Sonnet medium complete @ 1794617768](trial-readout-PROMPT-WF-03-claudesonnet55medium-1794617768-wf-agentstream-wf-03-claude-claudesonnet55medium.md), [prior Sonnet high split @ 1794675875](trial-readout-PROMPT-WF-03-claudesonnet55high-1794675875-wf-agentstream-wf-03-claude-claudesonnet55high.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-03-1794713844-wf-agentstream-wf-03-claude-claudesonnet55high/evidence/)