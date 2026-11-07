# Trial readout: PROMPT-WF-05 → Composer 2.5 (Cursor agentstream) → `1794049382-wf-agentstream-wf-05-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-05`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794049382-wf-agentstream-wf-05-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-05-cursor-composer25` |
| **Product REQ** | `REQ-CSV_ROW_MAP` |
| **Cohort comparison** | **Success pair** for same-day incomplete [WF-05 @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) (`exit_code: 1` at turn 2); post–shell-hardening four-turn cell. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

**Catalog stress:** refine expands edges — empty-file acceptance criteria before implementation. **Proof boundary:** `executable_behavior` + workflow gate receipts + orchestrator process log.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `5f6d5a89-…`. MCP REQ scaffold; PLAN + inventory; **no** product `src/*.ts` beyond stack `.gitkeep`. |
| **2** | `refine-plan` | Session `56501d1d-…`. Locked AC-ZERO-0..3, D1–D5, T1–T6; advisory `pre_implementation` gate; vocab `csv-row-map.md`. |
| **3** | `build-plan` | Session `2b05e7c6-…`. RED/GREEN archived in quality manifest; `parseCsvToRows` in `src/csv-row-map/parse.ts`; feature commit **`7ce3a12`**. |
| **4** | `close-out` | Session `ce87bb09-…`. Gate **`allowed: true`**; envelope validate blocking gaps **0**; CITDP persisted; orchestrator **`exit_code: 0`**. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.iq9E3Vo8ck.yaml`; ~11.5 min wall (`2026-11-07T11:03:02Z` → `11:14:31Z`). **No** `expanded_batch: unbound variable` or `WritableIterable is closed` (contrast [1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md)).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| header row | **HEADER_RECORD** — first logical record defines object keys | `tied-project/vocab/csv-row-map.md` |
| string columns | **STRING_CELL** — all values remain strings | AC-ZERO-3; vocab |
| zero data rows | **ZERO_DATA_ROWS** — header only → `[]` | AC-ZERO-1; locked before code |
| empty files | **EMPTY_INPUT** — no header → throw | AC-ZERO-0 |
| header-only test | T1 | `src/csv-row-map/parse.test.ts` |
| one data row test | T2 | colocated tests |
| library API | `parseCsvToRows(csvText: string)` | `src/csv-row-map/parse.ts` |

---

## What was built

- **Product:** `parseCsvToRows` with minimal quoting + rectangular row padding; **6** colocated `node:test` cases (T1–T6 scope).
- **Stack:** `wf-trial-ts-node-test-v1`; `npm test` / `npm run typecheck` green at facilitator replay.
- **TIED:** `REQ-CSV_ROW_MAP` detail + index; persisted `CITDP-REQ-CSV_ROW_MAP.yaml`; four phase handoffs; interaction inventory **four turns completed**.
- **Git:** bootstrap **`61af1fc`** (TIED **4.2.0**); product **`7ce3a12`**; docs/hygiene commits through **`92e6678`**.
- **Orchestrator:** `MODEL_SLUG=composer-2.5-fast` `MODEL_CONFIG=composer-2.5` `HARNESS=cursor` `workflow_trial_agentstream wf-05`.

---

## Outcome record

**Implementation outcome:** **Delivered** — parser + tests; facilitator **`6/6`** pass.

**Workflow outcome:** **Complete** — four agentstream sessions; manifest **`exit_code: 0`**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-07.json` → `allowed: true`, depth `minimal` |
| **Process contract** | **partial** | Envelope build/validate; verification manifest; CITDP persisted; thin-ledger warn at reconcile |
| **Adherence ledger** | **partial** | Reconcile **process_grade** band B; `thin_ledger` documented per close-out handoff |
| **Close-out honesty** | **pass** with drift | Machine gates pass; REQ index/detail remain **`Proposed`** (no `tied_verify` index promotion) |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-CSV_ROW_MAP.yaml` (**Proposed** — index matches detail) |
| PLAN | `tied-project/working/REQ-CSV_ROW_MAP/PLAN.md` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — four turns **completed** + `close_out_gate_receipt` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-05-1794049382-wf-agentstream-wf-05-cursor-composer25/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate filenames, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN/tracker/inventory; zero-row AC drafted; no product code |
| 2 | `refine-plan` | Locked AC-ZERO-0..3; advisory pre_implementation gate |
| 3 | `build-plan` | RED → GREEN; `parse.ts` + tests; product commit **`7ce3a12`** |
| 4 | `close-out` | Envelope validate; close_out gate; traceable commit evidence |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794049382-wf-agentstream-wf-05-cursor-composer25/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~11.5 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `DIAGNOSTIC: harness=cursor model=composer-2.5-fast workspace=… dry_run=0`
- `--- turn 1/4 (new session) ---` / `session_id=5f6d5a89-4527-4a54-91ac-cf97e8f4fe16`
- `--- turn 2/4 …` / `session_id=56501d1d-e768-4089-b9e7-f823150c046d`
- `--- turn 3/4 …` / `session_id=2b05e7c6-45de-45c0-90ff-cddfad22c82d`
- `--- turn 4/4 …` / `session_id=ce87bb09-33d2-4eb0-b7cf-9499f5e9e183`
- `DIAGNOSTIC: wf-trial process log manifest=…` — clean finalize; **`exit_code: 0`**

**Cross-check:** Inventory lists all four turns **completed**; aligns with stderr turn banners and git product commit after turn 3 boundary.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`61af1fc`** bootstrap before **`7ce3a12`** feature commit — **pass** “no early src” heuristic |
| Inventory vs git | Four turns **completed**; feature SHA cited in close-out handoff |
| RED evidence | Quality manifest stdout captures archived RED/GREEN |
| Uncertainty | Per-turn `commit_sha_after` not in inventory — close-out batches hygiene docs — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/csv-row-map/parse.ts` only |
| Facilitator `npm test` | **6** passed |
| `npm run typecheck` | pass |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | AC-ZERO-0..3 and empty/header-only edges locked in refine before implementation |
| Traceability closure | **B+** | CITDP persisted; full handoffs; REQ **`Proposed`** drift after machine close_out |
| Test strategy | **A−** | RED/GREEN archived; **6** cases cover sponsor-mandated header-only + one-row plus quoting/padding |
| Algorithm / implementation | **A−** | Minimal CSV subset; explicit throw vs `[]` split; honest quoting scope |
| Process adherence | **A−** | Machine close_out + envelope; thin adherence ledger at minimal depth |
| Workflow choreography | **A** | Four sessions; inventory complete; orchestrator **`exit_code: 0`** |
| Methodology learning readout | **A−** | Documents **success cell** paired with harness-abort WF-05 — separates shell fix from refine quality on incomplete peer |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-05)

Compared with [incomplete WF-05 @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) (same tag, same model, same day):

- **Harness:** peer stops at turn 2 with **`exit_code: 1`** and stale inventory; this cell runs turns 3–4 and finalizes **`0`**.
- **Product:** peer plan-only; this cell ships **`7ce3a12`** with green tests.

Sibling success client **`1794043043-wf-agentstream-wf-05-cursor-composer25`** also reports orchestrator **`exit_code: 0`** — not yet read out; use for repeatability checks, not ranking.

No other **PROMPT-WF-05** facilitator readouts yet beyond the incomplete baseline — this cell closes the **Cursor composer-2.5-fast** complete row for the pilot matrix.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds a **2026-11-07 Cursor composer-2.5-fast** **complete** row for PROMPT-WF-05, pairing with the incomplete harness-abort cell on the same orchestrator recipe (pattern mirrors [WF-01 success @ 1794048393](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md) vs [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md)).

---

## TIED 4.2.0 dogfood

Subject client bootstrapped at **TIED 4.2.0** (`61af1fc`). Records a **Cursor-harness** WF-05 **complete** run with **implementation stack seeding** and **process log capture**; **not** an effectiveness claim for TIED 4.2.0 or Composer 2.5.

---

## Facilitator follow-ups

- Optional **`tied_verify`** on subject client to promote REQ **`Implemented`** if sponsor wants index/detail alignment with green tests.
- Optional **`@record-wf-trial 1794043043-wf-agentstream-wf-05-cursor-composer25`** for repeatability evidence on the same matrix cell.
- Tracker still lists many main-line slugs **pending** — expected for minimal-depth WF trials scoped to build + close-out.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-05-1794049382-wf-agentstream-wf-05-cursor-composer25/PLAN.md)
