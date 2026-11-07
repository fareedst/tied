# Trial readout: PROMPT-WF-01 → Composer 2.5 (Cursor agentstream) → `1794044147-wf-agentstream-wf-01-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → **(harness abort)** — planned `build-plan` → `close-out` via **`workflow-trial-agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794044147-wf-agentstream-wf-01-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-01-cursor-composer25` |
| **Product REQ** | `REQ-SEMVER_SATISFIES` |
| **Cohort comparison** | Same product token as complete [agentstream WF-01 @ 1793604353](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md); this cell **`exit_code: 1`** after refine. Pairs with incomplete [WF-05 @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) harness-failure cohort (2026-11-07). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** baseline four-phase — premature coding vs clean PLAN-only add-feature. **Proof boundary:** `executable_behavior` (not reached).

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | **Cold session** `c21e0e6e-…`. **`RetriableError: WritableIterable is closed`** at launch (stderr). **MCP on turn 1:** `tied_token_create_with_detail` + `tied_validate_consistency` per stdout — stronger tooling than advisory-only refine cells. **Clean boundary:** no product `src/` beyond stack `.gitkeep`. |
| **2** | `refine-plan` | **Agent completed refine** on disk: vocab `semver-comparator.md`, locked grammar, **machine `pre_implementation` gate `allowed: true`** (`…09-40-25-771Z.json`); duplicate gate at `…09-38-58-895Z` (churn). **Harness:** stderr shows `--- turn 2/4 ---` then **manifest finalize with `exit_code: 1`** — **no `session_id` for turn 2**, turns 3–4 never scheduled. **Stdout tail:** agent self-check after interruption (“interrupted turn did not leave work open”). **Inventory stale:** turn 2 still **`pending`** in JSON. |
| **3** | `build-plan` | **Not run** |
| **4** | `close-out` | **Not run** |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.Jqjjg9SXjm.yaml`; ~5.4 min wall (`2026-11-07T09:35:47Z` → `09:41:11Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| semantic version | **VERSION_STRING** — `MAJOR.MINOR.PATCH`, optional `v` | `tied-project/vocab/semver-comparator.md` |
| simple comparator | **COMPARATOR_STRING** + **COMPARATOR_OPERATOR** set | vocab + PLAN |
| one exported function | `satisfies(version, comparator): boolean` (planned) | PLAN; REQ detail |
| invalid input | Return **`false`** (no throw) | PLAN; CITDP |
| run all tests | **`npm test`** | stack table; `package.json` |
| satisfies (implementation) | **Not built** — no `src/**/*.ts` module | — |

---

## What was built

- **Planning / TIED:** `REQ-SEMVER_SATISFIES` (**Draft**); CITDP draft; checklist tracker; adversarial minimal pre-implementation note; **gate-ledger.jsonl**.
- **Gates:** two `pre_implementation` receipts (earlier + final `allowed: true`).
- **Vocab:** client `semver-comparator.md` (refine).
- **Stack:** `wf-trial-ts-node-test-v1` seeded; **`src/.gitkeep` only**.
- **Git:** bootstrap **`d678e8a`** (TIED 4.2.0) only; trial tree **uncommitted**.
- **Orchestrator:** `workflow_trial_agentstream wf-01`, `HARNESS=cursor`, `composer-2.5-fast`.

---

## Outcome record

**Implementation outcome:** **Not started** — `npm test` → **0 tests** (vacuous pass).

**Workflow outcome:** **Incomplete** — orchestrator **`exit_code: 1`** after turn-2 boundary; refine artifacts present.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **not_run** | No close_out receipt |
| **Process contract** | **partial** | add-feature + refine handoffs; **real** pre_implementation gate; no envelope |
| **Adherence ledger** | **partial** | `gate-ledger.jsonl` events; no reconcile |
| **Close-out honesty** | **n/a** | Close-out never reached |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-SEMVER_SATISFIES.yaml` (**uncommitted**) |
| PLAN | `tied-project/working/REQ-SEMVER_SATISFIES/PLAN.md` |
| Gates | `…/gates/pre_implementation-2026-11-07T09-40-25-771Z.json` (+ earlier receipt) |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — turn 2 **`pending`** despite refine handoff |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794044147-wf-agentstream-wf-01-cursor-composer25/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ via MCP; PLAN/tracker/inventory; no product code |
| 2 | `refine-plan` | Locked grammar + vocab; pre_implementation **allowed** — **harness abort** before turn 3 |
| 3 | `build-plan` | **Not executed** |
| 4 | `close-out` | **Not executed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`1`** |
| **Stderr** | Stack seed + preload; `WritableIterable is closed`; turn **1** `session_id=c21e0e6e-…`; turn **2** banner **without** new `session_id`; manifest DIAGNOSTIC (no `expanded_batch` line unlike [WF-05 @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md)) |
| **Stdout** | Full add-feature + refine summaries; post-interruption refine self-audit |

**Friction bullets:**

- `DIAGNOSTIC: materialized WF trial preload contract`
- `RetriableError: WritableIterable is closed` (pre–turn 1)
- Turn 1 completes; turn 2 orchestrator banner then early exit **`1`**
- Inventory not updated for completed refine (automation gap)

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git | Only **`d678e8a`** committed — **pass** “no early src” |
| Uncommitted | Full trial state in working tree only |
| RED | **Absent** |
| Inventory vs disk | **Mismatch** — refine complete on disk, inventory turn 2 **pending** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Product | **No** implementation files |
| `npm test` | **0 tests** — not meaningful |
| Deviation | None — harness failure, not stack waiver |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator grammar + invalid-input rule locked before code |
| Traceability closure | **B−** | REQ **Draft**; MCP token create; no ARCH/IMPL |
| Test strategy | **F** | No RED/GREEN |
| Algorithm / implementation | **F** | No `satisfies()` |
| Process adherence | **B** | Machine pre_implementation gate + ledger; no envelope/verification |
| Workflow choreography | **F** | **`exit_code: 1`**; stale inventory; pilot cell incomplete |
| Methodology learning readout | **B+** | Documents **second** 2026-11-07 Cursor harness abort pattern; refine quality separable from orchestrator reliability |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-01)

Compared with [complete agentstream WF-01 @ 1793604353](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md):

- **Workflow:** peer **four turns + `647c641`**; this cell stops after refine.
- **Product:** peer ships `src/semver-satisfies.ts` + **17 tests**; this cell has **plan-only** state.
- **Harness:** both Composer 2.5 agentstream; this run on **TIED 4.2.0** bootstrap vs historical 4.0.0 class on older cell.

Compared with [WF-05 harness failure @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md):

- Same **`exit_code: 1`** day; WF-05 stderr adds **`expanded_batch: unbound variable`**; WF-01 stderr stops at turn-2 banner — **variant failure signatures**.

No ranking.

---

## Cohort comparisons vs peer WF readouts

Adds a **2026-11-07 Cursor composer-2.5-fast** incomplete row for the **baseline** PROMPT-WF-01 pilot matrix slot, contrasting the **complete** November agentstream reference cell.

---

## TIED 4.2.0 dogfood

Bootstrap **`d678e8a`**. Records harness abort with **implementation stack seeding** and process logs; not an effectiveness claim.

---

## Facilitator follow-ups

- Re-run `workflow-trial-agentstream wf-01` after agentstream/harness fixes (see WF-05 follow-ups).
- Optional: `@build-plan` on subject client to complete product vs [1793604353](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md) behavior matrix.
- Patch inventory turn 2 → **completed** if sponsor treats refine as closed.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF-01 comparison doc](wf-01-four-model-implementation-comparison.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-01-1794044147-wf-agentstream-wf-01-cursor-composer25/PLAN.md)
