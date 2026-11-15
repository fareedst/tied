# Trial readout: PROMPT-WF-04 → Claude Sonnet 5.5 (high effort) → `1794715660-wf-agentstream-wf-04-claude-claudesonnet55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-14 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-04`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `claude-sonnet-5-5 (high effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794715660-wf-agentstream-wf-04-claude-claudesonnet55high` |
| **Factory tag** | `1794715660-wf-agentstream-wf-04-claude-claudesonnet55high` |
| **Product REQ** | `REQ-SRC_MARKER_ORPHAN_SCAN` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-SRC_MARKER_ORPHAN_SCAN/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Sonnet **high** WF-04 on session **4.2.2**; contrasts medium split @ 1794618058. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

---

## What was built

- **Product:** fixture marker orphan scan CLI; facilitator **`npm test` 77/77** pass.
- **TIED:** close_out **allowed**; minimal-depth receipts on disk.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **886s** (~15 min).
- **Git:** product pin **`5d83721`**.
- **Project size layers:** unit **49**; composition **11** (facilitator snapshot **2026-11-14**).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **77/77**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.87 · A/A/A-/A/A-/A/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | close_out **allowed** |
| **Process contract** | **partial** | Orchestrator manifest present |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session **4.2.2** |
| 2 | `refine-plan` | Fixture-only scan contract |
| 3 | `build-plan` | **77** green tests at facilitator replay |
| 4 | `close-out` | **`5d83721`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Fixture index scope locked before tests. |
| Traceability closure | **A** | close_out allowed; commit `5d83721`. |
| Test strategy | **A-** | Broad fixture suite versus lean medium peer. |
| Algorithm / implementation | **A** | Orphan scan matches prompt constraints. |
| Process adherence | **A-** | Fifteen-minute wall; gate receipts on disk. |
| Workflow choreography | **A** | Four turns under Sonnet **high** effort. |
| Methodology learning readout | **A-** | Completes machine path medium cell missed. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-04)

Pairs [Sonnet medium split @ 1794618058](trial-readout-PROMPT-WF-04-claudesonnet55medium-1794618058-wf-agentstream-wf-04-claude-claudesonnet55medium.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-04-1794715660-wf-agentstream-wf-04-claude-claudesonnet55high/evidence/)