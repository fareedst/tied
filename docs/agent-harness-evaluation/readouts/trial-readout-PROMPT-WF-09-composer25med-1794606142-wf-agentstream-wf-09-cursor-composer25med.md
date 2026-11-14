# Trial readout: PROMPT-WF-09 → Cursor Composer 2.5 (`medium`) → `1794606142-wf-agentstream-wf-09-cursor-composer25med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-09`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `composer-2.5` + effort `medium` |
| **Model slug** | `composer-2.5-fast` |
| **Model effort** | `medium` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794606142-wf-agentstream-wf-09-cursor-composer25med` |
| **Factory tag** | `1794606142-wf-agentstream-wf-09-cursor-composer25med` |
| **Product REQ** | `REQ-ORDERED_CONCURRENT_MAP` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json` / `mcp_server_info`** — `tied-project/working/REQ-ORDERED_CONCURRENT_MAP/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Cursor **Composer medium** WF-09 on **4.2.2**; pairs other WF-09 readouts without ranking. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

**Catalog stress:** composition concurrency (ordered results).

---

## What was built

- **Product:** Ordered concurrent map library; deterministic delay tests.
- **TIED:** `REQ-ORDERED_CONCURRENT_MAP`; facilitator **`npm test` 8/8**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **699s** (~12 min).
- **Git:** **`0d6f053`** on disposable client.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **8/8**.

**Workflow outcome:** **Complete (machine)** — orchestrator `exit_code: 0`; **`0d6f053`**; **8/8** tests; close_out **allowed**.

**Grading outcome:** **Grade mean (registry compact):** 3.86 · A/A/A/A-/A-/A/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | close_out **allowed: true** on client |
| **Process contract** | **partial** | Four-turn orchestrator manifest |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN/CITDP for `REQ-ORDERED_CONCURRENT_MAP` |
| 3 | `build-plan` | Tests **8** green at facilitator replay |
| 4 | `close-out` | **allowed**; **`0d6f053`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **699s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Ordered-output concurrency contract locked before RED tests. |
| Traceability closure | **A** | close_out allowed with traceable product commit. |
| Test strategy | **A-** | Eight deterministic-delay cases; composition depth modest vs WF-10 peers. |
| Algorithm / implementation | **A** | Output order matches input despite out-of-order completion. |
| Process adherence | **A-** | Four-turn batch; machine close_out pass. |
| Workflow choreography | **A** | Orchestrator exit_code 0 end to end. |
| Methodology learning readout | **A-** | First WF-09 Cursor Composer medium on 4.2.2 in this batch. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-09)

Pairs with other WF-09 readouts on disk (Claude/Grok/Composer variants). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-09-1794606142-wf-agentstream-wf-09-cursor-composer25med/evidence/)
