# Trial readout: PROMPT-WF-01 → Cursor Grok 4.7 (`low`) → `1794615214-wf-agentstream-wf-01-cursor-grok47low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `grok47-low` |
| **Model slug** | `grok-4.7-low-fast` |
| **Model effort** | `low` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794615214-wf-agentstream-wf-01-cursor-grok47low` |
| **Factory tag** | `1794615214-wf-agentstream-wf-01-cursor-grok47low` |
| **Product REQ** | `REQ-SEMVER_SATISFIES` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-SEMVER_SATISFIES/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **1794615*** parallel Grok low + Sonnet medium batch on session **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

---

## What was built

- **Product:** `REQ-SEMVER_SATISFIES`; facilitator **`npm test` 7/7** pass.
- **TIED:** verification + close_out per disposition below.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **790s** (~13 min).
- **Git:** product pin **`4e75b6e`**.

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
| 4 | `close-out` | CITDP persist; **`4e75b6e`**; close_out **allowed** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator contract locked before RED tests. |
| Traceability closure | **A** | close_out allowed with commit `4e75b6e`. |
| Test strategy | **A-** | Seven semver cases at facilitator replay. |
| Algorithm / implementation | **A** | satisfies() honors PLAN edge policy. |
| Process adherence | **A-** | Verification and close_out gates allowed. |
| Workflow choreography | **A** | Orchestrator exit_code 0; opens Grok low **1794615*** batch. |
| Methodology learning readout | **A-** | Extends Grok low WF-01 lineage on session **4.2.2**. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-01)

Pairs [Grok low @ 1794531738](trial-readout-PROMPT-WF-01-grok47low-1794531738-wf-agentstream-wf-01-cursor-grok47low.md) without ranking. **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-01-1794615214-wf-agentstream-wf-01-cursor-grok47low/evidence/)
