# Trial readout: PROMPT-GF-12 → client `1792966303-gf-12`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-25 |
| **Touchpoint** | **`@record-gf-trial`** facilitator publish (subject build + close_out on client prior to ingest) |
| **Trial prompt** | [PROMPT-GF-12](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-12) |
| **Catalog map** | [TIED-DEMO-12](catalog-tied-compact-tools.md) — state-machine command processor |
| **Exercise bridge** | **STATE-05** — illegal transitions; duplicate commands; invariants |
| **Client root** | `/Users/fareed/Documents/dev/test/1792966303-gf-12` |
| **Product REQ** | `REQ-FULFILLMENT_COMMAND_PROCESSOR` (client `tied-project/`) |
| **Proof boundary (primary)** | `executable_behavior` — transition table legality, idempotent replay, no mutation on reject |
| **Proof boundary (secondary)** | `traceability_structure` — R+A+I, CITDP, PLAN refine table, vocab |
| **Outcome** | **Successful fulfillment command processor library; first recorded PROMPT-GF-12 trial; close_out gate pass with hollow tracker close-out contract** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (PROMPT-GF-12 verbatim)

```text
Build a command processor backed by an explicit state machine. Reject illegal transitions, tolerate duplicate commands safely where specified, and preserve stated invariants. Tests include illegal events and duplicates.
```

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| command processor | **`FulfillmentCommandProcessor`** — `createOrder`, `recordFulfillment`, `dispatch(orderId, command)` | `fulfillment-command-processor.ts`; client PLAN |
| explicit state machine | **`TransitionTable`** — `(OrderState, CommandType) → OrderState \| null` | `transition-table.ts`; `processor-table.integration.test.ts` |
| reject illegal transitions | Lookup `null` → **`ILLEGAL_TRANSITION`**, snapshot unchanged | `illegal-transitions.test.ts` (4 cases) |
| duplicate commands safely | Same `(commandType, idempotencyKey)` after success → **`applied: false`**, no double transition | `duplicate-commands.test.ts` (4 cases) |
| preserve stated invariants | Unit predicate on aggregate before commit; **`INVARIANT_VIOLATION`** on failure | `invariants.test.ts`; IMPL FAILURE_MODES |
| illegal events and duplicates in tests | Dedicated Vitest files per prompt clause | six test files, 14 cases total |

**Costly choices (consequence ladder):** Treating **`close_out` allowed** with an empty **`close_out_evidence`** block and missing **`traceable-commit`** on the tracker as full process adherence → **costly misread**. Promoting in-memory idempotency to **durable cross-process dedup** → **costly** (new REQ). Disposable client only → **reversible**.

---

## What was built (description)

- **Interface:** TypeScript ESM library `fulfillment-command-processor@0.1.0`; Vitest; no UI or CLI.
- **Behavior:** Order lifecycle **Draft → Confirmed → InFulfillment → Completed** with **Cancelled** terminal from early states; lifecycle commands require **idempotency keys**; per-order idempotency ledger for safe retries.
- **Modules:** `src/fulfillment-command-processor/` — `fulfillment-command-processor.ts`, `transition-table.ts`, `types.ts`, `index.ts`.
- **Tests:** **14** Vitest cases in **6** files — transition table unit, table injection integration, happy path, illegal transitions, duplicate commands, invariants.
- **TIED stack (client):** `REQ-FULFILLMENT_COMMAND_PROCESSOR`, `ARCH-FULFILLMENT_COMMAND_PROCESSOR`, `ARCH-FULFILLMENT_TRANSITION_TABLE`, `IMPL-FULFILLMENT_COMMAND_PROCESSOR` + pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-FULFILLMENT_COMMAND_PROCESSOR.yaml` (**minimal** at close-out with **integrated** waiver note); working folder `tied-project/working/REQ-FULFILLMENT_COMMAND_PROCESSOR/`.
- **Vocab:** `tied-project/vocab/fulfillment-command-processor.md`.
- **Bootstrap:** TIED **4.0.0** disposable client (`1792966303-gf-12`). Commits **`ddf359c`** (bootstrap), **`2a8b316`** (feature + TIED indexes on HEAD).
- **Verification (2026-10-25, facilitator re-run):** `npm test` — **14 tests**, all green; `npm run lint:ts` — exit 0; `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (store working evidence).

**Disturbance ladder used:** **L0–L1** — illegal-event injection and duplicate replay; no L3+ crash injection (appropriate for in-memory **STATE-05** scope).

---

## Outcome record

**Implementation outcome:** Successful. The client ships an explicit transition-table command processor with illegal-transition rejection without mutation, idempotent replay semantics, invariant checks, and prompt-aligned test files.

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A−**, Test strategy **A**, Algorithm / implementation **A**, Process adherence **B−**, Methodology learning readout **N/A**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-10-25T22-26-47-100Z.json` → `allowed: true` (after earlier close_out retries) |
| **Process contract** | **partial** | Git commit on HEAD and `traceable-commit-evidence.md` exist, but tracker **`execution_evidence.completed`** omits **`traceable-commit`**; **`close_out_evidence.date`** still **null**; no **pre_implementation** / **verification** gate JSON on disk |
| **Adherence ledger** | **partial** | `gate-ledger.jsonl` — **close_out** `gate_decided` only |
| **Status drift** | **minor** | `requirements.yaml` index **Implemented**; nested REQ block **In Progress** |

**GF cohort extras:** No client **`feedback.yaml`**. No `trial-prompt-interaction-inventory.v1.json`. **Facilitator feedback ingest:** **N/A** — no client-originated receipt; no store proxy row added.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-FULFILLMENT_COMMAND_PROCESSOR.yaml`, matching ARCH/IMPL paths | State-machine processor stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-FULFILLMENT_COMMAND_PROCESSOR.yaml` | Minimal depth at close-out; integrated waiver documented |
| **PLAN** | `tied-project/working/REQ-FULFILLMENT_COMMAND_PROCESSOR/PLAN.md` | PROMPT-GF-12 remainder + dispatch / duplicate semantics |
| **Request envelope** | `.../evidence/request-evidence-envelope.v1.json` | Manifest + gate stderr + not-applicable adversarial receipt |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test + lint:ts |
| **Gate receipts** | `.../gates/close_out-2026-10-25T22-*.json` (four) | All **allowed: true** on disk |
| **Traceable commit** | `.../evidence/traceable-commit-evidence.md` | Documents ship commit; tracker not fully synced |
| **Pseudocode validate** | `.../evidence/pseudocode-validate.json` | Checklist evidence |
| **Adversarial** | `.../evidence/not-applicable-receipt.v1.json` | MCP Mode B N/A; FM Vitest counterexamples at minimal depth |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

**Facilitator verification artifacts (store):** [tied-project/working/FACILITATOR-GF-12-1792966303/evidence/build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-GF-12-1792966303/evidence/build-plan-verification-evidence.md)

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-12 mapped to explicit table, safe duplicate replay vs rejected “new key” retries, invariant preservation, and separate illegal/duplicate test files. |
| Traceability closure | 20% | **A−** | Full R+A+I + sidecar + vocab; CITDP persisted; facilitator `tied_validate_consistency` **`ok: true`**. Minor REQ index/detail status drift. |
| Test strategy | 20% | **A** | RED-friendly split (table unit → integration → behavior files); **STATE-05** illegal + duplicate coverage; composition test injects custom table. |
| Algorithm / implementation | 20% | **A** | Data-only transition table; idempotency ledger; illegal paths assert no mutation (revision/state). |
| Process adherence | 15% | **B−** | Strong product evidence and **close_out** receipt, but tracker **close_out_evidence** hollow and missing early-phase gate artifacts vs Oct-2026 GF-10/GF-05 norm. |
| Methodology learning readout | 10% | **N/A** | Not a PROMPT-GF-19/20 hypothesis trial. |

**Catalog disposition note:** **TIED-DEMO-12** remains catalog **`exercise-bridge`** in the store doc; this client is the **first recorded built instance** via **PROMPT-GF-12** in the greenfield recorded-trials table.

**Exercise catalog lens:** **STATE-05** — invalid events, duplicate commands, retries, invariants.

**TIED 4.0.0:** Bootstrap on **`ddf359c`**; PLAN specified **integrated** depth but close-out CITDP records **minimal** with documented adversarial waiver.

---

## Cohort comparisons (facilitator)

| Peer | Compare on |
| --- | --- |
| **GF-11** ([readout](trial-readout-PROMPT-GF-11-1792344147.md)) | Catalog successor (**GF-11** lease queue → **GF-12** state machine). Both **executable_behavior**-primary libraries. GF-12 **stronger** explicit **STATE-05** illegal/duplicate test split; GF-11 noted hollow tracker — GF-12 **similar** close-out tracker gap despite git commit. |
| **GF-16** ([readout](trial-readout-PROMPT-GF-16-1792937222.md)) | Shared **STATE** family; GF-16 reconciliation loop vs GF-12 **smaller** synchronous command processor. |
| **GF-10** ([readout](trial-readout-PROMPT-GF-10-1792950723-gf-10.md)) | GF-10 **CON-03** concurrency ordering; GF-12 **STATE-05** legality/idempotency. GF-10 **stronger** Oct-2026 gate trail (**pre_implementation**, **verification**, **`traceable-commit`** on tracker). |

---

## Facilitator follow-ups

| # | Action | Status (2026-10-25) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog rows | **Done** — this document |
| 2 | Reconcile nested REQ detail **In Progress** vs index **Implemented** on subject client | **Open (client)** — optional LEAP hygiene |
| 3 | Sync tracker **`traceable-commit`** + **`close_out_evidence`** with on-disk git commit | **Open (client)** — process contract gap |
| 4 | Persist **pre_implementation** / **verification** gate receipts if full 4.0.0 trail desired | **Open (client)** |
| 5 | Store **`tied_feedback_add`** for this trial | **N/A** — no friction witness; ingest skipped |

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md) — TIED-DEMO-12
- Client vocab: `/Users/fareed/Documents/dev/test/1792966303-gf-12/tied-project/vocab/fulfillment-command-processor.md`
- Client working folder: `/Users/fareed/Documents/dev/test/1792966303-gf-12/tied-project/working/REQ-FULFILLMENT_COMMAND_PROCESSOR/`
- Store facilitator working folder: `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project/working/FACILITATOR-GF-12-1792966303/`
