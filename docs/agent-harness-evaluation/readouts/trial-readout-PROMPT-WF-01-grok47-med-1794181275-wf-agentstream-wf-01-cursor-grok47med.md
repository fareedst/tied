# Trial readout: PROMPT-WF-01 → Grok 4.7 medium (Cursor agentstream) → `1794181275-wf-agentstream-wf-01-cursor-grok47med`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `grok47-med` |
| **Model slug** | `grok-4.7-medium-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794181275-wf-agentstream-wf-01-cursor-grok47med` |
| **Factory tag** | `wf-agentstream-wf-01-cursor-grok47med` |
| **Product REQ** | `REQ-SEMVER_SATISFIES` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`**; evidence `…/tied-project/working/REQ-SEMVER_SATISFIES/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **grok47-med** full-matrix WF-01 on **4.2.1**; pairs oracle field cases in [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE](../../tied-project/working/REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE/evidence/field-case-1794185608.md). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-01. **Proof boundary:** executable_behavior unless catalog row says otherwise.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Scaffolded REQ-SEMVER_SATISFIES, PLAN, tracker, and draft CITDP. No product code. |
| **2** | `refine-plan` | Locked stack wf-trial-ts-node-test-v1. pre_implementation gate allowed. |
| **3** | `build-plan` | RED then GREEN for satisfies. npm test exit 0. verification gate allowed. Close-out deferred. |
| **4** | `close-out` | close_out allowed true. Envelope blocking_gaps 0. Reconcile process_grade B with thin_ledger warn. Single traceable commit. |

**Cross-turn harness notes:** orchestrator **`exit_code: 0`**; **4** distinct `session_id` lines (510f1445, 3ea5cc6b, 927fa846, f435643b…); WritableIterable in stderr: **no**.

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| (facilitator) | `REQ-SEMVER_SATISFIES` | REQ index + PLAN under `tied-project/working/REQ-SEMVER_SATISFIES/` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | inventory + `package.json` |

---

## What was built

- **Product:** TypeScript under `src/` with facilitator **`7/7`** green `node:test` cases.
- **TIED:** REQ/ARCH/IMPL + CITDP on disk; close-out handoff per inventory.
- **Git:** feature **`6c0ab53`** `feat(semver): add satisfies comparator` (bootstrap + traceable feature pattern).
- **Orchestrator:** `workflow_trial_agentstream wf-01`, **`grok-4.7-medium-fast`**, **`wf-trial-ts-node-test-v1`**.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **7/7**; `tied_validate_consistency` **`ok: true`**.

**Workflow outcome:** **Complete** — orchestrator **`exit_code: 0`**; inventory marks four sponsor turns **completed**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Inventory turn 4 `close_out_gate_receipt` when present |
| **Process contract** | **pass** | Four-turn handoffs; envelope/gates per close-out notes |
| **Adherence ledger** | **partial** | Typical minimal-depth thin ledger unless reconcile run |
| **Close-out honesty** | **pass** | Traceable commit **`6c0ab53`** with green tests |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-SEMVER_SATISFIES.yaml` |
| PLAN | `tied-project/working/REQ-SEMVER_SATISFIES/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-SEMVER_SATISFIES/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794181275-wf-agentstream-wf-01-cursor-grok47med/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | complete — Scaffolded REQ-SEMVER_SATISFIES, PLAN, tracker, and draft CITDP. No product code. |
| 2 | `refine-plan` | complete — Locked stack wf-trial-ts-node-test-v1. pre_implementation gate allowed. |
| 3 | `build-plan` | complete — RED then GREEN for satisfies. npm test exit 0. verification gate allowed. Close-out deferred. |
| 4 | `close-out` | complete — close_out allowed true. Envelope blocking_gaps 0. Reconcile process_grade B with thin_ledger warn. Single traceable comm |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Stderr** | Stack seed; four turn banners; **4** `session_id=` lines |

**Friction bullets:**

- `DIAGNOSTIC: WF trial stack seeded` — TypeScript trial stack
- Four `--- turn N/4 (new session) ---` banners
- Session ids: `510f1445…`, `3ea5cc6b…`, `927fa846…`, `f435643b…`
- WritableIterable: **no**

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **Two commits** — bootstrap then feature **`6c0ab53`** |
| Inventory vs git | Four turns **completed** |
| Uncertainty | Per-turn SHAs not in inventory — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **7** passed |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Contract locked in refine before code |
| Traceability closure | **A−** | R+A+I + CITDP; facilitator consistency **true** |
| Test strategy | **A** | GREEN suite **7** cases |
| Algorithm / implementation | **A−** | Matches PROMPT-WF-01 scope |
| Process adherence | **A−** | close_out + envelope pattern |
| Workflow choreography | **A** | Four sessions; inventory complete; orchestrator **`0`** |
| Methodology learning readout | **A−** | Documents **grok47-med** cell on **4.2.1** matrix |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; compare harness exit with facilitator `npm test` and inventory.

---

## Cross-model notes (PROMPT-WF-01)

First published **grok47-med** readout for this prompt on **4.2.1**. Compare with [Composer 2.5](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) and [luna-low / luna-high](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) cells when cohort claims matter — no ranking.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-09 Cursor grok-4.7-medium-fast** **workflow complete** row for PROMPT-WF-01 in the **179418***…**179420*** batch (eight-prompt matrix).

---

## TIED version / dogfood

Session **4.2.1** on disposable bootstrap — records successful four-phase agentstream on the TypeScript trial stack; **not** an effectiveness claim.

---

## Facilitator follow-ups

- Optional `tied_adherence_reconcile_run` if sponsor wants ledger **pass** vs thin waiver.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-01-1794181275-wf-agentstream-wf-01-cursor-grok47med/evidence/)
