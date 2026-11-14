# Trial readout: PROMPT-WF-01 → GPT-5.6 Luna medium (Cursor agentstream) → `1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → **(harness abort)** — planned `close-out` via **`workflow-trial-agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `luna-med` (pilot matrix) / orchestrator `gpt-5.6-luna-medium-fast` |
| **Model slug** | `gpt-5.6-luna-medium-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast` |
| **Factory tag** | `wf-agentstream-wf-01-cursor-gpt56lunamediumfast` |
| **Product REQ** | `REQ-WF_TRIAL_SEMVER_SATISFACTION` |
| **TIED methodology version (session)** | **4.2.0** — source **bootstrap pin** (`tied-bundle/install.json` → `tied_version`); evidence `…/tied-bundle/install.json` — **not** session MCP capture (no `tied-methodology-version.session.v1.json` on client) |
| **Cohort comparison** | First **luna-med** Cursor agentstream WF-01 readout; contrasts complete Composer cells [1794048393](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md) and incomplete [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** baseline four-phase — premature coding vs clean PLAN-only add-feature. **Proof boundary:** `executable_behavior` reached at build-plan; **traceable commit** not reached (close-out absent).

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `e9c648fd-…`. Launch **`RetriableError: WritableIterable is closed`** (stderr). Linked skill notes missing canonical `tied-cli.sh`; consistency still reported pass on turn 1. **Clean boundary:** no product `src/*.ts` beyond stack `.gitkeep`. |
| **2** | `refine-plan` | Session `f773ad96-…`. YAML index formatting fixes; full R+A+I + pseudo-code; direct project YAML when MCP skill path unavailable (documented in handoff). |
| **3** | `build-plan` | Turn banner in stderr **without** trailing `session_id` before manifest finalize. Stale tracker shape fixed pre-RED; RED archived; **`tsx` install** friction on first `npm test`. **Agent artifacts on disk:** `src/semver.ts`, **6** green tests, verification gate **allowed**, `tied_verify` promoted REQ index **Implemented** — **stdout log truncated** mid-narrative. |
| **4** | `close-out` | **Not run** — no envelope, no `close_out` gate, no feature commit. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.QFwSAAc9OV.yaml`; ~16.8 min wall (`2026-11-07T11:23:23Z` → `11:40:13Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| semantic version | **VERSION_STRING** — strict `MAJOR.MINOR.PATCH` | PLAN + `IMPL-WF_TRIAL_SEMVER_COMPARATOR` |
| simple comparator | Operators `>=`, `<=`, `>`, `<`, `=` + target version | PLAN; `src/semver.ts` |
| one exported function | `satisfiesSemver(version, comparator): boolean` | `src/semver.ts` |
| invalid input | Return **`false`** (no throw) | Tests + IMPL contract |
| run all tests | **`npm test`** | `package.json` |

---

## What was built

- **Library:** `src/semver.ts` + colocated **`node:test`** suite (**6** cases).
- **TIED stack:** REQ index **Implemented** (via build-plan `tied_verify`); `ARCH-WF_TRIAL_SEMVER_COMPARATOR`, `IMPL-WF_TRIAL_SEMVER_COMPARATOR` + pseudo-code; CITDP at `tied-project/citdp/CITDP-REQ-WF_TRIAL_SEMVER_SATISFACTION.yaml`.
- **Git:** bootstrap **`7b12d64`** (TIED **4.2.0**) only; **full trial tree uncommitted** (close-out never ran).
- **Orchestrator:** `workflow_trial_agentstream wf-01`, `HARNESS=cursor`, `gpt-5.6-luna-medium-fast`, **`wf-trial-ts-node-test-v1`**.

---

## Outcome record

**Implementation outcome:** **Partial success** — facilitator `npm test` **6/6**; `npm run typecheck` pass; `tied_validate_consistency` **`ok: true`**; no traceable product commit.

**Workflow outcome:** **Incomplete** — orchestrator **`exit_code: 1`** after turn-3 boundary; **`close-out` not executed**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **not_run** | No `close_out` gate receipt |
| **Process contract** | **partial** | add-feature + refine + build handoffs; verification gate **allowed**; no request-evidence envelope |
| **Adherence ledger** | **thin** | Single verification `gate_decided` event |
| **Close-out honesty** | **gap** | REQ index **Implemented** without close-out commit — sponsor should treat as **build-plan stop** until manual close-out |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-WF_TRIAL_SEMVER_SATISFACTION.yaml` (**Implemented** index) |
| PLAN | `tied-project/working/REQ-WF_TRIAL_SEMVER_SATISFACTION/PLAN.md` |
| Verification | `…/gates/verification-2026-11-07T11-39-00-666Z.json`; manifest under `evidence/verification-evidence-manifest.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — stack/harness metadata only (**no per-turn completion rows**) |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN/tracker/CITDP; no product TypeScript |
| 2 | `refine-plan` | Locked grammar + R+A+I + pseudo-code; no product code |
| 3 | `build-plan` | RED/GREEN archived; **`satisfiesSemver`** + **6** tests; verification gate — **harness `exit_code: 1`** before turn 4 |
| 4 | `close-out` | **Not executed** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`1`** |
| **Wall time** | ~16.8 min |
| **Stderr** | Stack seed + preload; `WritableIterable is closed`; turn **1** `session_id=e9c648fd-…`; turn **2** `session_id=f773ad96-…`; turn **3** banner **without** new `session_id`; manifest DIAGNOSTIC (no turn **4**) |

**Friction bullets:**

- `DIAGNOSTIC: WF trial stack seeded` — `package.json`, `tsconfig.json`, `src/.gitkeep`
- `DIAGNOSTIC: materialized WF trial preload contract`
- `RetriableError: WritableIterable is closed` (pre–turn 1)
- `--- turn 1/4 (new session) ---` / `session_id=e9c648fd-4c39-4039-8ccd-fdedf4fa6ae1`
- `--- turn 2/4 (new session) ---` / `session_id=f773ad96-defb-4b84-a0a2-583fbc7452c3`
- `--- turn 3/4 (new session) ---` then immediate manifest finalize — **variant** vs [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md) (abort after turn 2)
- **Stdout** ends during build-plan (`tsx` dependency install narrative) — disk state richer than log tail

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Only **`7b12d64`** committed — product **`src/`** exists **uncommitted** (expected when close-out skipped) |
| Plan vs git | build-plan handoff claims complete; **no** feature SHA |
| Inventory vs disk | Inventory lacks turn rows — **cannot** cross-check choreography automatically |
| Uncertainty | Harness may finalize manifest while turn-3 agent still flushing handoffs — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Product | `src/semver.ts`, `src/semver.test.ts` |
| `npm test` | **6** passed |
| `npm run typecheck` | pass |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator grammar + malformed-input rule locked before code |
| Traceability closure | **B** | Full R+A+I + pseudo-code; REQ **Implemented** via verify without close-out envelope/commit |
| Test strategy | **A−** | RED/GREEN archived; **6** cases (lean vs **9–17** on complete WF-01 peers) |
| Algorithm / implementation | **A−** | Clear parse/compare; `=` operator (peer cells often document `==` tolerance) |
| Process adherence | **B−** | Verification gate + build handoff; missing close-out + thin inventory |
| Workflow choreography | **D+** | **`exit_code: 1`**; turn 4 absent — **post-build** harness abort (agent work further than [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md)) |
| Methodology learning readout | **A−** | Documents **third** 2026-11-07 `WritableIterable` signature with **build-plan artifacts surviving** abort — separates agent build quality from shell reliability |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-01)

Compared with [incomplete Composer WF-01 @ 1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md):

- **Depth:** peer stops after refine (**no** `src/` implementation); this cell ships green **`satisfiesSemver`** tests.
- **Harness:** both show `WritableIterable is closed`; peer aborts after turn **2** banner; this cell reaches turn **3** banner then **`exit_code: 1`**.

Compared with [complete Composer WF-01 @ 1794048393](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md):

- **Workflow:** peer **four turns + `exit_code: 0` + `a2f82ac`**; this cell missing close-out and commit.
- **Model:** first published **luna-med** agentstream baseline vs **composer-2.5-fast** success pair.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the first **2026-11-07 Cursor GPT-5.6 Luna medium-fast** row for PROMPT-WF-01, capturing a **post-build harness abort** that still leaves executable product code on disk — distinct from plan-only incomplete cells.

---

## TIED version / dogfood

Bootstrap **`7b12d64`** / `install.json` **`tied_version`: 4.2.0** (**bootstrap pin**, not session MCP). Records agentstream choreography stress with default process logs; **not** an effectiveness claim for TIED 4.2.0 or Luna medium.

---

## Facilitator follow-ups

- Optional manual **`@close-out`** on subject client if sponsor wants traceable commit and envelope without re-running orchestrator.
- Pair with a **luna-med success cell** when harness reliability allows four turns at `exit_code: 0`.
- Store: cite this cell under [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../../tied-project/requirements/REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT.yaml) as **post-build abort** evidence (agent progressed past refine-only failures).

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF-01 comparison doc](wf-01-four-model-implementation-comparison.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-01-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast/PLAN.md)
