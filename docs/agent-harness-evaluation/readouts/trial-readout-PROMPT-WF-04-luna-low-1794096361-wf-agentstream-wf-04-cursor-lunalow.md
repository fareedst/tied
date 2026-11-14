# Trial readout: PROMPT-WF-04 → GPT-5.6 Luna low (Cursor agentstream) → `1794096361-wf-agentstream-wf-04-cursor-lunalow`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-04`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `luna-low` |
| **Model slug** | `gpt-5.6-luna-low-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794096361-wf-agentstream-wf-04-cursor-lunalow` |
| **Factory tag** | `wf-agentstream-wf-04-cursor-lunalow` |
| **Product REQ** | `REQ-FIXTURE_REQUIREMENT_MARKER_SCAN` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: tied_cli_server_info` turn 1); evidence `/Users/fareed/Documents/dev/test/1794096361-wf-agentstream-wf-04-cursor-lunalow/tied-project/working/REQ-FIXTURE_REQUIREMENT_MARKER_SCAN/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-04** **luna-low** readout on **4.2.1** in batch **1794094**; [luna-high @ 1794079332](trial-readout-PROMPT-WF-04-luna-high-1794079332-wf-agentstream-wf-04-cursor-lunahigh.md) (**scaffold-only**, **0** tests) vs this cell **7/7** fixture scan modules (uncommitted). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

**Catalog stress:** traditional four-phase WF-04 preload. **Proof boundary:** `executable_behavior` + orchestrator process log + facilitator verification replay (not full chat transcripts).

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `e334d1ce…`. Scaffold + locked stack; methodology **4.2.1** captured turn 1. |
| **2** | `refine-plan` | Session `0bd2a8af…`. Product contracts locked per handoff. |
| **3** | `build-plan` | Session `750a7c98…`. RED→GREEN per stack; see build-plan handoff. |
| **4** | `close-out` | Session `8e4d5b1d…`. Gate receipt in `tied-bundle/working/…/gates/` → `allowed: false`; missing `request-evidence-envelope.v1.json` |

**Cross-turn harness notes:** orchestrator manifest wall **~6.3 min** (`2026-11-08T00:06:02.000Z` → `2026-11-08T00:12:23.000Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Locked stack | `wf-trial-ts-node-test-v1` TypeScript ESM `node:test` | PLAN + orchestrator seed diagnostics |
| Product scope | See PLAN refined decisions | `tied-project/working/REQ-FIXTURE_REQUIREMENT_MARKER_SCAN/PLAN.md` |
| Gate policy | Minimal / advisory depth for WF disposable trials | Handoffs + inventory |

---

## What was built

- **Product:** `src/reader.ts`, `src/scanner.ts`, `src/report.ts`, `src/cli.ts` + committed `src/fixtures/sample/` — facilitator **`npm test` 7/7**; typecheck pass.
- **TIED:** `REQ-FIXTURE_REQUIREMENT_MARKER_SCAN` working tree + phase handoffs under `tied-project/working/REQ-FIXTURE_REQUIREMENT_MARKER_SCAN/`.
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator verification green on tests/typecheck where present.
- **Git:** bootstrap **`228ab91`** (TIED **4.2.1**); product deltas largely **uncommitted**.
- **Orchestrator:** `MODEL_SLUG=gpt-5.6-luna-low-fast` `HARNESS=cursor` `workflow_trial_agentstream wf-04`; manifest **`exit_code: 0`**.

---

## Outcome record

**Implementation outcome:** **Delivered (uncommitted)** — facilitator `npm test` **7/7**.

**Workflow outcome:** **Split** — product GREEN on disk; machine close-out **blocked** (`malformed_citdp:adversarial_inquiry`, missing envelope).

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | Gate receipt in `tied-bundle/working/…/gates/` → `allowed: false`; missing `request-evidence-envelope.v1.json` |
| **Process contract** | **partial** | Four-phase handoffs present; verification/close-out gaps vary by cell |
| **Adherence ledger** | **partial** / **not_run** | Thin ledger warnings where reconcile ran |
| **Close-out honesty** | **pass** | Handoffs document blockers and skipped commits |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-FIXTURE_REQUIREMENT_MARKER_SCAN/PLAN.md` |
| Handoffs | `…/evidence/phase-handoff-*.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-04-1794096361-wf-agentstream-wf-04-cursor-lunalow/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — batch snapshot `client-snapshots.json`, gate paths, orchestrator stderr excerpts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | ---|
| 1 | `add-feature` | REQ + locked stack + methodology **4.2.1** |
| 2 | `refine-plan` | Module boundaries + fixture-only contract |
| 3 | `build-plan` | RED → GREEN **7**; typecheck pass |
| 4 | `close-out` | Tests pass; gate **blocked**; no traceable commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794096361-wf-agentstream-wf-04-cursor-lunalow/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~6.3 min |
| **Stderr log** | `…/process.stderr.log` |

**Friction excerpts (stderr):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-low-fast … dry_run=0`
- `--- turn 1/4 ---` / `session_id=e334d1ce…`
- `--- turn 2/4 ---` / `session_id=0bd2a8af…`
- `--- turn 3/4 ---` / `session_id=750a7c98…`
- `--- turn 4/4 ---` / `session_id=8e4d5b1d…`
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
| Facilitator `npm test` | **7** pass |
| `npm run typecheck` | **pass** (facilitator) |
| Deviation | None on seeded stack |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Fixture-only hermetic rule locked in refine; full module contracts in PLAN |
| Traceability closure | **B+** | ARCH/IMPL on disk; CITDP shape blocked close-out gate |
| Test strategy | **A−** | Seven colocated tests across reader/scanner/report/CLI |
| Algorithm / implementation | **A−** | Deterministic scan/compare CLI delivered |
| Process adherence | **B** | Honest blocked close-out; envelope gap documented |
| Workflow choreography | **A−** | Four sessions; harness **`0`**; ~6.3 min wall |
| Methodology learning readout | **B+** | First **luna-low** WF-04 **4.2.1** delivery vs **luna-high** scaffold peer |

**Feedback ingest:** N/A (`--skip-feedback-ingest`; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-04)

[luna-high @ 1794079332](trial-readout-PROMPT-WF-04-luna-high-1794079332-wf-agentstream-wf-04-cursor-lunahigh.md) (**scaffold-only**, **0** tests) vs this cell **7/7** fixture scan modules (uncommitted).

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-07 `luna-low`** **cursor-agentstream-four-phase** row for **PROMPT-WF-04** on **TIED 4.2.1** batch **1794094**.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (`install_json` on turn 1). Records **luna-low** WF-04 under orchestrator batch **1794094**; **not** an effectiveness claim for TIED 4.2.1 or Luna low.

---

## Facilitator follow-ups

- Optional `tied_verify` + traceable commit on disposable client if sponsor wants REQ index alignment.
- Normalize CITDP adversarial-inquiry shape where close-out gate reported `malformed_citdp:adversarial_inquiry`.
- Backfill `request-evidence-envelope.v1.json` when missing before claiming machine close-out pass.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Batch snapshot](../../tied-project/working/FACILITATOR-WF-BATCH-1794094/evidence/client-snapshots.json)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-04-1794096361-wf-agentstream-wf-04-cursor-lunalow/PLAN.md)
