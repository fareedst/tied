# Trial readout: PROMPT-WF-05 → GPT-5.6 Luna medium (Cursor agentstream) → `1794052043-wf-agentstream-wf-05-cursor-lunamed`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-05`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `luna-med` |
| **Model slug** | `gpt-5.6-luna-medium-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794052043-wf-agentstream-wf-05-cursor-lunamed` |
| **Factory tag** | `wf-agentstream-wf-05-cursor-lunamed` |
| **Product REQ** | `REQ-CSV_ROW_OBJECT_MAPPING` |
| **TIED methodology version (session)** | **4.2.0** — source **`tied_cli_server_info`** via `tied-methodology-version.session.v1.json` (turn 1); evidence `…/REQ-CSV_ROW_OBJECT_MAPPING/evidence/tied-methodology-version.session.v1.json` (file also records `install_json` fallback label) |
| **Cohort comparison** | First **luna-med** Cursor agentstream **PROMPT-WF-05** readout; contrasts Composer complete [1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) (`exit_code: 0`) and same-day luna WF-01 harness abort [1794050603](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md) (close-out not run). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

**Catalog stress:** refine expands edges — empty-file acceptance criteria before implementation. **Proof boundary:** `executable_behavior` + workflow gate receipts + orchestrator process log + facilitator git replay.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `b162f8d7-…`. Launch **`RetriableError: WritableIterable is closed`** (stderr). Clean scaffold; **`tied-methodology-version.session.v1.json`** captured via CLI `server_info`. |
| **2** | `refine-plan` | Session `edb30e57-…`. Locked `mapCsvRows` API, malformed-input throws, empty/header-only → `[]`. |
| **3** | `build-plan` | Session `735f28d2-…`. RED → GREEN; **6** tests; product paths under `src/csv-row-object-mapping.ts`. |
| **4** | `close-out` | Turn banner **without** trailing `session_id` in stderr. Agent backfilled envelope + gate receipts; single traceable commit **`3b01a3b`** (product + close-out evidence bundled). Orchestrator still reports **`exit_code: 1`**. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.9wQV6Ygujb.yaml`; ~17.6 min wall (`2026-11-07T11:47:24Z` → `12:05:01Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| header row | First row supplies object keys; never returned as data | PLAN; `mapCsvRows` contract |
| string columns | **STRING_CELL** — all values remain strings | AC; tests |
| zero data rows / empty files | **EMPTY_INPUT** / **HEADER_ONLY** → `[]` without error | Locked in refine before code |
| header-only test | Colocated `node:test` case | `src/csv-row-object-mapping.test.ts` |
| one data row test | Colocated case | same file |
| library API | `mapCsvRows(input: string): Array<Record<string, string>>` | `src/csv-row-object-mapping.ts` |

---

## What was built

- **Product:** `mapCsvRows` with quoting, escaped quotes, rectangular validation, and malformed-input throws; **6** colocated tests.
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator `npm test` / `npm run typecheck` green.
- **TIED:** `REQ-CSV_ROW_OBJECT_MAPPING` index **Implemented**; ARCH/IMPL + pseudo-code; CITDP persisted; four phase handoffs; inventory **four turns completed**.
- **Git:** bootstrap **`4a01162`** (TIED **4.2.0**); traceable **`3b01a3b`** (product + REQ evidence + close-out gate/envelope in one commit).
- **Orchestrator:** `MODEL_SLUG=gpt-5.6-luna-medium-fast` `MODEL_CONFIG=luna-med` `HARNESS=cursor` `workflow_trial_agentstream wf-05`.

**Uncommitted (excluded from traceable scope):** `tied-project/working/wf-trial-orchestrator-run/`, `agent-preload-contract.yaml`, `working/` alias — expected harness drift.

---

## Outcome record

**Implementation outcome:** **Delivered** — parser + tests; facilitator **6/6**; REQ index **Implemented**.

**Workflow outcome:** **Split signal** — machine `close_out` **pass** + four-turn inventory; orchestrator manifest **`exit_code: 1`** (turn-4 `session_id` missing in stderr; launch `WritableIterable` error).

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `closeout-gate-receipt.v1.json` → `allowed: true`, envelope **0** blocking gaps |
| **Process contract** | **pass** | Envelope build/validate; verification manifest; CITDP on disk; committed in **`3b01a3b`** |
| **Adherence ledger** | **thin** | Minimal depth; no adversarial inquiry artifacts — expected |
| **Close-out honesty** | **pass** with harness drift | Traceable commit exists; orchestrator exit **1** documents harness finalize ≠ agent close-out success |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-CSV_ROW_OBJECT_MAPPING.yaml` (**Implemented**) |
| PLAN | `tied-project/working/REQ-CSV_ROW_OBJECT_MAPPING/PLAN.md` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — four turns **completed** + `close_out_gate_receipt` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-05-1794052043-wf-agentstream-wf-05-cursor-lunamed/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate filenames, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN/tracker/inventory; explicit empty/header AC; methodology capture file |
| 2 | `refine-plan` | Locked `mapCsvRows` API + malformed-input policy; no product code |
| 3 | `build-plan` | RED → GREEN; TypeScript mapper + **6** tests |
| 4 | `close-out` | Gate allowed; envelope zero gaps; **`3b01a3b`** traceable commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794052043-wf-agentstream-wf-05-cursor-lunamed/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`1`** |
| **Wall time** | ~17.6 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `RetriableError: WritableIterable is closed` (pre–turn 1)
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-medium-fast … dry_run=0`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `--- turn 1/4 (new session) ---` / `session_id=b162f8d7-88a4-4ecd-91c9-93c64eb7d7f8`
- `--- turn 2/4 …` / `session_id=edb30e57-f7c2-449d-b0ba-08434936fc9b`
- `--- turn 3/4 …` / `session_id=735f28d2-8b2d-4fd9-8113-d668ee12c249`
- `--- turn 4/4 (new session) ---` — **no** `session_id` line before manifest finalize
- `DIAGNOSTIC: wf-trial process log manifest=…` — manifest records **`exit_code: 1`**

**Cross-check:** Inventory and stdout close-out narrative align with four completed sponsor turns; stderr finalize still **`1`** (contrast Composer **`0`** on [1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md)).

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`4a01162`** bootstrap then single feature/close-out **`3b01a3b`** — **pass** “no early src” heuristic |
| Inventory vs git | Four turns **completed**; close-out receipts committed in **`3b01a3b`** |
| RED evidence | Verification manifest on disk |
| Uncertainty | Harness orchestrator log uncommitted; turn-4 session id absent in stderr — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/csv-row-object-mapping.ts` + colocated tests |
| Facilitator `npm test` | **6** passed |
| `npm run typecheck` | pass |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Empty/header-only behavior explicit in refine before implementation |
| Traceability closure | **A−** | REQ **Implemented**; CITDP + handoffs committed; single bundled close-out commit |
| Test strategy | **A−** | **6** cases cover sponsor edges plus quoting/malformed guards |
| Algorithm / implementation | **A−** | Pure mapper; explicit malformed throws vs empty `[]` |
| Process adherence | **B+** | Machine close_out + envelope; thin minimal-depth ledger |
| Workflow choreography | **B** | Four-turn inventory + close-out on disk; orchestrator **`exit_code: 1`** and launch `WritableIterable` noise |
| Methodology learning readout | **A−** | First **luna-med** WF-05 documents **split** harness vs agent success — pairs with Composer complete/incomplete WF-05 cells |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-05)

Compared with [Composer complete @ 1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md):

- **Harness:** Composer cell **`exit_code: 0`** with four `session_id` lines; this cell **`exit_code: 1`** despite close-out receipts.
- **Product:** Both ship **6** green tests; this cell uses **`mapCsvRows`** and treats **empty input as `[]`** (Composer peer used **`parseCsvToRows`** with empty throw — different REQ token).

Compared with [Composer incomplete @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md): peer stops at turn 2 with no product code; this cell delivers implementation + traceable commit.

Compared with [luna-med WF-01 @ 1794050603](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md): peer shares launch `WritableIterable` and **`exit_code: 1`** but **does not** run close-out; this cell **does** close out in agent terms.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the **2026-11-07 Cursor luna-med / `gpt-5.6-luna-medium-fast`** row for **PROMPT-WF-05**, showing **substantive four-phase delivery** under the same pilot matrix as Composer cells while preserving **harness exit fidelity** for matrix operators (`exit_code: 1`).

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.0** (turn-1 capture file). Records **wf-trial-ts-node-test-v1** seeding + process log capture on a **luna-med** WF-05 cell; **not** an effectiveness claim for TIED 4.2.0 or GPT-5.6 Luna.

---

## Facilitator follow-ups

- Optional re-run after [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../../tied-project/requirements/REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT.yaml) to see whether turn-4 `session_id` + orchestrator **`0`** align on repeat.
- Optional sibling client **`1794050127-wf-agentstream-wf-05-cursor-gpt56lunamed`** for repeatability if sponsor runs another luna-med WF-05 cell.
- Commit orchestrator manifest on disposable client only if sponsor wants full git hygiene beyond traceable product scope.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-05-1794052043-wf-agentstream-wf-05-cursor-lunamed/PLAN.md)
