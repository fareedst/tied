# Trial readout: PROMPT-WF-01 → Claude Sonnet 5.5 (medium effort) → `1794617190-wf-agentstream-wf-01-claude-claudesonnet55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-01`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `claude-sonnet-5-5 (medium effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `medium` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794617190-wf-agentstream-wf-01-claude-claudesonnet55medium` |
| **Factory tag** | `1794617190-wf-agentstream-wf-01-claude-claudesonnet55medium` |
| **Product REQ** | `REQ-SEMVER_COMPARATOR_SATISFIES` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-SEMVER_COMPARATOR_SATISFIES/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

---

## What was built

- **Product:** `REQ-SEMVER_COMPARATOR_SATISFIES`; facilitator **`npm test` 7/7** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **235s** (~3 min).
- **Git:** product pin **`918d39a`**.

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **7/7**.

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
| 2 | `refine-plan` | PLAN locks prompt stress |
| 3 | `build-plan` | **7** green tests at facilitator replay |
| 4 | `close-out` | CITDP persist; **`918d39a`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator semantics fixed before implementation. |
| Traceability closure | **A** | close_out allowed; commit `918d39a`. |
| Test strategy | **A-** | Seven green tests at facilitator replay. |
| Algorithm / implementation | **A** | Library satisfies prompt without extra CLI. |
| Process adherence | **A-** | Four-minute wall; verification gate receipts on disk. |
| Workflow choreography | **A** | Parallel Sonnet medium wave with Grok batch. |
| Methodology learning readout | **A-** | Sonnet **medium** WF-01 on **4.2.2**; not ranked vs Opus low. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-01)

Pairs [Opus low WF-01 @ 1794587975](trial-readout-PROMPT-WF-01-claudeopus55low-1794587975-wf-agentstream-wf-01-claude-claudeopus55low.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-01-1794617190-wf-agentstream-wf-01-claude-claudesonnet55medium/evidence/)
