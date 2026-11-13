# Trial readout: PROMPT-WF-10 → Cursor Composer 2.5 (`medium`) → `1794606843-wf-agentstream-wf-10-cursor-composer25med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) |
| **Model config** | `composer-2.5` + effort `medium` |
| **Model slug** | `composer-2.5-fast` |
| **Model effort** | `medium` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794606843-wf-agentstream-wf-10-cursor-composer25med` |
| **Factory tag** | `1794606843-wf-agentstream-wf-10-cursor-composer25med` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json` / `mcp_server_info`** — `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Cursor **Composer medium** WF-10 on **4.2.2**; pairs other WF-10 readouts without ranking. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (TIED-DEMO-13).

---

## What was built

- **Product:** CSV summary CLI (`--file` xor stdin).
- **TIED:** `REQ-CSV_SUMMARY_CLI`; facilitator **`npm test` 18/18**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **693s** (~12 min).
- **Git:** **`6ba2b31`** on disposable client.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **18/18**.

**Workflow outcome:** **Complete (machine)** — orchestrator `exit_code: 0`; **`6ba2b31`**; **18/18** tests; close_out **allowed**.

**Grading outcome:** **Grade mean (registry compact):** 3.81 · A/A-/A/A-/B+/A-/A.

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
| 2 | `refine-plan` | PLAN/CITDP for `REQ-CSV_SUMMARY_CLI` |
| 3 | `build-plan` | Tests **18** green at facilitator replay |
| 4 | `close-out` | **allowed**; **`6ba2b31`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **693s** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Xor file/stdin input rule documented before implementation. |
| Traceability closure | **A-** | close_out allowed; thinner test count than peer 1794514372. |
| Test strategy | **A-** | Eighteen green cases cover argv and CSV paths; fewer than thirty-six-case peer. |
| Algorithm / implementation | **A-** | CLI honors documented misuse exit and counting rules. |
| Process adherence | **A-** | Standard four-phase with allowed close_out. |
| Workflow choreography | **A** | Orchestrator exit_code 0; wall ~11.5 min. |
| Methodology learning readout | **A** | Cursor Composer medium WF-10 pairs 1794514372 without ranking. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-10)

Pairs with other WF-10 readouts on disk (Claude/Grok/Composer variants). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794606843-wf-agentstream-wf-10-cursor-composer25med/evidence/)
