# Trial readout: PROMPT-WF-05 → Cursor Grok 4.7 (`low`) → `1794610718-wf-agentstream-wf-05-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-05`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794610718-wf-agentstream-wf-05-cursor-grok47low` |
| **Factory tag** | `1794610718-wf-agentstream-wf-05-cursor-grok47low` |
| **Product REQ** | `REQ-CSV_ROW_OBJECT_MAPPER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-CSV_ROW_OBJECT_MAPPER/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | **4.2.2** chained batch **1794610*** after [WF-09 Grok low @ 1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) split signal. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

---

## What was built

- **Product:** Csv Row→Object Mapper; facilitator **`npm test` 7/7** pass.
- **TIED:** `REQ-CSV_ROW_OBJECT_MAPPER`; verification + close_out **allowed**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **786s** (~13 min).
- **Git:** product pin **`2031fa73`**; minor uncommitted TIED/evidence files remain.

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
| PLAN | `tied-project/working/REQ-CSV_ROW_OBJECT_MAPPER/PLAN.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-05-1794610718-wf-agentstream-wf-05-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN locks prompt stress contract |
| 3 | `build-plan` | **7** green tests; verification **allowed** |
| 4 | `close-out` | CITDP persist; **`2031fa73`**; close_out **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **786s** |

**Friction excerpts:** `harness=cursor` `model=grok-4.7-low-fast` `model_effort=low`; `model_config=grok47-low`; proof manifest scaffold seeded; phase-handoff gate default on.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | Product commit **`2031fa73`** present; facilitator replay matches orchestrator exit **0** |
| Inventory | `trial-workflow-interaction-inventory.v1.json` present but turn array sparse |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **7** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Empty-file behavior locked in refine AC before RED. |
| Traceability closure | **A** | close_out allowed with product commit `2031fa73`. |
| Test strategy | **A-** | Seven cases cover header-only path; thinner than thirteen-test grok47-med peer. |
| Algorithm / implementation | **A** | Mapper honors documented zero-row policy. |
| Process adherence | **A-** | Verification and close_out gates both allowed. |
| Workflow choreography | **A** | Orchestrator exit_code 0 across four turns in chained batch. |
| Methodology learning readout | **A-** | First 4.2.2 Grok 4.7 low WF-05 cell; not ranked vs Opus low batch. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-05)

Pairs [Grok 4.7 med @ 1794195336](trial-readout-PROMPT-WF-05-grok47-med-1794195336-wf-agentstream-wf-05-cursor-grok47med.md) (**13/13**) and [Opus low @ 1794598104](trial-readout-PROMPT-WF-05-claudeopus55low-1794598104-wf-agentstream-wf-05-claude-claudeopus55low.md) without ranking.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Runs registry](traditional-workflow-trial-runs-registry.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-05-1794610718-wf-agentstream-wf-05-cursor-grok47low/evidence/)
