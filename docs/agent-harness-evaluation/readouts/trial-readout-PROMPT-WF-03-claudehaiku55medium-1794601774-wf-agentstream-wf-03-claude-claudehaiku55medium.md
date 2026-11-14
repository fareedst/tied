# Trial readout: PROMPT-WF-03 → Claude Haiku 5.5 (medium effort) → `1794601774-wf-agentstream-wf-03-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-03`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `claude-haiku-5-5 (medium effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794601774-wf-agentstream-wf-03-claude-claudehaiku55medium` |
| **Factory tag** | `1794601774-wf-agentstream-wf-03-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **4.2.2** Haiku **medium** WF-03 batch with Opus **low** WF-03 readouts on disk (no ranking). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

---

## What was built

- **Product:** `REQ-PRODUCER_CONSUMER_WIRING` on disposable client; facilitator **`npm test` 8/8**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **476s** (~8 min).
- **Git:** product pin **`221ad7a`** (subject client; not store).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **8/8**.

**Workflow outcome:** **Complete (machine)** — orchestrator `exit_code: 0`; **`221ad7a`**; **8/8** tests; close_out **allowed**.

**Grading outcome:** **Grade mean (registry compact):** 3.81 · A/A/A-/A/A-/A/A-.

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
| 2 | `refine-plan` | PLAN/CITDP for `REQ-PRODUCER_CONSUMER_WIRING` |
| 3 | `build-plan` | Product tests **8** green at facilitator replay when present |
| 4 | `close-out` | **allowed**; **`221ad7a`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **476s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Producer/consumer/wiring split locked before RED tests. |
| Traceability closure | **A** | CITDP path with close_out allowed on disposable client. |
| Test strategy | **A-** | Binding test without UI; eight cases green at facilitator replay. |
| Algorithm / implementation | **A** | Wiring module connects libraries as planned. |
| Process adherence | **A-** | close_out allowed; minimal depth adherence ledger. |
| Workflow choreography | **A** | Orchestrator exit_code 0 across four sponsor turns. |
| Methodology learning readout | **A-** | Haiku medium WF-03 on session 4.2.2 batch; no ranking. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-03)

Compare with Opus **low** readout on the same prompt when present (`179458*` / `179459*` batch). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-03-1794601774-wf-agentstream-wf-03-claude-claudehaiku55medium/evidence/)
