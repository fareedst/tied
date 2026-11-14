# Trial readout: PROMPT-WF-08 → Cursor Grok 4.7 (`low`) → `1794613269-wf-agentstream-wf-08-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-08`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794613269-wf-agentstream-wf-08-cursor-grok47low` |
| **Factory tag** | `1794613269-wf-agentstream-wf-08-cursor-grok47low` |
| **Product REQ** | `REQ-TINY_EXPLICIT_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-TINY_EXPLICIT_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | **4.2.2** chained batch **1794610*** after [WF-09 Grok low @ 1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) split signal. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

---

## What was built

- **Product:** Three-State Explicit State Machine; facilitator **`npm test` 2/2** pass.
- **TIED:** `REQ-TINY_EXPLICIT_STATE_MACHINE`; verification + close_out **allowed**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **721s** (~12 min).
- **Git:** product pin **`ab7e3507`**; minor uncommitted TIED/evidence files remain.

### Project size layers

MCP `tied_project_size_snapshot` (read-only): proof receipt `unit.default` cases match facilitator test count; evidence-only — not a grade dimension.

---

## Outcome record

**Implementation outcome:** **Complete** — green tests at facilitator replay.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; traceable product commit.

**Grading outcome:** **Grade mean (registry compact):** 3.59 · A-/A/B-/A-/A-/A/B+.

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
| PLAN | `tied-project/working/REQ-TINY_EXPLICIT_STATE_MACHINE/PLAN.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794613269-wf-agentstream-wf-08-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN locks prompt stress contract |
| 3 | `build-plan` | **2** green tests; verification **allowed** |
| 4 | `close-out` | CITDP persist; **`ab7e3507`**; close_out **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **721s** |

**Friction excerpts:** `harness=cursor` `model=grok-4.7-low-fast` `model_effort=low`; `model_config=grok47-low`; proof manifest scaffold seeded; phase-handoff gate default on.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | Product commit **`ab7e3507`** present; facilitator replay matches orchestrator exit **0** |
| Inventory | `trial-workflow-interaction-inventory.v1.json` present but turn array sparse |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **2** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A-** | Legal and illegal transitions documented; minimal PROMPT scope. |
| Traceability closure | **A** | close_out allowed with commit `ab7e3507`. |
| Test strategy | **B-** | Only two cases—meets prompt minimum but below five-test grok47-med WF-08. |
| Algorithm / implementation | **A-** | Illegal transition error path implemented and tested once. |
| Process adherence | **A-** | Gates allowed; small uncommitted evidence drift. |
| Workflow choreography | **A** | Batch capstone; orchestrator exit_code 0. |
| Methodology learning readout | **B+** | Unlike split Grok WF-09, full close-out succeeded on thin test depth. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-08)

Pairs [Grok 4.7 med @ 1794202372](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) (**5/5**) and [WF-09 split @ 1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) without ranking.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Runs registry](traditional-workflow-trial-runs-registry.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-08-1794613269-wf-agentstream-wf-08-cursor-grok47low/evidence/)
