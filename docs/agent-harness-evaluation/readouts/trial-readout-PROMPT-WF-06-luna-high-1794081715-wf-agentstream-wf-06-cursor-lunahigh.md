# Trial readout: PROMPT-WF-06 → GPT-5.6 Luna high (Cursor agentstream) → `1794081715-wf-agentstream-wf-06-cursor-lunahigh`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-06`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `luna-high` |
| **Model slug** | `gpt-5.6-luna-high-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794081715-wf-agentstream-wf-06-cursor-lunahigh` |
| **Factory tag** | `wf-agentstream-wf-06-cursor-lunahigh` |
| **Product REQ** | `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: tied_cli_server_info` turn 1); evidence `…/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **luna-high** **PROMPT-WF-06** readout; contrasts [Composer complete @ 1794056678](trial-readout-PROMPT-WF-06-composer25-1794056678-wf-agentstream-wf-06-cursor-composer25.md) (four turns, **`exit_code: 0`**, **`c129dd1`**) and [Claude Haiku @ 1794062924](trial-readout-PROMPT-WF-06-claudehaiku55-1794062924-wf-agentstream-wf-06-claude-claudehaiku55.md) (green tests, blocked close-out, orchestrator **`0`**). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

**Catalog stress:** gate honesty — close-out vs missing gate/envelope receipts. **Proof boundary:** `traceability_structure` + orchestrator process log + facilitator git replay.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `ec0e50cd-…`. REQ/PLAN scaffold; methodology **4.2.1** capture. Launch **`RetriableError: WritableIterable is closed`** (stderr). |
| **2** | `refine-plan` | Session `78b85b7d-…`. Locked `TokenBucketRateLimiter` + `tryAcquire` exceed → `false` without consume. |
| **3** | `build-plan` | Turn banner in stderr **without** trailing `session_id`; build-plan handoff + **5** green tests on disk. |
| **4** | `close-out` | **Not observed** in orchestrator stderr — manifest finalizes after turn 3 banner. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.BKHI47DF6s.yaml`; ~17.0 min wall (`2026-11-07T20:01:56Z` → `20:18:54Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| rate | Tokens per second refill capped at burst | PLAN; constructor options |
| burst | Maximum token balance | AC; tests |
| limit exceeded | `tryAcquire` → `false`; no token consumed; documented in module header | `src/token-bucket-rate-limiter.ts` |
| in-memory | No network I/O or persistence | REQ boundary |
| minimal API | `TokenBucketRateLimiter({ refillRatePerSecond, burstCapacity, now? })` | `src/token-bucket-rate-limiter.ts` |

---

## What was built

- **Product:** synchronous in-memory `TokenBucketRateLimiter` with injectable clock; **5** colocated tests (facilitator `npm test` green).
- **Stack:** `wf-trial-ts-node-test-v1`; RED/GREEN evidence under `quality-manifest/`.
- **TIED:** ARCH/IMPL + pseudo-code on disk; build-plan verification gate; tracker shows build complete, **`traceable-commit`** and **`close-out`** pending.
- **Git:** bootstrap **`fb4ec07`** (TIED **4.2.1**) only — product + TIED deltas **uncommitted**.
- **Orchestrator:** `workflow_trial_agentstream wf-06`; manifest **`exit_code: 1`**.

**Inventory drift:** `trial-workflow-interaction-inventory.v1.json` still lists turns 2–4 as **pending** despite build-plan handoff on disk — treat inventory as stale vs working tree.

---

## Outcome record

**Implementation outcome:** **Partial delivery** — limiter + **5/5** tests on disk; no close-out gate or traceable commit.

**Workflow outcome:** **Incomplete** — stderr shows **three** turn banners (only **two** `session_id` lines); orchestrator **`exit_code: 1`**; no turn 4 / close-out session.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **not run** | No close-out gate receipt; tracker `close_out` pending |
| **Process contract** | **partial** | Build-plan verification manifest + RED/GREEN evidence; envelope path declared but close-out not executed |
| **Adherence ledger** | **thin** | Minimal depth; no close-out reconcile |
| **Close-out honesty** | **n/a** | Orchestrator abort before close-out turn |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-TOKEN_BUCKET_RATE_LIMITER.yaml` (uncommitted deltas) |
| PLAN | `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/PLAN.md` (`plan_phase: post-build`) |
| Build gate | `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/gates/verification-build-plan.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — **stale** pending flags |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-06-1794081715-wf-agentstream-wf-06-cursor-lunahigh/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate filenames, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN/tracker scaffold |
| 2 | `refine-plan` | Locked synchronous try/reject API |
| 3 | `build-plan` | RED → GREEN; **5** tests; orchestrator stderr **no** `session_id` |
| 4 | `close-out` | **Not run** (harness exit **1** after turn 3 banner) |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794081715-wf-agentstream-wf-06-cursor-lunahigh/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`1`** |
| **Wall time** | ~17.0 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `RetriableError: WritableIterable is closed` (pre–turn 1)
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-high-fast …`
- `--- turn 1/4 (new session) ---` / `session_id=ec0e50cd-0ea9-4757-9524-90f2a29a4d8a`
- `--- turn 2/4 …` / `session_id=78b85b7d-c519-4403-be11-b790e9bf59aa`
- `--- turn 3/4 (new session) ---` — **no** `session_id` line; **no** turn 4 banner
- Manifest **`exit_code: 1`**

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Bootstrap only — product uncommitted |
| Inventory vs disk | Inventory **under-reports** build-plan completion |
| RED evidence | `unit-test-red.stdout.txt` archived |
| Uncertainty | Whether turn 3 agent session completed off-log while stderr truncated — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/token-bucket-rate-limiter.ts` + colocated tests |
| Facilitator `npm test` | **5** passed |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Minimal synchronous API; exceed behavior documented |
| Traceability closure | **D+** | Build artifacts on disk; no commit; no close-out; inventory stale |
| Test strategy | **B+** | **5** tests vs Composer peer **10** — narrower burst/refill coverage |
| Algorithm / implementation | **B+** | Correct token-bucket sketch; smaller test surface |
| Process adherence | **C** | Build-plan gate on disk; workflow abort before close-out |
| Workflow choreography | **D** | Orchestrator **`1`**; missing turn 3 `session_id` and entire turn 4 |
| Methodology learning readout | **B** | Documents **harness abort with partial product** — contrasts Composer complete WF-06 |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-06)

Compared with [Composer @ 1794056678](trial-readout-PROMPT-WF-06-composer25-1794056678-wf-agentstream-wf-06-cursor-composer25.md): peer **four** sessions, **`0`**, **`c129dd1`**, **10** tests; this cell **aborts** with **5** tests uncommitted.

Compared with [Claude Haiku @ 1794062924](trial-readout-PROMPT-WF-06-claudehaiku55-1794062924-wf-agentstream-wf-06-claude-claudehaiku55.md): peer runs close-out with honest **`allowed: false`**; this cell never reaches close-out turn despite build-plan artifacts.

Compared with [luna-med WF-05 @ 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md): shared launch `WritableIterable` noise; WF-05 luna-med still reaches turn 4.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **luna-high / `gpt-5.6-luna-high-fast`** **WF-06** as **workflow incomplete** with **green uncommitted tests** — matrix row for gate-honesty stress when harness exits **`1`** mid-batch.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (turn-1 capture file). Records orchestrator failure mode on **4.2.1** pilot; **not** an effectiveness claim.

---

## Facilitator follow-ups

- Refresh `trial-workflow-interaction-inventory.v1.json` if sponsor needs inventory/git alignment after partial run.
- Optional re-run from `build-plan` or `close-out` after [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../../tied-project/requirements/REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT.yaml).
- Manual close-out on disposable client to exercise gate-honesty receipts.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-06-1794081715-wf-agentstream-wf-06-cursor-lunahigh/PLAN.md)
