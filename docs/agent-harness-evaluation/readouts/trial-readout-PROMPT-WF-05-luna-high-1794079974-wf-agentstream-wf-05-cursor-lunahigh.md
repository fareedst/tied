# Trial readout: PROMPT-WF-05 → GPT-5.6 Luna high (Cursor agentstream) → `1794079974-wf-agentstream-wf-05-cursor-lunahigh`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-05`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `luna-high` |
| **Model slug** | `gpt-5.6-luna-high-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794079974-wf-agentstream-wf-05-cursor-lunahigh` |
| **Factory tag** | `wf-agentstream-wf-05-cursor-lunahigh` |
| **Product REQ** | `REQ-CSV_ROW_OBJECT_MAPPING` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: tied_cli_server_info` turn 1); evidence `…/REQ-CSV_ROW_OBJECT_MAPPING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **luna-high** Cursor agentstream **PROMPT-WF-05** readout on **TIED 4.2.1**; contrasts [Composer complete @ 1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) (`exit_code: 0`, traceable commit) and [luna-med @ 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md) (close-out on disk, orchestrator `exit_code: 1`). |

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
| **1** | `add-feature` | Session `10537f52-…`. Scaffold + locked stack; methodology **4.2.1** via `tied_cli_server_info`. |
| **2** | `refine-plan` | Session `a45dddef-…`. AC lock for empty, header-only, and malformed rows before RED. |
| **3** | `build-plan` | Session `cda88a00-…`. **`mapCsvRows`** + **8** colocated tests; verification manifest on disk. |
| **4** | `close-out` | Session `08e1e57a-…`. Envelope **0** blocking gaps; integrated close-out gate **`allowed: false`** (`traceable-commit` pending); no product/TIED commit beyond bootstrap. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.1lG7FAcl3d.yaml`; ~26.7 min wall (`2026-11-07T19:32:54Z` → `19:59:38Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| header row | First record supplies keys; not returned as a data object | PLAN; `mapCsvRows` contract |
| string columns | **STRING_CELL** — values remain strings | AC; tests |
| zero data rows / empty files | **EMPTY_INPUT** / **HEADER_ONLY** → `[]` without error | Locked in refine before code |
| header-only test | Colocated `node:test` case | `src/csv-row-object-mapper.test.ts` |
| one data row test | Colocated case | same file |
| library API | `mapCsvRows(csvText: string): CsvRow[]` | `src/csv-row-object-mapper.ts` |

---

## What was built

- **Product:** `mapCsvRows` with quoting, escaped quotes, rectangular validation, and explicit throws for width mismatch and unterminated quotes; **8** colocated tests (facilitator `npm test` green).
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator `npm test` / typecheck green on working tree.
- **TIED:** `REQ-CSV_ROW_OBJECT_MAPPING` index **Planned** (uncommitted deltas); ARCH/IMPL + pseudo-code on disk; CITDP and four phase handoffs under `tied-project/working/`.
- **Git:** bootstrap **`bf57d22`** (TIED **4.2.1**) only — product, REQ evidence, gates, and close-out artifacts remain **uncommitted**.
- **Orchestrator:** `MODEL_SLUG=gpt-5.6-luna-high-fast` `MODEL_CONFIG=luna-high` `HARNESS=cursor` `workflow_trial_agentstream wf-05`; manifest **`exit_code: 0`**.

**Uncommitted (expected disposable drift):** full product + project TIED YAML/detail files, `tied-project/working/wf-trial-orchestrator-run/`, `agent-preload-contract.yaml`.

---

## Outcome record

**Implementation outcome:** **Delivered on disk** — parser + **8/8** tests; REQ index **Planned** drift vs green verification.

**Workflow outcome:** **Split signal** — orchestrator **`exit_code: 0`** and four `session_id` lines in stderr; machine close-out **`allowed: false`** on `traceable-commit`; no traceable git commit.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `close_out-2026-11-07T19-57-55-732Z.json` → `allowed: false`; `pending_required_step:traceable-commit` |
| **Process contract** | **partial** | Envelope validated with **0** blocking gaps; verification manifest present; integrated inquiry artifacts on disk |
| **Adherence ledger** | **partial** | Reconcile grade **B** documented in close-out handoff; stale gate hash warnings |
| **Close-out honesty** | **pass** | Handoff states close-out incomplete and skips commit — aligns with gate receipt |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-CSV_ROW_OBJECT_MAPPING.yaml` (**Planned**, uncommitted) |
| PLAN | `tied-project/working/REQ-CSV_ROW_OBJECT_MAPPING/PLAN.md` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — four sponsor turns noted; close-out cites blocked gate |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-05-1794079974-wf-agentstream-wf-05-cursor-lunahigh/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate filenames, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN/tracker; empty/header AC scaffolding; methodology capture **4.2.1** |
| 2 | `refine-plan` | Locked `mapCsvRows` API + malformed-input policy; no product code |
| 3 | `build-plan` | RED → GREEN; TypeScript mapper + **8** tests |
| 4 | `close-out` | Envelope zero blocking gaps; gate blocked on **traceable-commit**; **no** git commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794079974-wf-agentstream-wf-05-cursor-lunahigh/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~26.7 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-high-fast … dry_run=0`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `--- turn 1/4 (new session) ---` / `session_id=10537f52-af6c-418a-990a-7e51a076f8a0`
- `--- turn 2/4 …` / `session_id=a45dddef-7eba-4f16-bfac-1ec0b9f6626c`
- `--- turn 3/4 …` / `session_id=cda88a00-461a-4559-a4a1-ca85403c3427`
- `--- turn 4/4 …` / `session_id=08e1e57a-f1ff-4d7f-8bec-bb6c3817c634`
- Manifest records **`exit_code: 0`** — contrasts luna-med WF-05 harness **`1`** despite similar four-turn delivery

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`bf57d22`** bootstrap only — product exists only in working tree (**heuristic** “early src” waived: orchestrator seeds `src/` pre-turn) |
| Inventory vs git | Four turns recorded; close-out receipts on disk but **not** committed |
| RED evidence | `quality-manifest/unit-test-red.stdout.txt` present |
| Uncertainty | Whether sponsor intended integrated-depth close-out without commit — gate explicitly blocked |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/csv-row-object-mapper.ts` + colocated tests |
| Facilitator `npm test` | **8** passed |
| `npm run typecheck` | pass (facilitator replay) |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Empty/header-only behavior explicit in refine before implementation |
| Traceability closure | **C+** | Green tests + TIED artifacts on disk; REQ **Planned**; **no** traceable commit; gate blocked |
| Test strategy | **A** | **8** cases cover sponsor edges plus quoting/malformed guards |
| Algorithm / implementation | **A−** | Pure mapper; explicit throws vs empty `[]` |
| Process adherence | **B** | Honest close-out handoff; integrated gate fail on `traceable-commit` |
| Workflow choreography | **A−** | Four sessions + orchestrator **`0`**; inventory/gate/git triangle incomplete |
| Methodology learning readout | **A−** | First **luna-high** WF-05 on **4.2.1** — harness **`0`** with **uncommitted** delivery mirrors Sonnet incomplete peers |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-05)

Compared with [Composer complete @ 1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md): peer **`exit_code: 0`** with traceable **`7ce3a12`**; this cell matches orchestrator **`0`** but leaves product **uncommitted** and close-out gate blocked.

Compared with [luna-med @ 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md): peer bundles close-out in **`3b01a3b`** with orchestrator **`1`**; this **luna-high** cell inverts harness vs git hygiene (**0** vs no commit).

Compared with [Sonnet incomplete @ 1794066499](trial-readout-PROMPT-WF-05-claudesonnet55-1794066499-wf-agentstream-wf-05-claude-claudesonnet55.md): both ship green tests uncommitted on **4.2.1**; this cell ran **four** stderr sessions and blocked close-out on `traceable-commit` rather than CITDP shape alone.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the **2026-11-07 Cursor luna-high / `gpt-5.6-luna-high-fast`** row for **PROMPT-WF-05**: **substantive four-phase implementation** with orchestrator **`exit_code: 0`** but **bootstrap-only git** — useful matrix pairing for “harness green vs traceable commit absent.”

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (turn-1 capture file, `install_json` source label). Records **wf-trial-ts-node-test-v1** seeding + process log on a **luna-high** WF-05 cell; **not** an effectiveness claim for TIED 4.2.1 or GPT-5.6 Luna high.

---

## Facilitator follow-ups

- Optional manual traceable commit on disposable client if sponsor wants git hygiene beyond bootstrap **`bf57d22`**.
- Re-run close-out after `traceable-commit` checklist step if integrated gate depth is required for cohort parity with Composer complete cells.
- Compare repeatability with additional **luna-high** WF-05 cells on **4.2.1**.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-05-1794079974-wf-agentstream-wf-05-cursor-lunahigh/PLAN.md)
