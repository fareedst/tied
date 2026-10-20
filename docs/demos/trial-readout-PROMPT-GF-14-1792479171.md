# Trial readout: PROMPT-GF-14 → client `1792479171`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-20 |
| **Touchpoint** | `/xlate` (translate-sponsor-intent) + facilitator inspection (post build) + **build-plan** publish |
| **Trial prompt** | [PROMPT-GF-14](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-14) |
| **Catalog map** | [TIED-DEMO-14](catalog-tied-compact-tools.md) — Crash-resumable batch processor |
| **Exercise bridge** | STATE-01 (checkpoints, crashes between operations, replay, progress preservation) |
| **Client root** | `/Users/fareed/Documents/dev/test/1792479171` |
| **Product REQ** | `REQ-BATCH_PROCESSOR` (client `tied-project/`) |
| **Proof boundary (primary)** | `executable_behavior` — Vitest crash-matrix + independent oracle |
| **Proof boundary (secondary)** | `traceability_structure` — R+A+I, CITDP, PLAN, gates, envelope |
| **Outcome** | **Successful product implementation; graded trial recorded; process contract mostly met with tracker/envelope drift** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (stripped `/xlate` remainder)

```text
Build a CLI batch processor that reads records from a file, checkpoints progress, and resumes after simulated crashes between operations. Tests must crash at configurable points and assert no silent loss of work beyond what the documented guarantee allows.
```

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| CLI batch processor | **`batch_cli`** (argv) + **`batch_core`** (loop, checkpoint, merge) | `src/batch-cli/*`, `src/batch-core/*`; `[ARCH-BATCH_PROCESSOR]` |
| reads records from a file | JSONL **Record** `{ id, payload }`; duplicate ids rejected | `validate-input.ts`; README; `[REQ-BATCH_PROCESSOR]` |
| checkpoints progress | **`checkpoint.v1`** in `--state-dir`; monotonic **`nextLineIndex`** after atomic commit | `checkpoint-store.ts`; vocab **Checkpoint** |
| simulated crashes between operations | **`SimulatedCrashError`** at **CrashPoint** enum; **`FaultInjector`** seam | `fault-injector.ts`, `run-batch.ts` |
| configurable crash points | `before_process`, `after_process`, `before_checkpoint_write`, `after_checkpoint_write` | PLAN §2.5; `crash-matrix.test.ts` (13 cases) |
| no silent loss | **Silent loss** forbidden; **`tests/oracle.ts`** independent of implementation | README guarantee table; CITDP counterexamples |
| documented guarantee allows | Re-execution if crash after `process` before checkpoint; idempotent output merge by `id` | PLAN sponsor decisions; README |

**Costly choices (consequence ladder):** Promoting to **durable multi-worker** or **exactly-once side effects** → **costly** (new REQ; CITDP non-goals). Treating **machine `close_out` allowed** without **process contract** cross-check → **costly** misread (see completion signals). Disposable client only → **reversible**.

---

## What was built (description)

- **Interface:** TypeScript ESM CLI (`npm run batch -- run …`), Vitest at repo root, no UI.
- **Behavior:** Read JSONL; for each line, process → merge output by `id` → bump checkpoint; resume skips indices `< nextLineIndex`; input SHA-256 bound on resume.
- **Modules:** `batch-core/` — `types`, `checkpoint-store`, `output-merge`, `fault-injector`, `process-record`, `validate-input`, `run-batch`; `batch-cli/` — `parse-args`, `main`.
- **TIED stack (client):** `REQ-BATCH_PROCESSOR`, `ARCH-BATCH_PROCESSOR`, `IMPL-BATCH_PROCESSOR` with grammar-v2 pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-BATCH_PROCESSOR.yaml` (**minimal** depth, **advisory** gate policy, integrated eligibility waived); checklist tracker, gate receipts, request evidence envelope under `tied-project/working/REQ-BATCH_PROCESSOR/`.
- **Vocab:** `tied-project/vocab/batch-processor.md` + routing row.
- **Bootstrap:** Disposable client; git commits `51b3c5b` (TIED 3.0.0), `5dc7899` (feature + TIED indexes). HEAD `5dc7899987a726f41c9ddb2fb3c83706f8487983`.
- **Verification (2026-10-20, facilitator re-run):** `npm test` — **17 tests**, **4 files**, all green; `npx tsc -b` — exit 0; `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (`TIED_BASE_PATH` → client tree; full JSON in store working evidence).

**Disturbance ladder used:** **L0** (happy paths, oracle baseline), **L1** (validation boundaries in dedicated tests / PLAN), **L2–L3** (isolated and full crash-point matrix per record). PLAN lists **L5** seeded random crashes; **not implemented** in this client build (honest scope gap vs PLAN test-strategy table).

---

## Outcome record

**Implementation outcome:** Successful. The client ships a crash-resumable batch CLI, documents durability limits in README, exercises STATE-01 persistence boundaries in tests, and records a strong refined **PLAN.md** (CrashPoint enum, checkpoint schema, guarantee table).

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A−**, Test strategy **A−**, Algorithm / implementation **A**, Process adherence **B**, Methodology learning readout **N/A**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass (receipt)** | `close_out-2026-10-20T07-10-10-115Z.json` → `allowed: true`; envelope **`gaps: []`** |
| **Process contract** | **partial** | Tracker lists many **`execution_evidence.completed`** slugs through **sub-close-out-evidence-sync**; **`traceable-commit`** slug **not** in `completed` despite feature commit on `main`; **`close_out_evidence`** block still template-empty (`date: null`, `gates: {}`) |
| **Evidence freshness** | **gap** | `verification-evidence-manifest.v1.json` **`commit`** still **`uncommitted`** vs HEAD `5dc7899` |
| **CITDP hygiene** | **minor** | `leap_feedback.record_status: draft` |

**GF-01 cohort extras:** No `feedback.yaml` or `trial-prompt-interaction-inventory.v1.json`.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-BATCH_PROCESSOR.yaml`, matching ARCH/IMPL paths | Batch processor traceability stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-BATCH_PROCESSOR.yaml` | Minimal depth; counterexamples; depth waiver to minimal |
| **PLAN** | `tied-project/working/REQ-BATCH_PROCESSOR/PLAN.md` | Strong RESOLVE + crash matrix + guarantee table (PROMPT-GF-14 header) |
| **Request envelope** | `tied-project/working/REQ-BATCH_PROCESSOR/evidence/request-evidence-envelope.v1.json` | Registry; **`gaps: []`** |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test evidence; stale **`commit`** pin |
| **Gate receipts** | `.../gates/pre_implementation-*.json`, `verification-2026-10-20T07-09-14-069Z.json`, `close_out-2026-10-20T07-10-10-115Z.json` | All **`allowed: true`** on disk |
| **Test stdout** | `.../evidence/quality/npm-test/npm-test.stdout.txt` | Command evidence (17 tests) |
| **Adversarial inquiry** | `.../evidence/sub-adversarial-inquiry-pass-evidence.md` | **N/A** at minimal depth (substitute: crash-matrix + oracle) |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

**Facilitator verification artifacts (store):** `tied-project/working/FACILITATOR-GF-14-1792479171/evidence/build-plan-verification-evidence.md`

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-14 mapped to explicit guarantee table, re-execution vs idempotent merge, input hash binding, and non-goals in PLAN + CITDP — aligns with **TIED-DEMO-14** / STATE-01 durability-honesty emphasis. |
| Traceability closure | 20% | **A−** | Full R+A+I + sidecar; index **Implemented**; facilitator `tied_validate_consistency` **`ok: true`**. Gaps: CITDP **`leap_feedback` draft**; manifest commit stale. |
| Test strategy | 20% | **A−** | RED/green evidence chain, 13-case crash matrix, composition test, oracle — **L2–L3** STATE-01 target. No L5 seeded-random suite despite PLAN mention; no mutation harness. |
| Algorithm / implementation | 20% | **A** | Atomic checkpoint tmp→rename; upsert output by `id`; resume fail-closed on input hash mismatch; fault injection at all named persistence boundaries. |
| Process adherence | 15% | **B** | Minimal/advisory with **multiple gate receipts** and long **`completed`** slug list — stronger than GF-11 hollow tracker. Drift: missing **`traceable-commit`** in `completed`, empty **`close_out_evidence`**, manifest commit pin. |
| Methodology learning readout | 10% | **N/A** | Loop 3 not in scope for PROMPT-GF-14. |

**Catalog disposition note:** **TIED-DEMO-14** remains catalog `exercise-bridge` in the store doc; this client is a **built instance** via **PROMPT-GF-14**.

**Exercise catalog lens ([§9 three-pass model](catalog-compact-programming-exercises.md)):** Pass 1 (design) — strong PLAN + CITDP counterexamples; Pass 2 (tests vs defects) — crash matrix without mutation; Pass 3 (hidden disturbances) — not run (L5 planned but not shipped).

**GF-11 comparison (facilitator):** Same Family D / resilience lane. GF-14 **stronger process artifacts on disk** (pre_implementation, verification, close_out receipts; populated **`completed`**). **Similar risk:** treating gate **allowed** as full checklist completion without **`traceable-commit`** and **`close_out_evidence`** sync. GF-11 had **emptier** tracker and **missing** verification receipts; GF-14 **better machine trail**, **similar envelope freshness gap**.

---

## Facilitator follow-ups

| # | Action | Status (2026-10-20) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog rows | **Done** — this document |
| 2 | Refresh verification manifest **commit** to `5dc7899`; re-capture npm test | **Open** — sponsor/client |
| 3 | Add **`traceable-commit`** to tracker `completed` or document waiver | **Open** |
| 4 | Populate **`execution_evidence.close_out_evidence`** or document dual-write policy | **Open** |
| 5 | Finalize CITDP **`leap_feedback.record_status`** | **Open** — minor |
| 6 | Implement PLAN **L5** seeded random crash schedule | **Open** — separate session |

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md)
- [Agent resilience exercise catalog](catalog-compact-programming-exercises.md) — STATE-01
- Client vocab: `/Users/fareed/Documents/dev/test/1792479171/tied-project/vocab/batch-processor.md`
- Client working folder: `/Users/fareed/Documents/dev/test/1792479171/tied-project/working/REQ-BATCH_PROCESSOR/`
- Store build-plan evidence: `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project/working/FACILITATOR-GF-14-1792479171/`
