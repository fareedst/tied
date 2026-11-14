# Trial readout: PROMPT-WF-06 → Composer 2.5 (Cursor agentstream) → `1794056678-wf-agentstream-wf-06-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-06`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794056678-wf-agentstream-wf-06-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-06-cursor-composer25` |
| **Product REQ** | `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| **TIED methodology version (session)** | **4.2.0** — source **`install_json`** on session file (`capture_path: tied_cli_server_info` turn 1); evidence `…/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-06** readout; **gate-honesty** stress with close-out receipts present (contrast [WF-04 Haiku @ 1793853737](trial-readout-PROMPT-WF-04-claudehaiku55-1793853737-wf-agentstream-wf-04-claude-claudehaiku55.md) partial gate files). |

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
| **1** | `add-feature` | Session `eefc786e-…`. Dual exceed policy (try vs throw) locked in AC-3/AC-4; methodology **4.2.0** via `tied_cli_server_info`. |
| **2** | `refine-plan` | Session `1a2ff4a8-…`. Scope expansion beyond sponsor minimal wording — injectable clock, `availableTokens()`, `RateLimitExceededError` class — without sponsor pause; advisory `pre_implementation` waived receipt. |
| **3** | `build-plan` | Session `59c47433-…`. RED archived → **10/10** GREEN; `verification-evidence-manifest.v1.json` on disk; adversarial **not_applicable**. |
| **4** | `close-out` | Session `80dcb60e-…`. Envelope **0** blocking gaps; `close_out-advisory-allowed.v1.json`; CITDP persisted; traceable **`c129dd1`**; adherence **partial** (thin ledger warn). |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.aXHbHdz0Ny.yaml`; ~11.4 min wall (`2026-11-07T13:04:39Z` → `13:16:01Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| rate | Tokens per second of elapsed time, capped at burst | PLAN § RESOLVE; AC-2 |
| burst | Maximum token balance after refill | AC-1; tests |
| limit exceeded | `tryConsume` → `false` without deduct; `consume` → `RateLimitExceededError` without deduct | AC-3, AC-4; module header |
| minimal scope | Single `TokenBucket` module; no network | PLAN; AC-7 |
| unit tests | Colocated `node:test`; fake `now()` for determinism | AC-6; `src/token-bucket.test.ts` |
| (agent expansion) | `availableTokens()` peek; ctor validation; concurrency documented as single-threaded | PLAN § Locked API; not in sponsor one-liner |

---

## What was built

- **Product:** `src/token-bucket.ts`, `src/token-bucket.test.ts` — **10** passing tests (AC-1 … AC-6).
- **TIED:** `REQ-TOKEN_BUCKET_RATE_LIMITER` + `ARCH-TOKEN_BUCKET_RATE_LIMITER` + `IMPL-TOKEN_BUCKET_RATE_LIMITER`; CITDP `CITDP-REQ-TOKEN_BUCKET_RATE_LIMITER.yaml` in traceable commit; REQ index **`Planned`** (facilitator drift).
- **Stack:** `wf-trial-ts-node-test-v1`; `npm test` / typecheck green on facilitator replay.
- **Git:** bootstrap **`d0d7ea2`** + product/close-out **`c129dd1`**; orchestrator logs uncommitted (expected).
- **Orchestrator:** `MODEL_SLUG=composer-2.5-fast` `HARNESS=cursor` `workflow_trial_agentstream wf-06`.

---

## Outcome record

**Implementation outcome:** **Delivered** — facilitator `npm test` **10/10**; typecheck pass.

**Workflow outcome:** **Complete** — inventory four turns **complete**; `close_out_gate_receipt` linked; orchestrator manifest **`exit_code: 0`** aligned with delivery.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-advisory-allowed.v1.json` `allowed: true`; envelope **0** blocking gaps |
| **Process contract** | **pass** | Handoffs + RED/GREEN archives; `verification-evidence-manifest.v1.json` present at close-out |
| **Adherence ledger** | **partial** | `thin_ledger` band D at minimal depth — documented in close-out handoff |
| **Close-out honesty** | **pass** | All three signals named; adherence partial not hidden |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-TOKEN_BUCKET_RATE_LIMITER.yaml` (index **Planned**) |
| PLAN | `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/PLAN.md` |
| CITDP | `tied-project/citdp/CITDP-REQ-TOKEN_BUCKET_RATE_LIMITER.yaml` (committed) |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — four turns **complete** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-06-1794056678-wf-agentstream-wf-06-cursor-composer25/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, gate diagnostics, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + exceed policy in AC before code; session semver file |
| 2 | `refine-plan` | Locked API/stack + ARCH/IMPL; advisory pre_implementation waived |
| 3 | `build-plan` | RED → GREEN **10** tests; `src/token-bucket.ts` |
| 4 | `close-out` | Gate pass + envelope; traceable **`c129dd1`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794056678-wf-agentstream-wf-06-cursor-composer25/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~11.4 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.0 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `DIAGNOSTIC: harness=cursor model=composer-2.5-fast … dry_run=0`
- `--- turn 1/4 (new session) ---` / `session_id=eefc786e-2b3f-4a25-8b5d-76b9b9ad0531`
- `--- turn 2/4 …` / `session_id=1a2ff4a8-8c11-44f8-b529-3ac9efaf4248`
- `--- turn 3/4 …` / `session_id=59c47433-d1ff-42e1-b6ba-61f0ed115565`
- `--- turn 4/4 …` / `session_id=80dcb60e-0406-4aa0-83f2-18942c5b0afa`
- `DIAGNOSTIC: wf-trial process log manifest=…` — **`exit_code: 0`**

**Cross-check:** Harness **`0`** matches agent delivery and gate-honesty receipts on disk.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Product commit **`c129dd1`** after bootstrap **`d0d7ea2`** — **pass** TDD ordering heuristic |
| Inventory vs git | Four-turn inventory matches committed product + CITDP |
| RED evidence | `evidence/quality-manifest/unit-test-red.stdout.txt` archived |
| Uncertainty | Uncommitted orchestrator logs excluded from traceable commit by design |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/token-bucket.ts`, `src/token-bucket.test.ts` |
| Facilitator `npm test` | **10** pass |
| `npm run typecheck` | **pass** |
| Deviation | None — full stack used |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Exceed behavior documented before code; agent expanded API (clock peek, error class) beyond sponsor minimal line |
| Traceability closure | **A−** | CITDP + ARCH/IMPL committed; REQ index **`Planned`** drift; envelope + verification manifest at close-out |
| Test strategy | **A** | RED/GREEN archived; fake clock covers refill determinism |
| Algorithm / implementation | **A** | Lazy refill + dual exceed surfaces match locked contract |
| Process adherence | **A** | Machine close_out + envelope; adherence partial documented; gate receipts not omitted |
| Workflow choreography | **A** | Four sessions; inventory complete; orchestrator **`0`** matches outcome |
| Methodology learning readout | **A−** | First WF-06 cell — demonstrates **gate-honesty** stress satisfied (contrast WF-04 cells missing receipt files) |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-06)

Compared with [WF-06 Haiku @ 1794062924](trial-readout-PROMPT-WF-06-claudehaiku55-1794062924-wf-agentstream-wf-06-claude-claudehaiku55.md) (**split signal** — **9** tests uncommitted; close-out blocked): this Composer cell completes traceable close-out with **`c129dd1`**.

Compared with [WF-04 Haiku @ 1793853737](trial-readout-PROMPT-WF-04-claudehaiku55-1793853737-wf-agentstream-wf-04-claude-claudehaiku55.md) (**gate honesty** partial — no gate receipt files; machine close_out pass): this cell persists `close_out-advisory-allowed.v1.json` and envelope with **0** gaps.

Compared with [WF-04 Sonnet @ 1793852946](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md) (close-out **incomplete**): this WF-06 Composer cell completes four turns with CITDP in **`c129dd1`**.

Compared with [WF-05 Composer complete @ 1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md): same harness recipe and **`exit_code: 0`**; WF-06 adds stronger close-out artifact bundle (envelope + verification manifest).

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the **2026-11-07 Composer 2.5 / `cursor-agentstream-four-phase`** **complete** row for **PROMPT-WF-06**, illustrating **gate-honesty** catalog stress with receipts present rather than close-out prose-only claims.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.0** (turn-1 file with `install_json` source label). Records **wf-trial-ts-node-test-v1**, process log, and session semver capture on the first **WF-06** complete cell; **not** an effectiveness claim for TIED 4.2.0 or Composer 2.5.

---

## Facilitator follow-ups

- Optional **`tied_verify`** on subject client to promote REQ **`Implemented`** if sponsor wants index alignment with green tests.
- Matrix: add **luna-med** / **Claude** WF-06 cells for gate-honesty pairing under same **4.2.0** bootstrap.
- Scope-review: sponsor may want a **minimal-scope** WF-06 repeat without `availableTokens` / injectable clock if comparability to sponsor one-liner matters.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-06-1794056678-wf-agentstream-wf-06-cursor-composer25/PLAN.md)
