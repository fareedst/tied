# Trial readout: PROMPT-WF-02 → GPT-5.6 Luna high (Cursor agentstream) → `1794075940-wf-agentstream-wf-02-cursor-lunahigh`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-02`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `luna-high` |
| **Model slug** | `gpt-5.6-luna-high-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794075940-wf-agentstream-wf-02-cursor-lunahigh` |
| **Factory tag** | `wf-agentstream-wf-02-cursor-lunahigh` |
| **Product REQ** | `REQ-DEDUPLICATED_STDIN_STREAM` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on inventory; evidence `…/REQ-DEDUPLICATED_STDIN_STREAM/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **luna-high** **PROMPT-WF-02** agentstream readout; pairs legacy [Composer @ 1793562432](trial-readout-PROMPT-WF-02-composer25-1793562432.md) (seven tests, Vitest era) with **integrated** close-out gate churn on **4.2.1**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

**Catalog stress:** duplicate policy resolution before ship. **Proof boundary:** `executable_behavior` + close-out gate receipts (machine **`allowed: false`**).

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `274afd2a-…`. First-occurrence policy captured; no product mutation. |
| **2** | `refine-plan` | Session `13cc205f-…`. Locked **exact-line** equality + ESM/`node:test` stack; **`pre_implementation` allowed**. |
| **3** | `build-plan` | Session `59d1c121-…`. RED/GREEN archived; modular `src/` (`deduplicate-lines`, ingestion, emission, CLI). |
| **4** | `close-out` | Session `f713785a-…`. **Integrated** depth; envelope **0** blocking gaps; **multiple** `close_out` gate receipts; final receipt **`allowed: false`** (`pending_required_step:traceable-commit`, `finding_unresolved`); commit skipped. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.6BFptJOukn.yaml`; ~38.6 min wall (`2026-11-07T18:25:40Z` → `19:04:19Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| deduplicated stream | **First occurrence wins** for exact lines | PLAN; `deduplicateLines` |
| duplicate policy | Exact content — no trim/normalization | PLAN non-guarantees |
| stdin / stdout | `readInputLines` / `emitOutputLines` + thin `cli.ts` | `src/` modules |
| two input orderings | Tests vary duplicate placement | `deduplicate-lines.test.ts`, `cli.test.ts` |
| non-guarantees | No last-win, sort, or bounded-memory promise | PLAN; README implied in handoffs |

---

## What was built

- **Product:** TypeScript ESM CLI + libraries — **8** colocated `node:test` cases (dedupe, ingestion, emission, CLI boundary).
- **TIED:** `REQ-DEDUPLICATED_STDIN_STREAM` + `ARCH-DEDUPLICATED_STDIN_PIPELINE` + `IMPL-DEDUPLICATED_STDIN_PROCESSING` (uncommitted indexes); CITDP under `tied-project/citdp/` (uncommitted); verification manifest + RED/GREEN quality manifests.
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator `npm test` **8/8**; `npm run typecheck` pass.
- **Git:** bootstrap **`0fafeb3`** (TIED **4.2.1**) only; **full product + TIED tree uncommitted**.
- **Orchestrator:** `workflow_trial_agentstream wf-02`; manifest **`exit_code: 0`**, four `session_id` lines.

**Close-out gate evidence:** `tied-bundle/working/REQ-DEDUPLICATED_STDIN_STREAM/gates/close_out-2026-11-07T19-01-41-785Z.json` (+ earlier receipts logged in `closeout-run-close-out-gates-final.json`).

---

## Outcome record

**Implementation outcome:** **Delivered on disk** — facilitator **8/8** tests; behavior matches locked first-win policy.

**Workflow outcome:** **Split** — four harness turns complete with shell **`0`**; machine **`close_out` blocked**; **no** traceable commit despite green tests.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | Final gate receipt **`allowed: false`**; diagnostics include `finding_unresolved`, `pending_required_step:traceable-commit` |
| **Process contract** | **partial** | Verification manifest ok; reconcile grade **B** with `evidence_stale` on prior gate hashes |
| **Adherence ledger** | **partial** | `adherence/events.jsonl` present; integrated adversarial artifacts under bundle working |
| **Close-out honesty** | **pass** | Handoff names blocked gate and uncommitted scoped work |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-DEDUPLICATED_STDIN_STREAM.yaml` (**Planned** index; uncommitted) |
| PLAN | `tied-project/working/REQ-DEDUPLICATED_STDIN_STREAM/PLAN.md` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` — **0** blocking gaps |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — `close_out_gate_receipt` path set; status **`blocked_pending_traceable_commit`** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-02-1794075940-wf-agentstream-wf-02-cursor-lunahigh/evidence/build-plan-verification-evidence.md) — `npm test` **8/8**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, gate filenames, orchestrator excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | Policy + REQ scaffold |
| 2 | `refine-plan` | Locked stack + ARCH/IMPL plan |
| 3 | `build-plan` | RED → GREEN **8** tests; `src/` modules |
| 4 | `close-out` | Envelope pass; **gate blocked**; commit skipped |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794075940-wf-agentstream-wf-02-cursor-lunahigh/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~38.6 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 …`
- `DIAGNOSTIC: WF trial stack seeded` for `package.json`, `tsconfig.json`, `src/.gitkeep`
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-high-fast …`
- Four turn banners with `session_id=` lines (`274afd2a-…` through `f713785a-…`)
- Manifest **`exit_code: 0`**

**Cross-check:** Long wall clock vs ~4 min WF-03 sibling reflects full RED/GREEN + integrated close-out gate attempts in stdout.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **Only** bootstrap **`0fafeb3`** — product **uncommitted** despite build-plan completion |
| Inventory vs git | Mismatch: build complete on disk, no feature commit |
| RED evidence | `build-plan-red.stdout.txt` archived |
| Uncertainty | Multiple gate receipts with stale hash warnings — documented in close-out JSON |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Product paths | `src/**/*.ts` |
| Facilitator `npm test` | **8** pass |
| `npm run typecheck` | **pass** |
| Deviation | None |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | First-win policy + non-guarantees explicit before implementation |
| Traceability closure | **B** | R+A+I on disk uncommitted; CITDP present; no traceable commit |
| Test strategy | **A−** | Eight cases across modules + CLI; two orderings covered |
| Algorithm / implementation | **A** | Streaming first-win dedupe with explicit I/O modules |
| Process adherence | **B+** | Integrated close-out attempted; gate blocked honestly |
| Workflow choreography | **A−** | Four sessions; orchestrator **`0`**; close-out gate churn |
| Methodology learning readout | **A−** | Strong **executable_behavior** with **machine close_out fail** — useful matrix contrast |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-02)

Compared with [Composer @ 1793562432](trial-readout-PROMPT-WF-02-composer25-1793562432.md): peer uses older Vitest **`line-dedup`** with **7** tests and **committed** feature SHA; this cell uses **`node:test`** stack v1, **8** tests, **uncommitted** product.

No other **PROMPT-WF-02** Cursor agentstream readouts in `docs/demos/` at record time — this cell sets the **luna-high** baseline for stdin-dedup stress.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-07 luna-high** delivery row for **PROMPT-WF-02**: **green tests + integrated close-out gate evidence** without traceable commit — separates harness success from sponsor close-out bar.

---

## TIED version / dogfood

**4.2.1** on session/inventory evidence. Exercises **integrated** adversarial close-out paths on disposable client; **not** an effectiveness claim.

---

## Facilitator follow-ups

- Resolve `finding_unresolved` / adversarial **UNRELIABLE** receipt before re-attempting traceable commit.
- Optional single commit promotion for matrix git-hygiene row.
- Compare gate hash churn (`gate_without_current_evidence`) against tracker edits mid-close-out.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF-02 nine-model comparison](wf-02-nine-model-implementation-comparison.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-02-1794075940-wf-agentstream-wf-02-cursor-lunahigh/PLAN.md)
