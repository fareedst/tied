# Trial readout: PROMPT-WF-09 → Claude Haiku 5.5 (low effort) → `1794880253-wf-agentstream-wf-09-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-09`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-09](catalog-traditional-workflow-trial-prompts.md#prompt-wf-09) |
| **Model config** | `claude-haiku-5-5 (low effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `low` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794880253-wf-agentstream-wf-09-claude-claudehaiku55low` |
| **Factory tag** | `1794880253-wf-agentstream-wf-09-claude-claudehaiku55low` |
| **Product REQ** | `REQ-PARALLEL_ORDERED_MAP` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** |
| **Cohort comparison** | Fourth **4.2.2** Haiku **low** WF-09 cell; same CITDP adversarial close-out blocker as @ 1794582335. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

---

## What was built

- **Product:** `src/ordered-map.ts` ordered concurrent mapper; facilitator **8/8** tests (on disk, uncommitted).
- **Git:** bootstrap **`027bbcb`** only — no traceable product commit.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator wall **246s** (~4 min).
- **Project size layers:** unit **8**; composition **0**; REQ index **0** at snapshot.

---

## Outcome record

**Implementation outcome:** **Partial** — eight green tests at facilitator replay.

**Workflow outcome:** **Incomplete** — build-plan delivered code; verification and close_out **blocked** (CITDP adversarial fields).

**Grading outcome:** **Grade mean (registry compact):** 2.56 · B+/D+/B/B+/C/B−/C+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `citdp_record_write` rejected; close_out **not allowed** |
| **Process contract** | **partial** | Proof manifest **ok**; no traceable commit |
| **Orchestrator** | **pass** | **`exit_code: 0`** |
| **Composition stress** | **gap** | **`composition_tests: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold + locked stack |
| 2 | `refine-plan` | Fail-fast + concurrency defaults |
| 3 | `build-plan` | **8/8** GREEN; verification gate **not allowed** |
| 4 | `close-out` | **incomplete** — commit skipped |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | Ordered-map contract locked in PLAN. |
| Traceability closure | **D+** | Bootstrap-only HEAD; close_out blocked. |
| Test strategy | **B** | Eight delay-ordered unit cases at replay. |
| Algorithm / implementation | **B+** | Mapper matches fail-fast PLAN on disk. |
| Process adherence | **C** | Minimal-depth adversarial CITDP fields block gates. |
| Workflow choreography | **B−** | Four turns with product left uncommitted. |
| Methodology learning readout | **C+** | Repeats known WF-09 Haiku low CITDP friction pattern. |

**Feedback ingest:** N/A. **Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-09)

Pairs [Haiku low split @ 1794582335](trial-readout-PROMPT-WF-09-claudehaiku55low-1794582335-wf-agentstream-wf-09-claude-claudehaiku55low.md). **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-09-1794880253-wf-agentstream-wf-09-claude-claudehaiku55low/evidence/)