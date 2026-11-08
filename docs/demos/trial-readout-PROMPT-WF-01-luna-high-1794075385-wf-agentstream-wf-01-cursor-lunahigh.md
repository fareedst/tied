# Trial readout: PROMPT-WF-01 → GPT-5.6 Luna high (Cursor agentstream) → `1794075385-wf-agentstream-wf-01-cursor-lunahigh`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `luna-high` |
| **Model slug** | `gpt-5.6-luna-high-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794075385-wf-agentstream-wf-01-cursor-lunahigh` |
| **Factory tag** | `wf-agentstream-wf-01-cursor-lunahigh` |
| **Product REQ** | `REQ-SEMVER_COMPARATOR` |
| **TIED methodology version (session)** | **4.2.1** — source **`tied_cli_server_info`** (`install_json` on capture file); evidence `…/REQ-SEMVER_COMPARATOR/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **luna-high** Cursor agentstream **PROMPT-WF-01** readout; contrasts Composer incomplete [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md) (`exit_code: 1`, refine only) and luna-med partial [1794050603](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md) (build without close-out). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** baseline four-phase — premature coding vs clean PLAN-only add-feature. **Proof boundary:** `executable_behavior` not reached; orchestrator **`exit_code: 0`** with four sessions ≠ delivery.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `44adddc2-…`. Clean scaffold: REQ draft, CITDP, PLAN, tracker, session methodology file; **`src/.gitkeep` only**. |
| **2** | `refine-plan` | Session `e74d0df6-…`. **No refine handoff artifacts** on disk; inventory notes refine absent. |
| **3** | `build-plan` | Session `3585c596-…`. **No ARCH/IMPL, product `src/*.ts`, or RED/GREEN evidence.** |
| **4** | `close-out` | Session `818122a3-…`. Envelope validated **0** blocking gaps; **`tied_gate_check` `close_out` → `allowed: false`**; traceable commit skipped. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.Wwp4kzzVHM.yaml`; ~7.6 min wall (`2026-11-07T18:16:26Z` → `18:24:00Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| semantic version | Basic `major.minor.patch`; malformed → **`false`** | PLAN; add-feature handoff |
| simple comparator | Operators `<`, `<=`, `=`, `>=`, `>` | PLAN scope |
| one exported function | Planned public comparator API (not implemented) | PLAN — no `src/*.ts` |
| run all tests | **`npm test`** (`wf-trial-ts-node-test-v1`) | stack table; vacuous **0/0** on replay |
| satisfies (implementation) | **Not built** | — |

---

## What was built

- **Planning / TIED:** `REQ-SEMVER_COMPARATOR` scaffold (uncommitted indexes + working folder); draft CITDP; checklist tracker; interaction inventory updated at close-out.
- **Product:** **None** — `src/.gitkeep` only; facilitator `npm test` → **0/0** (vacuous pass).
- **Stack:** `wf-trial-ts-node-test-v1` seeded (`package.json`, `tsconfig.json` uncommitted).
- **Git:** bootstrap **`be9fd8a`** (TIED **4.2.1**) only; trial tree **uncommitted**.
- **Orchestrator:** `MODEL_SLUG=gpt-5.6-luna-high-fast` `MODEL_CONFIG=luna-high` `HARNESS=cursor` `workflow_trial_agentstream wf-01`; manifest **`exit_code: 0`**, **four** `session_id` lines in stderr.

**Uncommitted (expected disposable drift):** `tied-project/working/wf-trial-orchestrator-run/`, product stack files, REQ working tree.

---

## Outcome record

**Implementation outcome:** **Not started** — no comparator module or tests.

**Workflow outcome:** **Incomplete at close-out** — all four harness turns executed with shell **`0`**, but machine **`close_out` blocked**; refine/build phases left no artifacts.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` → `allowed: false`; no close_out gate receipt |
| **Process contract** | **partial** | add-feature handoff + envelope **0** blocking gaps; tracker still pending refine/test-strategy |
| **Adherence ledger** | **not_run** | Blocked before reconcile |
| **Close-out honesty** | **pass** | Handoff documents blocked gate and skipped commit |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-SEMVER_COMPARATOR.yaml` (**uncommitted**) |
| PLAN | `tied-project/working/REQ-SEMVER_COMPARATOR/PLAN.md` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — sponsor turns 2–3 **absent** on disk; turn 4 **incomplete** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794075385-wf-agentstream-wf-01-cursor-lunahigh/evidence/build-plan-verification-evidence.md) — facilitator `npm test` **0/0**; `tied_validate_consistency` replay on subject client.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN/tracker/CITDP draft; methodology **4.2.1** capture |
| 2 | `refine-plan` | **No refine artifacts** — inventory notes gap |
| 3 | `build-plan` | **No product or RED evidence** |
| 4 | `close-out` | Envelope ok; **gate blocked**; commit skipped |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794075385-wf-agentstream-wf-01-cursor-lunahigh/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~7.6 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-high-fast … dry_run=0`
- `--- turn 1/4 (new session) ---` / `session_id=44adddc2-2980-4595-b52f-0d965b4c8078`
- `--- turn 2/4 …` / `session_id=e74d0df6-c4e3-467e-bde6-f916f5cb9c53`
- `--- turn 3/4 …` / `session_id=3585c596-665c-4d34-bd26-bc35ee6e9c7f`
- `--- turn 4/4 …` / `session_id=818122a3-1aa1-4cc2-8725-6dda623ea7d2`
- Manifest finalize **`exit_code: 0`**

**Cross-check:** Shell **`0`** contrasts with [luna-med WF-01 @ 1794050603](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md) **`exit_code: 1`** despite that cell shipping uncommitted **6** green tests — matrix operators must treat harness exit separately from product delivery.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Single bootstrap **`be9fd8a`** — **pass** “no early src” heuristic |
| Inventory vs git | Four harness turns; **no** product commit |
| RED evidence | **Absent** |
| Uncertainty | Turns 2–3 may have run without persisting handoffs — **heuristic** from disk only |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | **`src/.gitkeep` only** |
| Facilitator `npm test` | **0** tests (vacuous pass) |
| `npm run typecheck` | Present in `package.json`; not required for empty suite |
| Deviation | None on stack seeding |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | add-feature PLAN bounds comparator; refine never landed |
| Traceability closure | **C+** | Scaffold + envelope only; no ARCH/IMPL or implementation |
| Test strategy | **F** | No tests authored |
| Algorithm / implementation | **F** | No product code |
| Process adherence | **C** | Honest blocked close-out; envelope built |
| Workflow choreography | **B−** | Four sessions + orchestrator **`0`**; phase artifacts missing for 2–3 |
| Methodology learning readout | **B** | Documents **harness-complete / delivery-empty** split on **luna-high** WF-01 @ **4.2.1** |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-01)

Compared with [Composer incomplete @ 1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md): peer stops at turn 2 with **`exit_code: 1`** and refine on disk; this cell runs four turns with **`0`** but **no** refine/build artifacts.

Compared with [luna-med @ 1794050603](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md): peer delivers **6** green tests uncommitted and **skips** close-out with harness **`1`**; this cell runs close-out, blocks at gate, and ships **no** product.

Compared with [Composer complete @ 1794048393](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md): complete delivery + traceable commit remains the bar neither luna cell cleared in this cohort slice.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the **2026-11-07 Cursor luna-high / `gpt-5.6-luna-high-fast`** row for **PROMPT-WF-01**, illustrating **clean add-feature** under orchestrator **`exit_code: 0`** while **failing** the catalog’s executable-behavior proof boundary.

---

## TIED version / dogfood

Session capture file records **TIED 4.2.1** on turn 1 (`tied_cli_server_info`). Records four-phase harness on **luna-high** with bootstrap pin **`be9fd8a`**; **not** an effectiveness claim for TIED 4.2.1 or GPT-5.6 Luna.

---

## Facilitator follow-ups

- Reconcile why turns 2–3 left no handoffs despite stderr session ids (stdout tee review).
- Optional re-run after refine-plan lands to test premature-coding guard on **luna-high**.
- Promote uncommitted REQ scaffold only if sponsor wants git hygiene beyond bootstrap pin.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-01-1794075385-wf-agentstream-wf-01-cursor-lunahigh/PLAN.md)
