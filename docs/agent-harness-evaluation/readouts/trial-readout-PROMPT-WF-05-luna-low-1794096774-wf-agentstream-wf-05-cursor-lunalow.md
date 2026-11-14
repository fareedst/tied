# Trial readout: PROMPT-WF-05 → GPT-5.6 Luna low (Cursor agentstream) → `1794096774-wf-agentstream-wf-05-cursor-lunalow`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-05`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `luna-low` |
| **Model slug** | `gpt-5.6-luna-low-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794096774-wf-agentstream-wf-05-cursor-lunalow` |
| **Factory tag** | `wf-agentstream-wf-05-cursor-lunalow` |
| **Product REQ** | `REQ-CSV_ROW_OBJECT_MAPPING` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: tied_cli_server_info` turn 1); evidence `/Users/fareed/Documents/dev/test/1794096774-wf-agentstream-wf-05-cursor-lunalow/tied-project/working/REQ-CSV_ROW_OBJECT_MAPPING/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-05** **luna-low** readout on **4.2.1** in batch **1794094**; [luna-high @ 1794079974](trial-readout-PROMPT-WF-05-luna-high-1794079974-wf-agentstream-wf-05-cursor-lunahigh.md) (**8** tests, gate blocked on traceable-commit) vs this cell **5** tests and **no gate execution**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

**Catalog stress:** traditional four-phase WF-05 preload. **Proof boundary:** `executable_behavior` + orchestrator process log + facilitator verification replay (not full chat transcripts).

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `1221b054…`. Scaffold + locked stack; methodology **4.2.1** captured turn 1. |
| **2** | `refine-plan` | Session `a98a5ff7…`. Product contracts locked per handoff. |
| **3** | `build-plan` | Session `a21a27dc…`. RED→GREEN per stack; see build-plan handoff. |
| **4** | `close-out` | Session `fade28b9…`. No `close_out_gate_receipt`; handoff cites missing `run-close-out-gates.mjs` |

**Cross-turn harness notes:** orchestrator manifest wall **~7.9 min** (`2026-11-08T00:12:55.000Z` → `2026-11-08T00:20:46.000Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Locked stack | `wf-trial-ts-node-test-v1` TypeScript ESM `node:test` | PLAN + orchestrator seed diagnostics |
| Product scope | See PLAN refined decisions | `tied-project/working/REQ-CSV_ROW_OBJECT_MAPPING/PLAN.md` |
| Gate policy | Minimal / advisory depth for WF disposable trials | Handoffs + inventory |

---

## What was built

- **Product:** `src/index.ts` — `mapCsvRows` library; facilitator **`npm test` 5/5**; typecheck pass.
- **TIED:** `REQ-CSV_ROW_OBJECT_MAPPING` working tree + phase handoffs under `tied-project/working/REQ-CSV_ROW_OBJECT_MAPPING/`.
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator verification green on tests/typecheck where present.
- **Git:** bootstrap **`e920a06`** (TIED **4.2.1**); product deltas largely **uncommitted**.
- **Orchestrator:** `MODEL_SLUG=gpt-5.6-luna-low-fast` `HARNESS=cursor` `workflow_trial_agentstream wf-05`; manifest **`exit_code: 0`**.

---

## Outcome record

**Implementation outcome:** **Delivered (uncommitted)** — facilitator `npm test` **5/5**.

**Workflow outcome:** **Incomplete close-out** — build-plan complete; close-out gate runner **unavailable** (no built MCP cli in disposable client).

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **not_run** | No `close_out_gate_receipt`; handoff cites missing `run-close-out-gates.mjs` |
| **Process contract** | **partial** | Four-phase handoffs present; verification/close-out gaps vary by cell |
| **Adherence ledger** | **partial** / **not_run** | Thin ledger warnings where reconcile ran |
| **Close-out honesty** | **pass** | Handoffs document blockers and skipped commits |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_ROW_OBJECT_MAPPING/PLAN.md` |
| Handoffs | `…/evidence/phase-handoff-*.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-05-1794096774-wf-agentstream-wf-05-cursor-lunalow/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — batch snapshot `client-snapshots.json`, gate paths, orchestrator stderr excerpts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | ---|
| 1 | `add-feature` | REQ scaffold + empty-file AC placeholder |
| 2 | `refine-plan` | Locked empty/header-only behavior |
| 3 | `build-plan` | RED → GREEN **5** |
| 4 | `close-out` | **Incomplete** — gates not executed |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794096774-wf-agentstream-wf-05-cursor-lunalow/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~7.9 min |
| **Stderr log** | `…/process.stderr.log` |

**Friction excerpts (stderr):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-low-fast … dry_run=0`
- `--- turn 1/4 ---` / `session_id=1221b054…`
- `--- turn 2/4 ---` / `session_id=a98a5ff7…`
- `--- turn 3/4 ---` / `session_id=a21a27dc…`
- `--- turn 4/4 ---` / `session_id=fade28b9…`
- `DIAGNOSTIC: wf-trial process log manifest=…` — **`exit_code: 0`**

**Cross-check:** Harness **`0`** vs close-out gate outcome — see completion signals (known split when product GREEN but gate blocked).

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Bootstrap commit only on facilitator pin — product **uncommitted** heuristic |
| Inventory vs disk | Sponsor_turns align with handoffs in batch snapshot |
| RED evidence | Present where noted in build-plan handoff |
| Uncertainty | Disposable clients may omit commits despite GREEN tests |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **5** pass |
| `npm run typecheck` | **pass** (facilitator) |
| Deviation | None on seeded stack |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Empty/header-only AC locked before RED in refine |
| Traceability closure | **B** | ARCH/IMPL + handoffs; no gate receipt |
| Test strategy | **B+** | Five contract tests; narrower than luna-high peer matrix |
| Algorithm / implementation | **A−** | CSV mapper with width/quote errors |
| Process adherence | **C+** | Close-out tooling gap; honest incomplete handoff |
| Workflow choreography | **A−** | Four sessions; harness **`0`**; ~7.9 min |
| Methodology learning readout | **B** | **luna-low** WF-05 shows gate-runner dependency on store MCP build |

**Feedback ingest:** N/A (`--skip-feedback-ingest`; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-05)

[luna-high @ 1794079974](trial-readout-PROMPT-WF-05-luna-high-1794079974-wf-agentstream-wf-05-cursor-lunahigh.md) (**8** tests, gate blocked on traceable-commit) vs this cell **5** tests and **no gate execution**.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-07 `luna-low`** **cursor-agentstream-four-phase** row for **PROMPT-WF-05** on **TIED 4.2.1** batch **1794094**.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (`install_json` on turn 1). Records **luna-low** WF-05 under orchestrator batch **1794094**; **not** an effectiveness claim for TIED 4.2.1 or Luna low.

---

## Facilitator follow-ups

- Optional `tied_verify` + traceable commit on disposable client if sponsor wants REQ index alignment.
- Normalize CITDP adversarial-inquiry shape where close-out gate reported `malformed_citdp:adversarial_inquiry`.
- Backfill `request-evidence-envelope.v1.json` when missing before claiming machine close-out pass.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Batch snapshot](../../tied-project/working/FACILITATOR-WF-BATCH-1794094/evidence/client-snapshots.json)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-05-1794096774-wf-agentstream-wf-05-cursor-lunalow/PLAN.md)
