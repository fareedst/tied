# Trial readout: PROMPT-WF-01 → Composer 2.5 (Cursor agentstream) → `1794048393-wf-agentstream-wf-01-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794048393-wf-agentstream-wf-01-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-01-cursor-composer25` |
| **Product REQ** | `REQ-SEMVER_SATISFIES` |
| **Cohort comparison** | **Success pair** for same-day incomplete [WF-01 @ 1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md) (`exit_code: 1` after refine); aligns with complete reference [WF-01 @ 1793604353](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** baseline four-phase — premature coding vs clean PLAN-only add-feature. **Proof boundary:** `executable_behavior`.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Fresh session `718fb6b4-…`. MCP token create + consistency checks per handoff. **Clean boundary:** no product `src/*.ts` beyond stack `.gitkeep`. |
| **2** | `refine-plan` | Session `aca77df4-…`. Locked comparator grammar + vocab; advisory pre-implementation gate. |
| **3** | `build-plan` | Session `0fe625b4-…`. RED/GREEN archived in quality manifest; single feature commit deferred to close-out per playbook. |
| **4** | `close-out` | Session `abf078f5-…`. Close-out gate **`allowed: true`**; `tied_verify` promoted REQ **Implemented**; orchestrator **`exit_code: 0`**. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.exQGc8UgZe.yaml`; ~12.5 min wall (`2026-11-07T10:46:34Z` → `10:59:01Z`). **No** `WritableIterable is closed` or turn-2 abort (contrast [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md)).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| semantic version | **VERSION_STRING** — `MAJOR.MINOR.PATCH`, optional `v` | `tied-project/vocab/semver-comparator.md` |
| simple comparator | **COMPARATOR_STRING** — `>=`, `<=`, `>`, `<`, `=`, `==` + version | vocab + PLAN |
| one exported function | `satisfies(version, comparator): boolean` | `src/semver-satisfies.ts` |
| invalid input | Return **`false`** (no throw) | CITDP; tests |
| run all tests | **`npm test`** | `package.json`, README |

---

## What was built

- **Library:** `src/semver-satisfies.ts` + colocated **`node:test`** suite (**9** cases).
- **TIED stack:** REQ **Implemented**; `ARCH-SEMVER_SATISFIES`, `IMPL-SEMVER_SATISFIES` + pseudo-code sidecar; CITDP at `tied-project/citdp/CITDP-REQ-SEMVER_SATISFIES.yaml`.
- **Git:** bootstrap **`1fa1e9d`** (TIED **4.2.0**); feature **`a2f82ac`** `feat(semver): add satisfies comparator helper`.
- **Orchestrator:** `workflow_trial_agentstream wf-01`, `HARNESS=cursor`, `composer-2.5-fast`, **`wf-trial-ts-node-test-v1`**.

---

## Outcome record

**Implementation outcome:** **Successful** — facilitator `npm test` **9/9**; `npm run typecheck` pass; `tied_validate_consistency` **`ok: true`**.

**Workflow outcome:** **Complete** — orchestrator **`exit_code: 0`**; interaction inventory marks all four turns **completed**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `checklist-gate-receipt-close_out.v1.json` → `allowed: true`, depth `minimal` |
| **Process contract** | **pass** | Envelope build/validate; verification manifest; CITDP persisted; phase handoffs for all four turns |
| **Adherence ledger** | **partial** | Thin-ledger waiver at minimal depth (no `gate-ledger.jsonl`; reconcile **not_run** per close-out handoff) |
| **Close-out honesty** | **pass** | REQ **`Implemented`** after `tied_verify`; contrasts Draft lag on [1793604353](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md) |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-SEMVER_SATISFIES.yaml` (**Implemented**) |
| PLAN | `tied-project/working/REQ-SEMVER_SATISFIES/PLAN.md` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — four turns **completed** + `close_out_gate_receipt` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794048393-wf-agentstream-wf-01-cursor-composer25/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ via MCP; PLAN/tracker/inventory; no product TypeScript |
| 2 | `refine-plan` | Locked grammar + vocab; pre-implementation advisory gate |
| 3 | `build-plan` | RED → GREEN; `src/semver-satisfies.ts`; verification manifest |
| 4 | `close-out` | Envelope validate; close_out gate; traceable commit **`a2f82ac`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~12.4 min |
| **Stderr** | Stack seed + preload; four turn banners each with distinct **`session_id`**; manifest finalize DIAGNOSTIC |

**Friction bullets:**

- `DIAGNOSTIC: WF trial stack seeded` — `package.json`, `tsconfig.json`, `src/.gitkeep`
- `DIAGNOSTIC: materialized WF trial preload contract`
- `--- turn N/4 (new session) ---` — sessions `718fb6b4`, `aca77df4`, `0fe625b4`, `abf078f5`
- `DIAGNOSTIC: wf-trial process log manifest=…` — clean teardown
- **Absent:** `RetriableError: WritableIterable is closed` (present on [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md))

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`1fa1e9d`** bootstrap only before **`a2f82ac`** product + TIED feature commit — **pass** “no early src” |
| Inventory vs git | All four turns **completed**; matches close-out handoff |
| Uncertainty | Per-turn SHAs not in inventory; agentstream may batch commits at close-out — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Product | `src/**/*.ts` only |
| `npm test` | **9** passed |
| `npm run typecheck` | pass |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator grammar + invalid-input rule locked before code |
| Traceability closure | **A** | Full R+A+I; REQ **Implemented**; facilitator consistency **ok** |
| Test strategy | **A−** | RED/GREEN archived; **9** cases (leaner than [1793604353](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md) **17**) |
| Algorithm / implementation | **A** | Clear parse/compare; honest single-comparator scope |
| Process adherence | **A−** | Machine close_out + envelope; CITDP persisted; thin adherence ledger |
| Workflow choreography | **A** | Four sessions; inventory complete; orchestrator **`exit_code: 0`** |
| Methodology learning readout | **A−** | Documents **success cell** paired with same-day harness abort — separates shell fix from agent refine quality |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-01)

Compared with [incomplete WF-01 @ 1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md) (same tag, same model, same day):

- **Harness:** peer stops at turn 2 with **`exit_code: 1`** and stale inventory; this cell runs turns 3–4 and finalizes **`0`**.
- **Product:** peer has plan-only state; this cell ships **`a2f82ac`** with green tests.

Compared with [complete WF-01 @ 1793604353](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md):

- **Tests:** reference **17** `node:test` cases; this cell **9** (still covers operators + invalid input).
- **REQ status:** this cell **`Implemented`** after close-out vs reference **Draft** lag.
- **TIED bootstrap:** **4.2.0** here vs historical **4.0.0** class on reference.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds a **2026-11-07 Cursor composer-2.5-fast** **complete** row for PROMPT-WF-01, closing the pilot pairing with the incomplete harness-abort cell on the same orchestrator recipe.

---

## TIED 4.2.0 dogfood

Bootstrap **`1fa1e9d`**. Records successful four-phase agentstream on the TypeScript trial stack with default process logs; **not** an effectiveness claim for TIED 4.2.0 or Composer 2.5.

---

## Facilitator follow-ups

- Optional: run `tied_adherence_reconcile_run` if sponsor wants ledger **pass** vs thin waiver.
- Cohort: treat **1794044147 + 1794048393** as harness-reliability pairing when scoring methodology learning.
- Store: [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../../tied-project/requirements/REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT.yaml) close-out may cite this cell as post-fix success evidence.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF-01 comparison doc](wf-01-four-model-implementation-comparison.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-01-1794048393-wf-agentstream-wf-01-cursor-composer25/PLAN.md)
