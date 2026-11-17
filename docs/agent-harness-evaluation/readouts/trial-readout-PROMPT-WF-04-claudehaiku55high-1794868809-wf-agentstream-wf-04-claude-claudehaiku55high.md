# Trial readout: PROMPT-WF-04 → Claude Haiku 5.5 (high effort) → `1794868809-wf-agentstream-wf-04-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-04`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `claude-haiku-5-5 (high effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794868809-wf-agentstream-wf-04-claude-claudehaiku55high` |
| **Factory tag** | `1794868809-wf-agentstream-wf-04-claude-claudehaiku55high` |
| **Product REQ** | `REQ-FIXTURE_MARKER_ORPHAN_SCAN` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-FIXTURE_MARKER_ORPHAN_SCAN/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Haiku **`@high`** WF-04 **repeat** on **4.2.2**; supersedes incomplete cell @ 1794853434. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

---

## What was built

- **Product:** Fixture orphan-marker scanner CLI; facilitator **28/28** tests.
- **Git:** **`9d96ac5`** — `feat(marker-scan): add orphan marker scanner`.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator wall **881s** (~15 min).
- **Project size layers:** unit **22**; composition **0** (facilitator snapshot **2026-11-16**).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **28/28**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**. Process contract **partial** (verification manifest not produced).

**Grading outcome:** **Grade mean (registry compact):** 3.76 · A/A/A-/A/B+/A-/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate **allowed**; envelope blocking gaps **0** |
| **Process contract** | **partial** | RED/GREEN manifests present; slim-checklist slug warnings on refine (recorded) |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN; session **4.2.2** captured |
| 2 | `refine-plan` | Fixture-only scan contract locked (A1–A8) |
| 3 | `build-plan` | RED → GREEN **28/28**; verification gate **allowed** |
| 4 | `close-out` | **`9d96ac5`**; close_out **allowed** |

---

## Orchestrator process log

Manifest: `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` · **`exit_code: 0`**.

- Stack seed + preload contract materialized before turn 1.
- Slim checklist tracker present; phase-handoff gate default **on**.
- Proof-facet manifest scaffold seeded (completed before close-out).

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Fixture index and comment rules locked in PLAN before RED. |
| Traceability closure | **A** | Product commit after close_out **allowed: true**. |
| Test strategy | **A−** | Twenty-eight fixture-scoped cases; leaner than Sonnet high peer. |
| Algorithm / implementation | **A** | Orphan scan matches locked CLI contract. |
| Process adherence | **B+** | Machine close_out pass; partial manifest signals on client. |
| Workflow choreography | **A−** | Four turns; fifteen-minute wall on Haiku **high**. |
| Methodology learning readout | **A−** | Repeat completes matrix cell blocked on first Haiku high run. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-04)

Pairs [incomplete Haiku high @ 1794853434](trial-readout-PROMPT-WF-04-claudehaiku55high-1794853434-wf-agentstream-wf-04-claude-claudehaiku55high.md) and [Sonnet high complete @ 1794715660](trial-readout-PROMPT-WF-04-claudesonnet55high-1794715660-wf-agentstream-wf-04-claude-claudesonnet55high.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-04-1794868809-wf-agentstream-wf-04-claude-claudehaiku55high/evidence/)