# Trial readout: PROMPT-WF-06 → Cursor Grok 4.7 (`low`) → `1794611506-wf-agentstream-wf-06-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-06`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794611506-wf-agentstream-wf-06-cursor-grok47low` |
| **Factory tag** | `1794611506-wf-agentstream-wf-06-cursor-grok47low` |
| **Product REQ** | `REQ-IN_MEMORY_TOKEN_BUCKET` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-IN_MEMORY_TOKEN_BUCKET/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | **4.2.2** chained batch **1794610*** after [WF-09 Grok low @ 1794608051](trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) split signal. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

---

## What was built

- **Product:** In-Memory Token-Bucket Limiter; facilitator **`npm test` 3/3** pass.
- **TIED:** `REQ-IN_MEMORY_TOKEN_BUCKET`; verification + close_out **allowed**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **933s** (~16 min).
- **Git:** product pin **`02eff82f`**; minor uncommitted TIED/evidence files remain.

### Project size layers

MCP `tied_project_size_snapshot` (read-only): proof receipt `unit.default` cases match facilitator test count; evidence-only — not a grade dimension.

---

## Outcome record

**Implementation outcome:** **Complete** — green tests at facilitator replay.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; traceable product commit.

**Grading outcome:** **Grade mean (registry compact):** 3.77 · A/A/B+/A-/A-/A/A-.

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
| PLAN | `tied-project/working/REQ-IN_MEMORY_TOKEN_BUCKET/PLAN.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-06-1794611506-wf-agentstream-wf-06-cursor-grok47low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | PLAN locks prompt stress contract |
| 3 | `build-plan` | **3** green tests; verification **allowed** |
| 4 | `close-out` | CITDP persist; **`02eff82f`**; close_out **allowed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **933s** |

**Friction excerpts:** `harness=cursor` `model=grok-4.7-low-fast` `model_effort=low`; `model_config=grok47-low`; proof manifest scaffold seeded; phase-handoff gate default on.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | Product commit **`02eff82f`** present; facilitator replay matches orchestrator exit **0** |
| Inventory | `trial-workflow-interaction-inventory.v1.json` present but turn array sparse |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **3** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Rate and burst contract plus exceed policy documented. |
| Traceability closure | **A** | close_out allowed with commit `02eff82f`. |
| Test strategy | **B+** | Three unit cases prove basics; thinner than five-test grok47-med WF-06. |
| Algorithm / implementation | **A-** | Limiter behavior matches PLAN; minimal scope. |
| Process adherence | **A-** | Gate receipts allowed; minor uncommitted TIED drift on disk. |
| Workflow choreography | **A** | Fifteen-minute wall in post-WF-05 chained batch. |
| Methodology learning readout | **A-** | Adds 4.2.2 Grok 4.7 low WF-06 complete datapoint. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-06)

Pairs [Grok 4.7 med @ 1794197658](trial-readout-PROMPT-WF-06-grok47-med-1794197658-wf-agentstream-wf-06-cursor-grok47med.md) and [Opus low @ 1794598549](trial-readout-PROMPT-WF-06-claudeopus55low-1794598549-wf-agentstream-wf-06-claude-claudeopus55low.md) — **no ranking**.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Runs registry](traditional-workflow-trial-runs-registry.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-06-1794611506-wf-agentstream-wf-06-cursor-grok47low/evidence/)
