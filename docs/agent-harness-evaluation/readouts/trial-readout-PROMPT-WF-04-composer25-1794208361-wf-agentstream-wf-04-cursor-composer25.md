# Trial readout: PROMPT-WF-04 → Composer 2.5 (Cursor agentstream) → `1794208361-wf-agentstream-wf-04-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-04`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794208361-wf-agentstream-wf-04-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-04-cursor-composer25` |
| **Product REQ** | `REQ-FIXTURE_COMMENT_MARKER_SCAN` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`**; evidence `…/tied-project/working/REQ-FIXTURE_COMMENT_MARKER_SCAN/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Same **1794205*** batch; see WF-01 readout for matrix note. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-04.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | REQ, PLAN, tracker, draft CITDP, test strategy; no production code. |
| **2** | `refine-plan` | Locked wf-trial-ts-node-test-v1 stack; product decisions; advisory pre_implementation gate copy. |
| **3** | `build-plan` | ARCH/IMPL, pseudo-code, fixtures, RED→GREEN src/, npm test green. |
| **4** | `close-out` | Envelope backfill, close_out gate allowed, traceable commit, phase-handoff-close-out. |

**Cross-turn harness notes:** orchestrator **`exit_code: 0`**; **4** `session_id` lines; WritableIterable: **no**.

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Product scope | `REQ-FIXTURE_COMMENT_MARKER_SCAN` | REQ + PLAN under `tied-project/working/REQ-FIXTURE_COMMENT_MARKER_SCAN/` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | inventory + package |

---

## What was built

- **Product:** TypeScript `src/`; facilitator **`10`** green tests (`0` fail).
- **TIED:** Stack per inventory on disk.
- **Git:** **`856dab8`** — `feat(fixture-scan): REQ-FIXTURE_COMMENT_MARKER_SCAN scanner` (**2** commits on branch).
- **Orchestrator:** `workflow_trial_agentstream wf-04`, **`composer-2.5-fast`**.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **10** pass, **0** fail; `tied_validate_consistency` **`ok: true`**.

**Workflow outcome:** **Complete** — orchestrator **`exit_code: 0`**.

**Grading outcome:** Session-only bands; not a leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Per inventory turn 4 |
| **Process contract** | **pass** | Four-turn inventory |
| **Adherence ledger** | **partial** | Typical minimal depth |
| **Close-out honesty** | **pass** | Align git + tests with claims |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-FIXTURE_COMMENT_MARKER_SCAN.yaml` |
| PLAN | `tied-project/working/REQ-FIXTURE_COMMENT_MARKER_SCAN/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-FIXTURE_COMMENT_MARKER_SCAN/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-04-1794208361-wf-agentstream-wf-04-cursor-composer25/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | undefined — REQ, PLAN, tracker, draft CITDP, test strategy; no production code. |
| 2 | `refine-plan` | undefined — Locked wf-trial-ts-node-test-v1 stack; product decisions; advisory pre_implementation gate copy. |
| 3 | `build-plan` | undefined — ARCH/IMPL, pseudo-code, fixtures, RED→GREEN src/, npm test green. |
| 4 | `close-out` | undefined — Envelope backfill, close_out gate allowed, traceable commit, phase-handoff-close-out. |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Sessions** | `bbdbf279…`, `514337cf…`, `d7fff8f1…`, `aff9e0fd…` |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **2** commits; HEAD **`856dab8`** |
| Inventory | Gaps in turn status |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **10** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator scope and invalid-input rule were locked in PLAN before implementation. |
| Traceability closure | **A−** | Decision records and code mostly align; traceability gaps remain vs full stack promotion. |
| Test strategy | **A** | 10 green tests cover core behavior with archived RED/GREEN evidence. |
| Algorithm / implementation | **A−** | Shipped behavior matches PROMPT shape; limits leave some fault paths lightly exercised. |
| Process adherence | **A−** | Tracker and handoffs present; adherence ledger or envelope thinner than strict depth. |
| Workflow choreography | **A** | Four orchestrated turns with exit_code 0 and phase handoffs on disk. |
| Methodology learning readout | **A−** | Readout documents cohort friction (harness vs close-out) without turning into a model leaderboard. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-04)

Compare with [grok47-med @ 1794191005](trial-readout-PROMPT-WF-04-grok47-med-1794191005-wf-agentstream-wf-04-cursor-grok47med.md) and prior Composer cells in [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) — no ranking.

---

## TIED version / dogfood

Session **4.2.1** — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-04-1794208361-wf-agentstream-wf-04-cursor-composer25/evidence/)
