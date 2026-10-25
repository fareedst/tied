# Trial readout: PROMPT-GF-10 → client `1792950723-gf-10`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-25 |
| **Touchpoint** | **`@record-gf-trial`** facilitator publish (subject build + close-out on client prior to ingest) |
| **Trial prompt** | [PROMPT-GF-10](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-10) |
| **Catalog map** | [TIED-DEMO-10](catalog-tied-compact-tools.md) — ordered parallel mapper |
| **Exercise bridge** | **CON-03** — composition test for ordering seam |
| **Client root** | `/Users/fareed/Documents/dev/test/1792950723-gf-10` |
| **Product REQ** | `REQ-ORDERED_PARALLEL_MAP` (client `tied-project/`) |
| **Proof boundary (primary)** | `executable_behavior` — parallel dispatch + ordered output + Vitest |
| **Proof boundary (secondary)** | `traceability_structure` — R+A+I, minimal CITDP, gates, envelope |
| **Outcome** | **Successful ordered parallel map library; first recorded PROMPT-GF-10 trial; sponsor ordering proof in integration tests** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (PROMPT-GF-10 verbatim)

```text
Build a library that maps items in parallel but returns results in input order. Tests must show that completion order can differ while output order cannot.
```

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| map in parallel | `runParallelMap` starts mappers for all indices; peak in-flight > 1 in integration test | `parallel-mapper.ts`; `map-in-order.integration.test.ts` |
| returns in input order | `IndexResultBuffer` + `buffer.toArray()` after all settle | `map-in-order.ts`; `ordered-parallel-map.md` vocab |
| completion order can differ | Staggered `delay()` per index; assert `completionOrder !== [0,1,2]` | integration test |
| output order cannot | `expect(out).toEqual([0, 2, 4])` for `[0,1,2]` with inverted delays | integration test |
| fail-fast (sponsor-confirmed) | One mapper rejection rejects entire `mapInOrder` | REQ satisfaction_criteria; unit test |

**Costly choices (consequence ladder):** Treating this trial as **methodology effectiveness** → **costly misread**. Comparing to **PROMPT-GF-09** worker pool without **CON-03** ordering lens → **costly misread** (different product seam). Disposable client only → **reversible**.

---

## What was built (description)

- **Interface:** TypeScript ESM library `ordered-parallel-map@0.1.0`; Vitest; no UI or CLI.
- **Behavior:** `mapInOrder(items, mapper)` runs async mappers concurrently, collects by index, returns dense array in input order; fail-fast on first rejection.
- **Modules:** `src/ordered-parallel-map/` — `map-in-order.ts`, `parallel-mapper.ts`, `index-result-buffer.ts`, `index.ts`; test helper `testing/delay.ts`.
- **Tests:** **9** Vitest cases in **4** files — buffer unit, `mapInOrder` unit (empty, single, index, fail-fast), parallel-mapper integration, **two** `mapInOrder` integration tests (completion vs output order; peak concurrency).
- **TIED stack (client):** `REQ-ORDERED_PARALLEL_MAP`, `ARCH-ORDERED_PARALLEL_MAP`, `IMPL-ORDERED_PARALLEL_MAP` + pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-ORDERED_PARALLEL_MAP.yaml` (**minimal**); working folder `tied-project/working/REQ-ORDERED_PARALLEL_MAP/`.
- **Vocab:** `tied-project/vocab/ordered-parallel-map.md` (input order, completion order, ordering seam, fail-fast).
- **Bootstrap:** TIED **4.0.0** disposable client (`1792950723-gf-10`). Feature commit **`8c1627c59ec758554c59ff13397249535541d779`**; HEAD **`e517fb42b523ba499d6573ac18d9f4c06117318a`** (traceable-commit hygiene).
- **Verification (2026-10-25, facilitator re-run):** `npm test` — **9 tests**, all green; `npm run lint:ts` — exit 0; `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (store working evidence).

**Disturbance ladder used:** **L1** staggered delays proving completion reordering; **L1** concurrency peak observation — appropriate for **executable_behavior**-primary **TIED-DEMO-10** / **CON-03** scope (no L3+ fault injection).

---

## Outcome record

**Implementation outcome:** Successful. The client ships `mapInOrder` with an explicit ordering seam, sponsor-mandated integration proof that completion order may differ while output order cannot, and documented fail-fast semantics.

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A−**, Test strategy **A**, Algorithm / implementation **A**, Process adherence **B+**, Methodology learning readout **N/A**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-10-25T18-05-08-166Z.json` → `allowed: true` |
| **Process contract** | **partial** | Tracker includes **`traceable-commit`** and dated `close_out_evidence`; traceable-commit notes **`tied_adherence_reconcile`** **not_run** (`repo root not found`) |
| **Adherence ledger** | **pass (populated)** | pre_implementation, verification, close_out `gate_decided` in `gate-ledger.jsonl` |
| **Status drift** | **minor** | `requirements.yaml` index **Implemented**; nested REQ detail block still **In Progress** at facilitator read time |

**GF cohort extras:** No client **`feedback.yaml`**. No `trial-prompt-interaction-inventory.v1.json`. **Facilitator feedback ingest:** **N/A** (`--skip-feedback-ingest`) — no client-originated receipt; no store proxy row added.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-ORDERED_PARALLEL_MAP.yaml`, matching ARCH/IMPL paths | Ordered parallel map stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-ORDERED_PARALLEL_MAP.yaml` | Minimal depth |
| **PLAN** | `tied-project/working/REQ-ORDERED_PARALLEL_MAP/PLAN.md` | PROMPT-GF-10 remainder + CON-03 / fail-fast notes |
| **Request envelope** | `.../evidence/request-evidence-envelope.v1.json` | Gate receipts + tracker registered |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test + lint:ts |
| **Gate receipts** | `.../gates/pre_implementation-*.json`, `verification-*.json`, `close_out-2026-10-25T18-05-08-166Z.json` | All **allowed** on disk |
| **Traceable commit** | `.../evidence/traceable-commit-evidence.md` | Ship **`8c1627c`** + close-out **`e517fb4`** |
| **Pseudocode validate** | `.../evidence/pseudocode-validate.json` | Present in checklist evidence |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

**Facilitator verification artifacts (store):** [tied-project/working/FACILITATOR-GF-10-1792950723/evidence/build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-GF-10-1792950723/evidence/build-plan-verification-evidence.md)

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-10 mapped to ordered output, parallel dispatch, and explicit integration proof; sponsor **fail-fast** captured in REQ + tests. |
| Traceability closure | 20% | **A−** | Full R+A+I + sidecar; client vocab; CITDP persisted; facilitator `tied_validate_consistency` **`ok: true`**. Minor REQ detail/index status drift. |
| Test strategy | 20% | **A** | RED-friendly unit coverage + **CON-03** integration tests (completion reorder + peak concurrency); sponsor “must show” clause satisfied. |
| Algorithm / implementation | 20% | **A** | Clean ordering seam (`IndexResultBuffer` + `runParallelMap`); honest fail-fast; no hidden serialization of the whole map. |
| Process adherence | 15% | **B+** | Stronger Oct-2026 4.0.0 pattern: pre_implementation + verification + close_out receipts, envelope, **`traceable-commit`** on tracker, dated close_out evidence. Gap: adherence reconcile **not_run** at close-out. |
| Methodology learning readout | 10% | **N/A** | Loop 3 not in scope for PROMPT-GF-10. |

**Catalog disposition note:** **TIED-DEMO-10** remains catalog **`exercise-bridge`** in the store doc; this client is the **first recorded built instance** via **PROMPT-GF-10** in the greenfield recorded-trials table.

**Exercise catalog lens:** **CON-03** — composition test targets the ordering seam between parallel dispatch and ordered aggregation.

**TIED 4.0.0:** Bootstrap and gate receipts align with post–GF-05 checklist_gate norms; no separate store proxy feedback row for this trial.

---

## Cohort comparisons (facilitator)

| Peer | Compare on |
| --- | --- |
| **GF-09** ([readout](trial-readout-PROMPT-GF-09-1791767366.md)) | Shared **CON** family and **executable_behavior** primary. GF-09 **bounded worker pool** (cancellation, ledger); GF-10 **ordered parallel map** (index buffer). GF-10 **stronger** Oct-2026 gate trail and **`traceable-commit`** on tracker vs GF-09 template gaps. |
| **GF-05** ([readout](trial-readout-PROMPT-GF-05-1792944114.md)) | GF-05 **traceability-primary** CLI; GF-10 **algorithm/concurrency-primary** library. Both **TIED 4.0.0** disposable clients with on-disk close_out. |
| **GF-16** ([readout](trial-readout-PROMPT-GF-16-1792937222.md)) | GF-16 **STATE-06** reconciliation; GF-10 smaller **CON-03** surface. **Shared:** verification-gated IMPL **Active** after `tied_verify`. |

---

## Facilitator follow-ups

| # | Action | Status (2026-10-25) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog rows | **Done** — this document |
| 2 | Reconcile nested REQ detail **In Progress** vs index **Implemented** on subject client | **Open (client)** — optional LEAP hygiene |
| 3 | Run **`tied_adherence_reconcile`** from client repo root if ledger completeness matters | **Open (client)** — failed at close-out with `repo root not found` |
| 4 | Store **`tied_feedback_add`** for this trial | **N/A** — no friction witness; ingest skipped |

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md) — TIED-DEMO-10
- Client vocab: `/Users/fareed/Documents/dev/test/1792950723-gf-10/tied-project/vocab/ordered-parallel-map.md`
- Client working folder: `/Users/fareed/Documents/dev/test/1792950723-gf-10/tied-project/working/REQ-ORDERED_PARALLEL_MAP/`
- Store facilitator working folder: `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project/working/FACILITATOR-GF-10-1792950723/`
