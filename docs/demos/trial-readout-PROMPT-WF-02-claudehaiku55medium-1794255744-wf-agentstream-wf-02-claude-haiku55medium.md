# Trial readout: PROMPT-WF-02 → Claude Haiku 5.5 medium (claude agentstream) → `1794255744-wf-agentstream-wf-02-claude-haiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-02`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `haiku-5-5` + effort `medium` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794255744-wf-agentstream-wf-02-claude-haiku55medium` |
| **Factory tag** | `wf-agentstream-wf-02-claude-haiku55medium` |
| **Product REQ** | `REQ-STDIN_LINE_DEDUP_CLI` |
| **TIED methodology version (session)** | **4.2.1** — bootstrap / install_json when session file absent |
| **Cohort comparison** | **REQ-WF_TRIAL_MODEL_EFFORT** matrix batch **1794246*** — model slug + effort tier dogfood |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-02.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1–4** | four-phase | Model-effort bracket / effort CLI ([REQ-WF_TRIAL_MODEL_EFFORT]); see orchestrator stderr |
| **Harness** | — | orchestrator **`exit_code: 0`**; **4** `session_id` lines; WritableIterable: **no** |

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Product scope | `REQ-STDIN_LINE_DEDUP_CLI` | `tied-project/working/REQ-STDIN_LINE_DEDUP_CLI` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | package.json |

---

## What was built

- **Product:** TypeScript `src/`; facilitator **`11`** green tests (`0` fail).
- **TIED:** Stack per working PLAN/REQ on disk.
- **Git:** **`fc7e7f6`** — feat(dedup): add stdin line dedup CLI (**2** commits).
- **Orchestrator:** `model_effort=medium`; wall **498**s.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **11** pass, **0** fail; `tied_validate_consistency` **ok**.

**Workflow outcome:** **Complete** — orchestrator **`exit_code: 0`**.

**Grading outcome:** Session-only bands; not a leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Per four-turn completion |
| **Process contract** | **pass** | Orchestrated four-phase batch |
| **Adherence ledger** | **partial** | minimal depth |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-STDIN_LINE_DEDUP_CLI.yaml` |
| PLAN | `tied-project/working/REQ-STDIN_LINE_DEDUP_CLI/PLAN.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-02-1794255744-wf-agentstream-wf-02-claude-haiku55medium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN scaffold |
| 2 | `refine-plan` | ARCH/IMPL lock |
| 3 | `build-plan` | npm test **11** pass (facilitator) |
| 4 | `close-out` | traceable commit **`fc7e7f6`** when present |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Sessions** | `e7875a32…`, `12e8b360…`, `5d003d1f…`, `c242fe25…` |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **2** commits; HEAD **`fc7e7f6`** |
| Inventory | not captured |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` (expected) |
| Facilitator `npm test` | **11** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Scope and acceptance criteria locked in PLAN for REQ-STDIN_LINE_DEDUP_CLI before RED tests. |
| Traceability closure | **A−** | Project REQ/ARCH/IMPL present with facilitator npm test 11 pass. |
| Test strategy | **A** | Facilitator npm test reports 11 passing with stack wf-trial-ts-node-test-v1. |
| Algorithm / implementation | **A** | Implementation matches PLAN with 11 green facilitator tests. |
| Process adherence | **A−** | Tracker and phase handoffs on disk; minimal-depth adherence ledger typical. |
| Workflow choreography | **A** | Four session_id lines; orchestrator exit_code 0. |
| Methodology learning readout | **A−** | Documents model-effort matrix run without leaderboard framing. |

**Feedback ingest:** N/A (`--skip-feedback-ingest` batch).

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-02)

Model-effort matrix cell — compare sibling readouts in [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) for same PROMPT-WF; no ranking.

---

## TIED version / dogfood

Session **4.2.1** on **REQ-WF_TRIAL_MODEL_EFFORT** bracket slugs — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-02-1794255744-wf-agentstream-wf-02-claude-haiku55medium/evidence/)
