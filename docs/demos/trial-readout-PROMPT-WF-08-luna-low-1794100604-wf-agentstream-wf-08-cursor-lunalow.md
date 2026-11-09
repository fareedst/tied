# Trial readout: PROMPT-WF-08 → GPT-5.6 Luna low (Cursor agentstream) → `1794100604-wf-agentstream-wf-08-cursor-lunalow`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-08`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `luna-low` |
| **Model slug** | `gpt-5.6-luna-low-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794100604-wf-agentstream-wf-08-cursor-lunalow` |
| **Factory tag** | `wf-agentstream-wf-08-cursor-lunalow` |
| **Product REQ** | `REQ-WF_TRIAL_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: tied_cli_server_info` turn 1); evidence `/Users/fareed/Documents/dev/test/1794100604-wf-agentstream-wf-08-cursor-lunalow/tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-08** **luna-low** readout on **4.2.1** in batch **1794094**; [WF-08 Sonnet @ 1794069919](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md) (**11** tests, gate pass after CITDP repair) vs this **luna-low** **2** tests + blocked unified close-out. |

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
| **1** | `add-feature` | Session `7be42a8c…`. Scaffold + locked stack; methodology **4.2.1** captured turn 1. |
| **2** | `refine-plan` | Session `1dd2ec90…`. Product contracts locked per handoff. |
| **3** | `build-plan` | Session `25bae45f…`. RED→GREEN per stack; see build-plan handoff. |
| **4** | `close-out` | Session `fc10909b…`. Receipt `tied-bundle/working/REQ-WF_TRIAL_STATE_MACHINE/gates/close_out-2026-11-08T01-21-46-939Z.json` |

**Cross-turn harness notes:** orchestrator manifest wall **~5.6 min** (`2026-11-08T01:16:45.000Z` → `2026-11-08T01:22:19.000Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Locked stack | `wf-trial-ts-node-test-v1` TypeScript ESM `node:test` | PLAN + orchestrator seed diagnostics |
| Product scope | See PLAN refined decisions | `tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/PLAN.md` |
| Gate policy | Minimal / advisory depth for WF disposable trials | Handoffs + inventory |

---

## What was built

- **Product:** `src/state-machine.ts` + tests — facilitator **`npm test` 2/2**; typecheck pass.
- **TIED:** `REQ-WF_TRIAL_STATE_MACHINE` working tree + phase handoffs under `tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/`.
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator verification green on tests/typecheck where present.
- **Git:** bootstrap **`c182461`** (TIED **4.2.1**); product deltas largely **uncommitted**.
- **Orchestrator:** `MODEL_SLUG=gpt-5.6-luna-low-fast` `HARNESS=cursor` `workflow_trial_agentstream wf-08`; manifest **`exit_code: 0`**.

---

## Outcome record

**Implementation outcome:** **Delivered (minimal)** — facilitator `npm test` **2/2**.

**Workflow outcome:** **Blocked close-out** — gate receipt on disk; **`malformed_citdp:adversarial_inquiry`** + missing evidence envelope.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | Receipt `tied-bundle/working/REQ-WF_TRIAL_STATE_MACHINE/gates/close_out-2026-11-08T01-21-46-939Z.json` |
| **Process contract** | **partial** | Four-phase handoffs present; verification/close-out gaps vary by cell |
| **Adherence ledger** | **partial** / **not_run** | Thin ledger warnings where reconcile ran |
| **Close-out honesty** | **pass** | Handoffs document blockers and skipped commits |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-WF_TRIAL_STATE_MACHINE/PLAN.md` |
| Handoffs | `…/evidence/phase-handoff-*.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794100604-wf-agentstream-wf-08-cursor-lunalow/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — batch snapshot `client-snapshots.json`, gate paths, orchestrator stderr excerpts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | ---|
| 1 | `add-feature` | REQ `REQ-WF_TRIAL_STATE_MACHINE` scaffold |
| 2 | `refine-plan` | Transition table + error contract |
| 3 | `build-plan` | RED → GREEN **2**; verification manifest on disk |
| 4 | `close-out` | Gate **`allowed: false`**; commit skipped |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794100604-wf-agentstream-wf-08-cursor-lunalow/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~5.6 min |
| **Stderr log** | `…/process.stderr.log` |

**Friction excerpts (stderr):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-low-fast … dry_run=0`
- `--- turn 1/4 ---` / `session_id=7be42a8c…`
- `--- turn 2/4 ---` / `session_id=1dd2ec90…`
- `--- turn 3/4 ---` / `session_id=25bae45f…`
- `--- turn 4/4 ---` / `session_id=fc10909b…`
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
| Facilitator `npm test` | **2** pass |
| `npm run typecheck` | **pass** (facilitator) |
| Deviation | None on seeded stack |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B+** | Written scope met the prompt but PLAN acceptance did not spell out every edge case before RED. |
| Traceability closure | **B−** | Decision records and code mostly align; traceability gaps remain vs full stack promotion. |
| Test strategy | **C+** | RED/GREEN path exists but case count stays lean versus richer peer WF cells (2 green tests). |
| Algorithm / implementation | **B** | Shipped behavior matches PROMPT shape; gaps leave some fault paths lightly exercised. |
| Process adherence | **B−** | Tracker and handoffs present; close-out gate failed. |
| Workflow choreography | **A−** | Four turns ran with orchestrator exit 0; minor inventory or phase-boundary fuzz. |
| Methodology learning readout | **B** | Readout documents cohort friction (harness vs close-out) without turning into a model leaderboard. |

**Feedback ingest:** N/A (`--skip-feedback-ingest`; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-08)

[WF-08 Sonnet @ 1794069919](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md) (**11** tests, gate pass after CITDP repair) vs this **luna-low** **2** tests + blocked unified close-out.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-07 `luna-low`** **cursor-agentstream-four-phase** row for **PROMPT-WF-08** on **TIED 4.2.1** batch **1794094**.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (`install_json` on turn 1). Records **luna-low** WF-08 under orchestrator batch **1794094**; **not** an effectiveness claim for TIED 4.2.1 or Luna low.

---

## Facilitator follow-ups

- Optional `tied_verify` + traceable commit on disposable client if sponsor wants REQ index alignment.
- Normalize CITDP adversarial-inquiry shape where close-out gate reported `malformed_citdp:adversarial_inquiry`.
- Backfill `request-evidence-envelope.v1.json` when missing before claiming machine close-out pass.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Batch snapshot](../../tied-project/working/FACILITATOR-WF-BATCH-1794094/evidence/client-snapshots.json)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-08-1794100604-wf-agentstream-wf-08-cursor-lunalow/PLAN.md)
