# Trial readout: PROMPT-WF-04 → Claude Haiku 5.5 (high effort) → `1794853434-wf-agentstream-wf-04-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-04`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `claude-haiku-5-5 (high effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794853434-wf-agentstream-wf-04-claude-claudehaiku55high` |
| **Factory tag** | `1794853434-wf-agentstream-wf-04-claude-claudehaiku55high` |
| **Product REQ** | `REQ-REQ_MARKER_ORPHAN_SCAN` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** |
| **Cohort comparison** | Haiku **`@high`** WF-04 **4.2.2** — build-plan blocked before RED. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

---

## What was built

- **Product:** **None** — `src/` remains bootstrap `.gitkeep` only.
- **Git:** HEAD **`b8c5efd`** (`TIED 4.2.2` bootstrap); **no** product commit.
- **Stack:** orchestrator wall **471s** (~8 min); orchestrator **`exit_code: 0`** despite blocked build.

---

## Outcome record

**Implementation outcome:** **Not delivered** — facilitator **`npm test` 0/0**.

**Workflow outcome:** **Incomplete** — build-plan **blocked** at pre_implementation gate; close_out **allowed: false**; `invalid_slug` / stale proof manifest.

**Grading outcome:** **Grade mean (registry compact):** 1.51 · B+/D+/F/F/D+/C/B-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` close_out **blocked** |
| **Process contract** | **fail** | No verification receipt; slim slug vocabulary unresolved |
| **Orchestrator** | **pass** | **`exit_code: 0`** (orchestrator does not reflect build gate) |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | PLAN + tracker |
| 2 | `refine-plan` | Advisory pre_implementation **not allowed** (recorded) |
| 3 | `build-plan` | **blocked** — no RED/GREEN |
| 4 | `close-out` | Envelope only; **no** traceable commit |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | PLAN captures marker-scan intent. |
| Traceability closure | **D+** | No product commit; close_out blocked. |
| Test strategy | **F** | Zero executable tests. |
| Algorithm / implementation | **F** | No scanner implementation. |
| Process adherence | **D+** | Turn 3 blocked on slug/manifest gates. |
| Workflow choreography | **C** | Four turns consumed; no shipped code. |
| Methodology learning readout | **B−** | Highlights slim-checklist slug drift on **4.2.2**. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-04)

Pairs [Sonnet high complete @ 1794715660](trial-readout-PROMPT-WF-04-claudesonnet55high-1794715660-wf-agentstream-wf-04-claude-claudesonnet55high.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-04-1794853434-wf-agentstream-wf-04-claude-claudehaiku55high/evidence/)