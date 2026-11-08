# Trial readout: PROMPT-WF-06 → GPT-5.6 Luna low (Cursor agentstream) → `1794097458-wf-agentstream-wf-06-cursor-lunalow`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-06`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `luna-low` |
| **Model slug** | `gpt-5.6-luna-low-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794097458-wf-agentstream-wf-06-cursor-lunalow` |
| **Factory tag** | `wf-agentstream-wf-06-cursor-lunalow` |
| **Product REQ** | `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: tied_cli_server_info` turn 1); evidence `/Users/fareed/Documents/dev/test/1794097458-wf-agentstream-wf-06-cursor-lunalow/tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-06** **luna-low** readout on **4.2.1** in batch **1794094**; [luna-high @ 1794081715](trial-readout-PROMPT-WF-06-luna-high-1794081715-wf-agentstream-wf-06-cursor-lunahigh.md) for same PROMPT-WF-06 stress on **4.2.1**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

**Catalog stress:** traditional four-phase WF-06 preload. **Proof boundary:** `executable_behavior` + orchestrator process log + facilitator verification replay (not full chat transcripts).

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `337f1954…`. Scaffold + locked stack; methodology **4.2.1** captured turn 1. |
| **2** | `refine-plan` | Session `c42611d2…`. Product contracts locked per handoff. |
| **3** | `build-plan` | Session `ee06e931…`. RED→GREEN per stack; see build-plan handoff. |
| **4** | `close-out` | Session `76a9a6d5…`. Verification gate unavailable at build; tracker `verification-gate` still pending at close-out |

**Cross-turn harness notes:** orchestrator manifest wall **~6.8 min** (`2026-11-08T00:24:19.000Z` → `2026-11-08T00:31:08.000Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Locked stack | `wf-trial-ts-node-test-v1` TypeScript ESM `node:test` | PLAN + orchestrator seed diagnostics |
| Product scope | See PLAN refined decisions | `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/PLAN.md` |
| Gate policy | Minimal / advisory depth for WF disposable trials | Handoffs + inventory |

---

## What was built

- **Product:** Token-bucket library under `src/` — facilitator **`npm test` 5/5**; typecheck pass.
- **TIED:** `REQ-TOKEN_BUCKET_RATE_LIMITER` working tree + phase handoffs under `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/`.
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator verification green on tests/typecheck where present.
- **Git:** bootstrap **`4af5050`** (TIED **4.2.1**); product deltas largely **uncommitted**.
- **Orchestrator:** `MODEL_SLUG=gpt-5.6-luna-low-fast` `HARNESS=cursor` `workflow_trial_agentstream wf-06`; manifest **`exit_code: 0`**.

---

## Outcome record

**Implementation outcome:** **Delivered (uncommitted)** — facilitator `npm test` **5/5**.

**Workflow outcome:** **Blocked close-out** — envelope **0** gaps; `tied_gate_check` **`allowed: false`** (`verification-gate` pending in tracker).

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | Verification gate unavailable at build; tracker `verification-gate` still pending at close-out |
| **Process contract** | **partial** | Four-phase handoffs present; verification/close-out gaps vary by cell |
| **Adherence ledger** | **partial** / **not_run** | Thin ledger warnings where reconcile ran |
| **Close-out honesty** | **pass** | Handoffs document blockers and skipped commits |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/PLAN.md` |
| Handoffs | `…/evidence/phase-handoff-*.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-06-1794097458-wf-agentstream-wf-06-cursor-lunalow/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — batch snapshot `client-snapshots.json`, gate paths, orchestrator stderr excerpts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | ---|
| 1 | `add-feature` | REQ + minimal scope lock |
| 2 | `refine-plan` | Exceed semantics + test boundaries |
| 3 | `build-plan` | GREEN **5**; verification gate skipped (no cli dist) |
| 4 | `close-out` | Envelope ok; **gate blocked** on verification pending |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794097458-wf-agentstream-wf-06-cursor-lunalow/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~6.8 min |
| **Stderr log** | `…/process.stderr.log` |

**Friction excerpts (stderr):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-low-fast … dry_run=0`
- `--- turn 1/4 ---` / `session_id=337f1954…`
- `--- turn 2/4 ---` / `session_id=c42611d2…`
- `--- turn 3/4 ---` / `session_id=ee06e931…`
- `--- turn 4/4 ---` / `session_id=76a9a6d5…`
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
| Requirement interpretation | **A−** | Rate/burst/exceed behavior documented in PLAN |
| Traceability closure | **B** | ARCH/IMPL present; verification manifest not archived |
| Test strategy | **B+** | Five unit tests; RED not archived per handoff |
| Algorithm / implementation | **A−** | In-memory bucket without network I/O |
| Process adherence | **B−** | Consistency **ok** at close-out; gate blocked on verification step |
| Workflow choreography | **A−** | Four sessions; harness **`0`**; ~6.8 min |
| Methodology learning readout | **B** | WF-06 **luna-low** records verification-gate pendency pattern |

**Feedback ingest:** N/A (`--skip-feedback-ingest`; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-06)

[luna-high @ 1794081715](trial-readout-PROMPT-WF-06-luna-high-1794081715-wf-agentstream-wf-06-cursor-lunahigh.md) for same PROMPT-WF-06 stress on **4.2.1**.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-07 `luna-low`** **cursor-agentstream-four-phase** row for **PROMPT-WF-06** on **TIED 4.2.1** batch **1794094**.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (`install_json` on turn 1). Records **luna-low** WF-06 under orchestrator batch **1794094**; **not** an effectiveness claim for TIED 4.2.1 or Luna low.

---

## Facilitator follow-ups

- Optional `tied_verify` + traceable commit on disposable client if sponsor wants REQ index alignment.
- Normalize CITDP adversarial-inquiry shape where close-out gate reported `malformed_citdp:adversarial_inquiry`.
- Backfill `request-evidence-envelope.v1.json` when missing before claiming machine close-out pass.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Batch snapshot](../../tied-project/working/FACILITATOR-WF-BATCH-1794094/evidence/client-snapshots.json)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-06-1794097458-wf-agentstream-wf-06-cursor-lunalow/PLAN.md)
