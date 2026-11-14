# Trial readout: PROMPT-WF-04 → Composer 2.5 (Cursor agentstream) → `1794167373-wf-agentstream-wf-04-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-08 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-04`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794167373-wf-agentstream-wf-04-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-04-cursor-composer25` |
| **Product REQ** | `REQ-REQID_MARKER_SCAN_CLI` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** (`capture_path: tied_cli_server_info`, turn **add-feature**); evidence `…/REQ-REQID_MARKER_SCAN_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **Chained batch 1794165*** cell WF-04 after ~49 min prior agentstream; pairs [gold Composer @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) (**workflow complete**, **8/8**, exit **0**) and [luna-low split @ 1794096361](trial-readout-PROMPT-WF-04-luna-low-1794096361-wf-agentstream-wf-04-cursor-lunalow.md) (GREEN uncommitted, orchestrator **0**). Analysis: [wf-trial-range-1794165-composer25-analysis](../../tied-project/non-tied-plans/wf-trial-range-1794165-composer25-analysis/ANALYSIS.md). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

**Catalog stress:** fixture-grounded traceability scan. **Proof boundary:** `executable_behavior` on disk + orchestrator process log + facilitator `npm test` replay.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `9ed2ca81-…`. REQ/PLAN/CITDP/tracker; methodology **4.2.1** session file; stack seeded (`DIAGNOSTIC: WF trial stack seeded`). |
| **2** | `refine-plan` | Session `9cec7b20-…`. RESOLVE locked; ARCH/IMPL + pseudo-code; **`pre_implementation` gate `allowed: false`** (minimal adversarial depth — advisory). |
| **3** | `build-plan` | Harness banner **`--- turn 3/4 (new session) ---`** but **no `session_id` line** in stderr; orchestrator aborts before turn **4**. Product handoff shows **11/11** GREEN. |
| **4** | `close-out` | **Not run** — no close-out handoff; session-handoff requests **`@close-out`**. |

**Cross-turn harness notes:** `RetriableError: WritableIterable is closed` at launch (WF-04/WF-05 only in batch); manifest **`exit_code: 1`**; wall **~8.1 min** (`2026-11-08T19:49:33Z` → `19:57:39Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| comment markers | `REQ-[A-Z0-9_]+` in line/block comments | PLAN § Refine decisions |
| fixture directory | `src/reqid-scan/fixtures/tree/` | PLAN; tests |
| fixture index | One id per line; `#` comments ignored | PLAN; `index-loader` |
| matches / orphans | Index membership partition | `compare-partition` tests |
| unreferenced | Index ids with no marker | PLAN (extends sponsor wording) |
| hermetic tests | No `tied-project/` YAML reads | test-strategy; isolation guard test |
| exit codes | 0 clean, 1 orphans, 2 usage/IO | PLAN; `cli-exit-codes` tests |

---

## What was built

- **Product:** `src/reqid-scan/` — scanner, index loader, compare, report, `cli.ts`; fixture tree under `src/reqid-scan/fixtures/`.
- **Tests:** colocated `src/**/*.test.ts` — facilitator **`npm test` 11/11** pass (includes CLI integration spawn).
- **TIED:** `REQ-REQID_MARKER_SCAN_CLI` + ARCH/IMPL detail files (**uncommitted**); working PLAN/handoffs under `tied-project/working/REQ-REQID_MARKER_SCAN_CLI/`.
- **Stack:** **`wf-trial-ts-node-test-v1`** per inventory (`implementation_stack_id`).
- **Git:** bootstrap **`6b0dd7a`** (TIED **4.2.1**); all product and project YAML deltas **untracked**.
- **Orchestrator:** `workflow_trial_agentstream wf-04`; manifest **`exit_code: 1`**.

---

## Outcome record

**Implementation outcome:** **Delivered (uncommitted)** — facilitator **`npm test` 11/11**; behavior matches PROMPT-WF-04 traceability stress.

**Workflow outcome:** **Incomplete (split signal)** — refine + build artifacts on disk; harness stopped before **close-out**; orchestrator **non-zero**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **missing** | No `close_out` gate receipt; close-out turn not executed |
| **Process contract** | **partial** | Phase handoffs through build-plan; verification manifest + GREEN stdout archive; no envelope |
| **Adherence ledger** | **not_run** | No close-out / reconcile pass |
| **Close-out honesty** | **pass** | Session handoff names **`@close-out`** and unchecked tracker items |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` (**uncommitted**) |
| PLAN | `tied-project/working/REQ-REQID_MARKER_SCAN_CLI/PLAN.md` |
| Gates | `gates/pre_implementation-2026-11-08T19-53-27-475Z.json` only |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — **stale**: turn 1 **complete**; turns 2–4 **pending** despite refine/build handoffs |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-04-1794167373-wf-agentstream-wf-04-cursor-composer25/evidence/build-plan-verification-evidence.md).

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate narrative, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold, PLAN, CITDP draft, methodology capture, stack seed |
| 2 | `refine-plan` | RESOLVE locked; ARCH/IMPL; pre_implementation receipt (blocked); no product code |
| 3 | `build-plan` | `src/reqid-scan/*` GREEN **11** tests; phase-handoff-build-plan; **harness lost session_id / aborted** |
| 4 | `close-out` | **Not run** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794167373-wf-agentstream-wf-04-cursor-composer25/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`1`** |
| **Stdout log** | `…/process.stdout.log` |
| **Stderr log** | `…/process.stderr.log` |

**Friction excerpts (stderr):**

- `DIAGNOSTIC: WF trial stack seeded` for `package.json`, `tsconfig.json`, `src/.gitkeep`
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `DIAGNOSTIC: harness=cursor model=composer-2.5-fast workspace=…/1794167373-wf-agentstream-wf-04-cursor-composer25`
- `RetriableError: WritableIterable is closed` (before turn 1 banner)
- Turn **1** `session_id=9ed2ca81-…`; turn **2** `session_id=9cec7b20-…`
- Turn **3** banner **without** `session_id`; manifest finalize immediately after
- `DIAGNOSTIC: batch=/var/folders/…/traditional-four-phase-batch.yOqSGhJVVR.yaml`

**Cross-check:** Build-plan handoff and GREEN manifest conflict with inventory turn **pending** flags — inventory not updated post-build.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Only **`6b0dd7a`** bootstrap — **no** product commit (**pass** defer-commit heuristic) |
| Inventory vs disk | Refine/build handoffs present; JSON inventory **stale** (**fail** choreography signal) |
| RED evidence | **Absent** — build handoff notes RED not archived |
| Uncertainty | Turn 3 agent work may have run despite missing stderr `session_id` |

---

## Stack compliance

| Check | Result |
| --- | --- |
| **`implementation_stack_id`** | **`wf-trial-ts-node-test-v1`** in interaction inventory |
| Product language | TypeScript ESM under `src/reqid-scan/` |
| Facilitator verify | **`npm test` 11/11** |
| Waivers | None — stack not skipped |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Full RESOLVE table; unreferenced section; exit codes locked before code |
| Traceability closure | **B+** | ARCH/IMPL + pseudo-code on disk uncommitted; REQ index **Planned** |
| Test strategy | **B+** | Eleven hermetic tests + CLI spawn; RED not archived |
| Algorithm / implementation | **A** | Scanner grammar, partition, JSON/text report, exit codes |
| Process adherence | **C+** | Pre_implementation blocked; no envelope/close_out; honest handoffs |
| Workflow choreography | **D+** | Harness **3/4** effective; **`WritableIterable`**; inventory stale; exit **1** |
| Methodology learning readout | **B+** | Documents late-batch harness failure distinct from prompt stress |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. **`WritableIterable`** on chained runs is a harness-axis signal — not proof that WF-04 exceeds Composer capability ([1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md)).

---

## Cross-model notes (PROMPT-WF-04)

[Composer gold @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md): four turns, **`exit_code: 0`**, traceable commits, **8/8** tests — same prompt and stack family.

[luna-low split @ 1794096361](trial-readout-PROMPT-WF-04-luna-low-1794096361-wf-agentstream-wf-04-cursor-lunalow.md): **7/7** green uncommitted with orchestrator **`0`** — inverted harness vs product pattern relative to this cell (**11/11**, exit **1**).

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-08 chained batch 1794165*** Composer **PROMPT-WF-04** row: **implementation delivered**, **workflow incomplete**. Supports two-axis reading in [batch analysis](../../tied-project/non-tied-plans/wf-trial-range-1794165-composer25-analysis/ANALYSIS.md) (harness vs prompt stress).

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** on turn 1. Records **late-batch** `workflow_trial_range` WF-04 under orchestrator logging; **not** an effectiveness claim for **4.2.1** or Composer 2.5.

---

## Facilitator follow-ups

- Optional manual **`@close-out`** on disposable client if sponsor wants envelope + traceable commit.
- Isolated **`workflow_trial_agentstream wf-04`** re-run (not chained 01–05) for harness comparison.
- Refresh interaction inventory if sponsor replays close-out.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Batch analysis](../../tied-project/non-tied-plans/wf-trial-range-1794165-composer25-analysis/ANALYSIS.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-04-1794167373-wf-agentstream-wf-04-cursor-composer25/PLAN.md)
