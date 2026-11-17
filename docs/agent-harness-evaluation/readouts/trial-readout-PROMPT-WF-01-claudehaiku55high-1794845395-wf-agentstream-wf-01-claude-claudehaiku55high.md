# Trial readout: PROMPT-WF-01 → Claude Haiku 5.5 (high effort) → `1794845395-wf-agentstream-wf-01-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-01`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `claude-haiku-5-5 (high effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794845395-wf-agentstream-wf-01-claude-claudehaiku55high` |
| **Factory tag** | `1794845395-wf-agentstream-wf-01-claude-claudehaiku55high` |
| **Product REQ** | `REQ-SEMVER_COMPARATOR` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-SEMVER_COMPARATOR/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First Haiku **`@high`** WF-01 on **4.2.2**; pairs legacy Haiku default @ 1794055051. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

---

## What was built

- **Product:** Semver comparator library; facilitator **67/67** tests.
- **Git:** **`418dcdf`** — `feat(semver): add satisfies comparator`.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator wall **649s** (~11 min).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **67/67**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**. Process contract and adherence ledger **partial** on client (see handoff).

**Grading outcome:** **Grade mean (registry compact):** 3.81 · A/A/A/A/B+/A-/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate allowed per close-out handoff |
| **Process contract** | **partial** | Missing verification manifest; `tied_verify` not run |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN scaffold |
| 2 | `refine-plan` | Comparator rules locked |
| 3 | `build-plan` | RED → GREEN **67/67** |
| 4 | `close-out` | close_out **allowed**; **`418dcdf`** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator semantics and test command documented before code. |
| Traceability closure | **A** | Traceable product commit after machine close_out pass. |
| Test strategy | **A** | Broad semver edge coverage at facilitator replay. |
| Algorithm / implementation | **A** | Satisfies comparator behavior matches PLAN. |
| Process adherence | **B+** | close_out allowed; partial manifest/adherence signals on client. |
| Workflow choreography | **A−** | Four turns; eleven-minute wall on **4.2.2**. |
| Methodology learning readout | **A−** | Contrasts default-effort Haiku WF-01 @ 1794055051 (**39** tests). |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-01)

Compare [Haiku default @ 1794055051](trial-readout-PROMPT-WF-01-claudehaiku55-1794055051-wf-agentstream-wf-01-claude-claudehaiku55.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-01-1794845395-wf-agentstream-wf-01-claude-claudehaiku55high/evidence/)