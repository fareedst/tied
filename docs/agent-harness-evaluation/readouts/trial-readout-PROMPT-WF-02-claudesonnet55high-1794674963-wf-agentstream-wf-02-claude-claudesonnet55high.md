# Trial readout: PROMPT-WF-02 → Claude Sonnet 5.5 (high effort) → `1794674963-wf-agentstream-wf-02-claude-claudesonnet55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-14 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-02`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `claude-sonnet-5-5 (high effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794674963-wf-agentstream-wf-02-claude-claudesonnet55high` |
| **Factory tag** | `1794674963-wf-agentstream-wf-02-claude-claudesonnet55high` |
| **Product REQ** | `REQ-STDIN_LINE_DEDUP_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-STDIN_LINE_DEDUP_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Sonnet **high** WF-02 ambiguity stress on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

---

## What was built

- **Product:** stdin dedup CLI + pipeline tests; facilitator **`npm test` 83/83** pass.
- **TIED:** close_out **allowed**; adherence ledger present.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **889s** (~15 min).
- **Git:** product pin **`12c1706`**.
- **Project size layers:** unit **55**; composition **11**; e2e **10** (facilitator snapshot **2026-11-14**).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **83/83**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.87 · A/A/A/A-/A-/A/A-.

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
| 1 | `add-feature` | REQ + ambiguity note |
| 2 | `refine-plan` | First/last policy documented |
| 3 | `build-plan` | Composition + e2e tests green |
| 4 | `close-out` | **`12c1706`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Duplicate policy chosen and documented in PLAN. |
| Traceability closure | **A** | close_out allowed; commit `12c1706`. |
| Test strategy | **A** | Composition and e2e layers beyond medium peer. |
| Algorithm / implementation | **A-** | CLI + pipeline wiring satisfies prompt. |
| Process adherence | **A-** | Fifteen-minute wall; ledger on disk. |
| Workflow choreography | **A** | Four turns under Sonnet **high** effort. |
| Methodology learning readout | **A-** | High effort deepens binding proof; not a leaderboard claim. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-02)

Pairs [Sonnet medium complete @ 1794617445](trial-readout-PROMPT-WF-02-claudesonnet55medium-1794617445-wf-agentstream-wf-02-claude-claudesonnet55medium.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-02-1794674963-wf-agentstream-wf-02-claude-claudesonnet55high/evidence/)