# Trial readout: PROMPT-WF-05 → Claude Haiku 5.5 (high effort) → `1794870183-wf-agentstream-wf-05-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-05`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `claude-haiku-5-5 (high effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794870183-wf-agentstream-wf-05-claude-claudehaiku55high` |
| **Factory tag** | `1794870183-wf-agentstream-wf-05-claude-claudehaiku55high` |
| **Product REQ** | `REQ-CSV_ROW_OBJECT_MAPPER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — inventory + session capture on turn 1 |
| **Cohort comparison** | Haiku **`@high`** WF-05 **repeat** on **4.2.2**; supersedes split cell @ 1794856466. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

---

## What was built

- **Product:** `csvToObjects` library; facilitator **14/14** tests.
- **Git:** **`d5c759c`** — `feat(csv): add CSV row to object mapper`.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator wall **610s** (~10 min).
- **Project size layers:** unit **14**; composition **0** (facilitator snapshot **2026-11-16**).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **14/14**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**. Process contract **partial** (`sub-close-out-evidence-sync` not run per trial note).

**Grading outcome:** **Grade mean (registry compact):** 3.79 · A/A/B+/A/B+/A-/A.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate **allowed**; envelope blocking gaps **0** |
| **Process contract** | **partial** | Close_out receipt under `tied-bundle/working/` (regenerable) |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN; empty/zero-row behavior called out |
| 2 | `refine-plan` | D1–D9 locked; advisory `invalid_slug` on slim tracker (recorded) |
| 3 | `build-plan` | RED → GREEN **14/14**; verification gate **allowed** |
| 4 | `close-out` | **`d5c759c`**; close_out **allowed** |

---

## Orchestrator process log

Manifest: `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` · **`exit_code: 0`**.

- Same stack seed + proof manifest scaffold pattern as peer Haiku high cells.
- Refine-phase gate logged `invalid_slug:implement-code` / `red-tests` (slim tracker); build-plan revalidated clean.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Header-only and empty-input rules explicit before RED. |
| Traceability closure | **A** | Traceable product commit after machine close_out pass. |
| Test strategy | **B+** | Fourteen acceptance-aligned cases versus twenty-eight on failed first run. |
| Algorithm / implementation | **A** | RFC-4180 edge cases match locked PLAN. |
| Process adherence | **B+** | close_out **allowed** with bundle-path gate receipt; partial sync steps. |
| Workflow choreography | **A−** | Four turns; ten-minute wall on Haiku **high**. |
| Methodology learning readout | **A** | Repeat converts split cell to machine-complete path. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-05)

Pairs [split Haiku high @ 1794856466](trial-readout-PROMPT-WF-05-claudehaiku55high-1794856466-wf-agentstream-wf-05-claude-claudehaiku55high.md) and [Sonnet high complete @ 1794735352](trial-readout-PROMPT-WF-05-claudesonnet55high-1794735352-wf-agentstream-wf-05-claude-claudesonnet55high.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-05-1794870183-wf-agentstream-wf-05-claude-claudehaiku55high/evidence/)