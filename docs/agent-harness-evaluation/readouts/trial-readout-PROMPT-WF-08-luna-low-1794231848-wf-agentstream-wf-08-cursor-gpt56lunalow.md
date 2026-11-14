# Trial readout: PROMPT-WF-08 → GPT-5.6 Luna low (Cursor agentstream) → `1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-08`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `luna-low` |
| **Model slug** | `gpt-5.6-luna-low-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow` |
| **Factory tag** | `wf-agentstream-wf-08-cursor-gpt56lunalow` |
| **Product REQ** | `REQ-WF_TRIAL_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** (`capture_path: tied_cli_server_info` turn `add-feature`); evidence `/Users/fareed/Documents/dev/test/1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow/tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Isolated **luna-low** WF-08 re-run on **4.2.1**; pairs [prior luna-low @ 1794100604](trial-readout-PROMPT-WF-08-luna-low-1794100604-wf-agentstream-wf-08-cursor-lunalow.md) and [grok47-med @ 1794202372](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) (**workflow complete**, **5/5** tests). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

**Catalog stress:** traditional four-phase WF-08 preload. **Proof boundary:** `executable_behavior` + orchestrator process log + facilitator verification replay (not full chat transcripts).

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `bedbf0ed…`. Scaffold REQ, PLAN, CITDP, methodology **4.2.1** evidence; no product code. |
| **2** | `refine-plan` | Session `e00e0449…`. Locked transition table and `InvalidTransitionError`; brief “interrupted refine-plan” recovery in stdout. |
| **3** | `build-plan` | Session `25d246db…`. Pre-implementation gate blocked on tracker/CITDP shape before RED; agent normalized CITDP then **2/2** green tests. |
| **4** | `close-out` | Session `e0536933…`. Handoffs + inventory; **`tied_gate_check` / envelope unavailable** — traceable commit skipped. |

**Cross-turn harness notes:** orchestrator wall **~8.7 min** (`2026-11-09T13:44:08.000Z` → `2026-11-09T13:52:51.000Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Locked stack | `wf-trial-ts-node-test-v1` TypeScript ESM `node:test` | PLAN + orchestrator seed diagnostics |
| Product scope | Three states / two events FSM | `tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/PLAN.md` |
| Gate policy | Minimal / advisory depth for WF disposable trials | CITDP + handoffs |

---

## What was built

- **Product:** `src/state-machine.ts` + colocated tests — facilitator **`npm test` 2/2**; typecheck pass.
- **TIED:** `REQ-WF_TRIAL_STATE_MACHINE` in project YAML + working tree; phase handoffs under `tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/`.
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator verification green on tests/typecheck.
- **Git:** bootstrap **`0f1480b`** (TIED **4.2.1**); product + REQ deltas **uncommitted**.
- **Orchestrator:** `MODEL_SLUG=gpt-5.6-luna-low-fast` `HARNESS=cursor` `workflow_trial_agentstream wf-08`; manifest **`exit_code: 0`**.

---

## Outcome record

**Implementation outcome:** **Delivered (minimal)** — facilitator `npm test` **2/2**.

**Workflow outcome:** **Split signal** — orchestrator **`exit_code: 0`**; machine close-out **`not_run`** (gate/envelope tools unavailable in agent session).

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **not_run** | Handoff: `tied_gate_check` and evidence-envelope validation unavailable |
| **Process contract** | **partial** | Four handoffs + inventory; tests pass; no typed gate receipts |
| **Adherence ledger** | **not_run** | No reconcile receipt |
| **Close-out honesty** | **pass** | Turn 4 documents skipped commit and blockers |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-WF_TRIAL_STATE_MACHINE.yaml` |
| PLAN | `tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — gate paths, orchestrator stderr/stdout excerpts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold, PLAN, CITDP, methodology evidence |
| 2 | `refine-plan` | Transition table + `InvalidTransitionError` contract |
| 3 | `build-plan` | Pre-impl gate friction; then RED→GREEN **2/2** |
| 4 | `close-out` | Handoffs + inventory; commit skipped (gates unavailable) |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~8.7 min |
| **Stderr log** | `…/process.stderr.log` |

**Friction excerpts (stderr / stdout):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-low-fast … dry_run=0`
- `session_id=bedbf0ed-9f23-4915-b4f6-3573ee651668` (turn 1)
- `session_id=e00e0449-7a1b-48a0-aaac-6bade683dcd8` (turn 2)
- Build-plan stdout: pre-implementation gate blocked on tracker `invalid_slug` / CITDP `risk_assessment` vs `risk_analysis` shape before implementation
- `session_id=25d246db-bf45-4946-ae84-24f9fd7ea4a8` (turn 3)
- Close-out stdout: gate/envelope validation unavailable; traceable commit skipped
- `session_id=e0536933-d77a-47d3-b8ed-cf8d326f8716` (turn 4)
- `DIAGNOSTIC: wf-trial process log manifest=…` — **`exit_code: 0`**

**Cross-check:** Harness **`0`** vs machine close-out **`not_run`** — classic split when product GREEN but facilitator gates not exercised in-session.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Bootstrap commit only on facilitator pin — product **uncommitted** |
| Inventory vs disk | `interactions` array lists phases out of sponsor-turn order (refine/build before add-feature in JSON); handoffs on disk follow orchestrator turn order |
| RED evidence | Build-plan handoff cites **2/2** pass after gate normalization |
| Uncertainty | Disposable clients may omit commits despite GREEN tests |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **2** pass |
| `npm run typecheck` | **pass** |
| Deviation | None on seeded stack |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Refine locks `Draft`/`Active`/`Complete` and `activate`/`complete` before RED, matching PROMPT-WF-08 stress. |
| Traceability closure | **B+** | REQ index + working CITDP on disk and facilitator `tied_validate_consistency` **ok**; no traceable product commit or ARCH/IMPL promotion weakens close-out closure vs **A**. |
| Test strategy | **B+** | **2/2** colocated cases cover legal sequence and illegal transition — meets catalog minimum; leaner than **5**-case [grok47-med WF-08 @ 1794202372](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md). |
| Algorithm / implementation | **A−** | `InvalidTransitionError` on illegal edges; legal path reaches `Complete` — matches locked PLAN table. |
| Process adherence | **B−** | Honest close-out handoff documents **not_run** machine gate; pre-implementation friction in turn 3 before GREEN. |
| Workflow choreography | **A−** | Four distinct `session_id` lines and orchestrator **`exit_code: 0`**; **split signal** vs machine close-out. |
| Methodology learning readout | **B** | Contrasts harness **0** with gate-unavailable close-out against peer WF-08 readouts — no model ranking. |

**Feedback ingest:** N/A (`--skip-feedback-ingest`; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-08)

[Prior luna-low @ 1794100604](trial-readout-PROMPT-WF-08-luna-low-1794100604-wf-agentstream-wf-08-cursor-lunalow.md) showed the same **2/2** + blocked close-out pattern on batch **1794094**; this cell repeats **split signal** on **4.2.1** after build-plan gate normalization. [Grok WF-08 @ 1794202372](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) reached **workflow complete** with **`c46b459`** and **5/5** tests — context only, no ranking.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-09 `luna-low`** **cursor-agentstream-four-phase** row for **PROMPT-WF-08** on **TIED 4.2.1** (isolated re-run; supersedes **Latest** for `(PROMPT-WF-08, cursor, luna-low)` in [runs registry](traditional-workflow-trial-runs-registry.md)).

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (`install_json` on turn 1). Records **luna-low** WF-08 orchestrator run **1794231848**; **not** an effectiveness claim for TIED 4.2.1 or Luna low.

---

## Facilitator follow-ups

- Optional facilitator-run `tied_gate_check` + traceable commit on disposable client if sponsor wants machine close-out pass.
- Normalize inventory `interactions` phase order vs sponsor_turn for downstream automation.
- Backfill `request-evidence-envelope.v1.json` when sponsor requires envelope-gated close-out.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-08-1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow/PLAN.md)
