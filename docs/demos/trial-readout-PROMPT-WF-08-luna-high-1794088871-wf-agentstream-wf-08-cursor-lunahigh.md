# Trial readout: PROMPT-WF-08 → GPT-5.6 Luna high (Cursor agentstream) → `1794088871-wf-agentstream-wf-08-cursor-lunahigh`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-08`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `luna-high` |
| **Model slug** | `gpt-5.6-luna-high-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794088871-wf-agentstream-wf-08-cursor-lunahigh` |
| **Factory tag** | `wf-agentstream-wf-08-cursor-lunahigh` |
| **Product REQ** | `REQ-TRIAL_EXPLICIT_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file; evidence `…/REQ-TRIAL_EXPLICIT_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **luna-high** WF-08 on **4.2.1**; contrasts [Composer @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md) (**complete**, **4** tests, **`b329340`**) and [Claude Sonnet @ 1794069919](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md) (**11** tests, complete). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

**Catalog stress:** state machine TDD — illegal-event tests after IMPL plan in build-plan. **Proof boundary:** `executable_behavior` + orchestrator log + `src/**` test discovery.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `ebacb424-…`. REQ/PLAN scaffold; default transition naming in PLAN only. |
| **2** | `refine-plan` | Session `702f8a89-…`. Planning artifacts; no product TypeScript beyond `.gitkeep`. |
| **3** | `build-plan` | Session `c8fdcb1e-…`. **No** `src/**/*.ts` implementation on disk at facilitator inspection. |
| **4** | `close-out` | Session `1b059962-…`. Envelope backfill + **`allowed: false`** close-out gate (adversarial/minimal-depth blockers); **`npm test` → 0 tests**; no traceable commit. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.KCobraQ7ez.yaml`; ~8.7 min wall (`2026-11-07T22:01:11Z` → `22:09:52Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| three states | Default names `idle`, `running`, `finished` in PLAN | PLAN (add-feature only) |
| two events | `start`, `finish` | PLAN |
| legal transitions | `idle → running → finished` | PLAN scope text |
| illegal transitions | Documented error (not implemented in `src/`) | **Unresolved on disk** |
| tests | Legal + illegal cases required | **Missing** — `src/` is `.gitkeep` only |

---

## What was built

- **Product:** **none** — `src/` contains only `.gitkeep`; facilitator `npm test` reports **0** tests.
- **Stack:** `wf-trial-ts-node-test-v1` seeded; close-out notes `npx tsc -b` not runnable (TypeScript tooling gap on client).
- **TIED:** REQ + CITDP YAML + PLAN/checklist under `tied-project/working/`; project index deltas **uncommitted**.
- **Git:** bootstrap **`8da3f03`** (TIED **4.2.1**) only.
- **Orchestrator:** four `session_id` lines; manifest **`exit_code: 0`**.

---

## Outcome record

**Implementation outcome:** **Not delivered** — no state machine module or tests despite four agentstream sessions.

**Workflow outcome:** **Split signal** — orchestrator **`0`** and four turns; close-out gate **`allowed: false`**; inventory status **blocked**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `close_out-2026-11-07T22-07-37-628Z.json` → `allowed: false`; adversarial/minimal-depth diagnostics |
| **Process contract** | **partial** | Envelope rebuilt with **0** blocking gaps after N/A receipt backfill; no product verification |
| **Adherence ledger** | **thin** | `sub-adversarial-inquiry-pass` pending per gate |
| **Close-out honesty** | **pass** | Handoff documents **0** tests and skipped commit |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-TRIAL_EXPLICIT_STATE_MACHINE.yaml` (uncommitted) |
| PLAN | `tied-project/working/REQ-TRIAL_EXPLICIT_STATE_MACHINE/PLAN.md` |
| CITDP | `tied-project/working/REQ-TRIAL_EXPLICIT_STATE_MACHINE/CITDP-REQ-TRIAL_EXPLICIT_STATE_MACHINE.yaml` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — four turns; close-out **blocked** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794088871-wf-agentstream-wf-08-cursor-lunahigh/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`** on TIED indexes (product absence notwithstanding).

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate filenames, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN scaffold |
| 2 | `refine-plan` | Planning recorded; no implementation |
| 3 | `build-plan` | **No** product code in `src/` |
| 4 | `close-out` | Gate blocked; envelope OK; **0** tests |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794088871-wf-agentstream-wf-08-cursor-lunahigh/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~8.7 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `session_id=ebacb424-…`, `702f8a89-…`, `c8fdcb1e-…`, `1b059962-…` (four sessions)
- Short wall clock vs other WF cells — possible under-work in build-plan
- Manifest **`exit_code: 0`** despite zero executable tests

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Bootstrap only — **fail** “product delivered” heuristic |
| Inventory vs disk | Four turns logged; **no** `src/**/*.test.ts` |
| RED evidence | **Absent** |
| Uncertainty | Whether build-plan turn failed silently — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | **None** (`.gitkeep` only) |
| Facilitator `npm test` | **0** tests |
| Deviation | Close-out reports typecheck not runnable — tooling gap |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **C** | Transition table in PLAN only; not realized in code |
| Traceability closure | **F** | TIED planning artifacts only; bootstrap commit |
| Test strategy | **F** | **0** tests — catalog TDD stress unmet |
| Algorithm / implementation | **F** | No state machine shipped |
| Process adherence | **C+** | Honest blocked gate; envelope backfill |
| Workflow choreography | **D+** | Four sessions + orchestrator **`0`** masks missing product |
| Methodology learning readout | **B** | Records **harness-green / product-empty** failure mode for **luna-high** WF-08 |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-08)

Compared with [Composer @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md): peer **`b329340`**, **4** tests, REQ **Implemented**; this cell **no product**.

Compared with [Claude Sonnet @ 1794069919](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md): peer **11** tests + traceable commit; same **4.2.1** methodology generation.

Compared with [Claude Haiku @ 1794064806](trial-readout-PROMPT-WF-08-claudehaiku55-1794064806-wf-agentstream-wf-08-claude-claudehaiku55.md): peer still delivers **3** tests; **luna-high** Cursor cell delivers **none**.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **luna-high** **WF-08** as **workflow-false-positive** row: orchestrator **`exit_code: 0`** with **zero** `npm` tests and bootstrap-only git — contrasts catalog **state machine TDD** complete cells.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (`install_json` label). Documents planning-only close-out on **4.2.1**; **not** an effectiveness claim.

---

## Facilitator follow-ups

- Re-run build-plan manually or re-orchestrate WF-08 if sponsor needs executable FSM evidence from **luna-high**.
- Investigate short wall time vs missing `src/` implementation (turn 3 session `c8fdcb1e-…`).
- Optional adversarial-inquiry N/A receipts before retry to clear close-out gate blockers.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-08-1794088871-wf-agentstream-wf-08-cursor-lunahigh/PLAN.md)
