# Trial readout: PROMPT-WF-07 → Cursor Grok 4.7 (`low`) → `1794612441-wf-agentstream-wf-07-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-07`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-07](catalog-traditional-workflow-trial-prompts.md#prompt-wf-07) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794612441-wf-agentstream-wf-07-cursor-grok47low` |
| **Factory tag** | `1794612441-wf-agentstream-wf-07-cursor-grok47low` |
| **Product REQ** | `REQ-CONFIG_DEFAULTS_OVERRIDE` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-CONFIG_DEFAULTS_OVERRIDE/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | **4.2.2** chained batch **1794610*** after [WF-09 Grok low @ 1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) split signal. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that loads configuration from a defaults object and an override object. The sponsor has not decided whether an explicit null in the override clears a key or is treated as missing—resolve that in planning before coding. Include tests for override precedence and your null/missing rule.
```

---

## What was built

- **Product:** Defaults+Override Config Merger; facilitator **`npm test` 6/6** pass.
- **TIED:** `REQ-CONFIG_DEFAULTS_OVERRIDE`; verification + close_out **allowed**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **826s** (~14 min).
- **Git:** product pin **`3cbbac31`**; minor uncommitted TIED/evidence files remain.

### Project size layers

MCP `tied_project_size_snapshot` (read-only): proof receipt `unit.default` cases match facilitator test count; evidence-only — not a grade dimension.

---

## Outcome record

**Implementation outcome:** **Complete** — green tests at facilitator replay.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; traceable product commit.

**Grading outcome:** **Grade mean (registry compact):** 3.87 · A/A/A-/A/A-/A/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | close_out receipt **allowed: true** |
| **Process contract** | **partial** | Four-turn orchestrator manifest; interaction inventory thin |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CONFIG_DEFAULTS_OVERRIDE/PLAN.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-07-1794612441-wf-agentstream-wf-07-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN locks prompt stress contract |
| 3 | `build-plan` | **6** green tests; verification **allowed** |
| 4 | `close-out` | CITDP persist; **`3cbbac31`**; close_out **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **826s** |

**Friction excerpts:** `harness=cursor` `model=grok-4.7-low-fast` `model_effort=low`; `model_config=grok47-low`; proof manifest scaffold seeded; phase-handoff gate default on.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | Product commit **`3cbbac31`** present; facilitator replay matches orchestrator exit **0** |
| Inventory | `trial-workflow-interaction-inventory.v1.json` present but turn array sparse |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **6** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Null vs missing rule resolved in PLAN before build. |
| Traceability closure | **A** | close_out allowed with commit `3cbbac31`. |
| Test strategy | **A-** | Six precedence cases; comparable depth to Opus low WF-07. |
| Algorithm / implementation | **A** | Merge policy matches written null/missing decision. |
| Process adherence | **A-** | Both verification and close_out receipts allowed. |
| Workflow choreography | **A** | Orchestrator exit_code 0; exit follows WF-06 in same batch. |
| Methodology learning readout | **A-** | Contrasts split-signal Grok WF-09 without ranking. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-07)

Pairs [Grok 4.7 med @ 1794200222](trial-readout-PROMPT-WF-07-grok47-med-1794200222-wf-agentstream-wf-07-cursor-grok47med.md) (**8/8**) without ranking.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Runs registry](traditional-workflow-trial-runs-registry.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-07-1794612441-wf-agentstream-wf-07-cursor-grok47low/evidence/)
