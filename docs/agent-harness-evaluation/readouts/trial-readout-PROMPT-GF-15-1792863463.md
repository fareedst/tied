# Trial readout: PROMPT-GF-15 → client `1792863463`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-24 |
| **Touchpoint** | **`@record-gf-trial`** facilitator publish (subject build + close-out on client prior to ingest) |
| **Trial prompt** | [PROMPT-GF-15](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-15) |
| **Catalog map** | [TIED-DEMO-15](catalog-tied-compact-tools.md#family-d--resilience--changing-reality-tied-demo-1418) — out-of-order event aggregator |
| **Exercise bridge** | **DATA-04** (lateness + duplication; provisional vs final) |
| **Client root** | `/Users/fareed/Documents/dev/test/1792863463` |
| **Product REQ** | `REQ-OUT_OF_ORDER_EVENT_AGGREGATOR` (client `tied-project/`) |
| **Proof boundary (primary)** | `executable_behavior` — Vitest on window key, state, aggregator integration |
| **Proof boundary (secondary)** | `traceability_structure` — client R+A+I, CITDP, gates |
| **Outcome** | **Successful product implementation; first recorded PROMPT-GF-15 trial; graded process contract partial (template tracker vs close-out receipts)** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (PROMPT-GF-15 verbatim)

```text
Build a library that aggregates timestamped events into fixed time windows. Events may arrive late or duplicate; results must say when they are provisional and when they are final. Tests cover lateness and duplication.
```

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| timestamped events | `{ id, eventTimeMs }`; event time drives window bucket | client PLAN §1; `types.ts` |
| fixed time windows | Half-open `[windowStart, windowStart + windowSizeMs)` | `window-key.ts`; PLAN |
| late | After final: **reject** with `rejectedLateCount++`; before grace: still counts | PLAN normative `ingest` contract |
| duplicate | Global idempotent dedupe by `id` (first ingest wins) | `aggregator.ts`; tests |
| provisional vs final | Processing clock + `allowedLatenessMs`; final freezes `count` | `advanceTime`, `getSnapshot`; README |
| tests cover lateness and duplication | Dedicated Vitest cases + multi-window integration | `event-window-aggregator.test.ts` |

**Costly choices (consequence ladder):** Reopening provisional windows after final → **costly** (explicit non-goal). Treating **machine `close_out` allowed** without **adherence ledger** / tracker sync → **costly misread**. Single trial as methodology effectiveness → **costly misread**. Disposable client only → **reversible**.

---

## What was built (description)

- **Interface:** TypeScript ESM library `event-window-aggregator@0.1.0`; public `EventWindowAggregator` from `src/index.ts`.
- **Behavior:** Lazy window creation; monotonic `advanceTime`; snapshots expose `status`, `count`, `rejectedLateCount`; optional per-ingest arrival override.
- **Modules:** `src/event-window/` — `types.ts`, `window-key.ts`, `window-state.ts`, `aggregator.ts`.
- **Tests:** `tests/window-key.test.ts` (3), `tests/window-state.test.ts` (2), `tests/event-window-aggregator.test.ts` (5) — **10** Vitest cases total.
- **TIED stack (client):** `REQ-OUT_OF_ORDER_EVENT_AGGREGATOR`, `ARCH-OUT_OF_ORDER_EVENT_AGGREGATOR`, `IMPL-OUT_OF_ORDER_EVENT_AGGREGATOR` with pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-OUT_OF_ORDER_EVENT_AGGREGATOR.yaml` (**minimal**, **advisory**); working folder `tied-project/working/REQ-OUT_OF_ORDER_EVENT_AGGREGATOR/`.
- **Vocab:** `tied-project/vocab/event-window-aggregator.md` + routing row.
- **Bootstrap:** TIED **4.0.0** disposable client; git commits `271d703` (bootstrap), `eab561d` (feature + close-out). HEAD `eab561d9588af9ae8462795f110af44b83f4ba59`.
- **Verification (2026-10-24, facilitator re-run):** `npm test` — **10 tests**, **3 files**, all green; `npm run lint:ts` — exit 0; `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (full JSON in store working evidence).

**Disturbance ladder used:** **L0** (window-key/state unit cases), **L2** (aggregator lateness, duplication, multi-window integration per test header). No mutation harness or L4+ combined faults — appropriate for **DATA-04** / executable-primary **TIED-DEMO-15** scope.

---

## Outcome record

**Implementation outcome:** Successful. The client ships the event-window aggregator library, documents processing vs event-time clocks and late-after-final semantics, and records a strong client **PLAN.md** (PROMPT-GF-15 header, normative PRE/POST contract, locked sponsor decisions).

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A−**, Test strategy **B+**, Algorithm / implementation **A**, Process adherence **B−**, Methodology learning readout **N/A**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass (receipt)** | `close_out-2026-10-24T17-54-20-938Z.json` → `allowed: true`; envelope validate blocking gaps **0** per [close-out-handoff.md](/Users/fareed/Documents/dev/test/1792863463/tied-project/working/REQ-OUT_OF_ORDER_EVENT_AGGREGATOR/evidence/close-out-handoff.md) |
| **Process contract** | **partial** | Full checklist **template** tracker; `execution_evidence.completed` lists early slugs only (through `gate-pseudocode-validation`) while **traceable-commit evidence** and close-out gate exist on disk — dual-track drift |
| **Adherence ledger** | **partial** | Handoff: reconcile **ok** band **B** with `gate_without_current_evidence` / hash_alignment findings vs on-disk gate paths |
| **Evidence freshness** | **gap** | `verification-evidence-manifest.v1.json` **`commit`** pin **`271d703`** (bootstrap) vs HEAD **`eab561d`** |

**GF cohort extras:** No client **`feedback.yaml`** (contrast [GF-04](trial-readout-PROMPT-GF-04-1792857852.md)). No `trial-prompt-interaction-inventory.v1.json`.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-OUT_OF_ORDER_EVENT_AGGREGATOR.yaml`, matching ARCH/IMPL paths | Event-window aggregator traceability stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-OUT_OF_ORDER_EVENT_AGGREGATOR.yaml` | Minimal depth; DATA-04 counterexamples |
| **PLAN** | `tied-project/working/REQ-OUT_OF_ORDER_EVENT_AGGREGATOR/PLAN.md` | Strong RESOLVE + normative ingest/advanceTime contract (PROMPT-GF-15) |
| **Request envelope** | `.../evidence/request-evidence-envelope.v1.json` | Registry; blocking gaps cleared at close-out |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test + lint:ts; stale **`commit`** pin |
| **Gate receipts (on disk)** | `.../gates/pre_implementation-2026-10-24T17-*.json` (4), `close_out-2026-10-24T17-54-20-938Z.json` | close_out **`allowed: true`** |
| **Traceable commit** | `.../evidence/traceable-commit-evidence.md` | Gate + envelope refs; ship commit **`eab561d`** |
| **Adversarial inquiry** | — | **N/A** at minimal depth |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

**Facilitator verification artifacts (store):** [tied-project/working/FACILITATOR-GF-15-1792863463/evidence/build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-GF-15-1792863463/evidence/build-plan-verification-evidence.md)

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-15 mapped to provisional/final snapshots, global dedupe, late reject with `rejectedLateCount`, and explicit non-goals (no persistence, no reopen) — aligns with **TIED-DEMO-15** / **DATA-04** lateness semantics. |
| Traceability closure | 20% | **A−** | Full R+A+I + sidecar; client vocab; CITDP persisted; facilitator `tied_validate_consistency` **`ok: true`**. Gap: manifest **commit** stale to bootstrap SHA. |
| Test strategy | 20% | **B+** | Dedicated lateness + duplication cases; window-key/state unit tests; **L2** integration-style case. No mutation harness or L3+ disturbance grid — honest for loop-1 **DATA-04** bridge. |
| Algorithm / implementation | 20% | **A** | Monotonic processing clock; lazy windows; frozen final counts; arrival-time override for provisional late ingest. |
| Process adherence | 15% | **B−** | **Stronger** than hollow GF-11: close_out receipt, traceable-commit evidence file, pre_implementation receipts on disk. **Weaker** than GF-04/GF-14 ideal: full template tracker, sparse **`completed`**, empty **`close_out_evidence`**, adherence hash_alignment warnings. |
| Methodology learning readout | 10% | **N/A** | Not PROMPT-GF-19/20; no client **`feedback.yaml`**. |

**Catalog disposition note:** **TIED-DEMO-15** remains catalog **`exercise-bridge`** in the store doc; this client is the **first recorded built instance** via **PROMPT-GF-15** in the greenfield recorded-trials table.

**Exercise catalog lens:** Pass 1 (design) — strong PLAN + CITDP; Pass 2 (tests vs defects) — explicit lateness/dup without mutation; Pass 3 (hidden disturbances) — not run.

**TIED 4.0.0:** Bootstrap matches other Oct-2026 GF cohort clients; documents **layout + gate tooling** stress, not proof that 4.0.0 improves outcomes.

---

## Cohort comparisons (facilitator)

| Peer | Compare on |
| --- | --- |
| **GF-14** ([readout](trial-readout-PROMPT-GF-14-1792479171.md)) | Same **Family D** resilience lane in the compact catalog. GF-14 **heavier** test matrix (crash injection); GF-15 **clearer streaming-time semantics** with lighter disturbance depth. **Shared:** stale manifest **commit** pin; template-style process drift themes. |
| **GF-02** ([readout](trial-readout-PROMPT-GF-02-1791739774.md)) | Both **DATA** exercise-bridge family (**DATA-01** vs **DATA-04**). GF-15 **more explicit clock model** (event time vs processing time); GF-02 **deeper** integrated CITDP/inquiry in that era. |
| **GF-04** ([readout](trial-readout-PROMPT-GF-04-1792857852.md)) | Both **TIED 4.0.0** Oct-2026 builds. GF-04 **traceability-primary** vocab tool + **methodology_improvement** feedback; GF-15 **algorithm-primary** library + **no** client feedback file. |
| **Custom audit brief** ([readout](trial-readout-CUSTOM-AUDIT-BRIEF-1792861936.md)) | Both **4.0.0** disposable clients with close_out **allowed**. Audit brief **meta-adjacent** CLI; GF-15 **product algorithm** with Vitest module boundaries. |

---

## Facilitator follow-ups

| # | Action | Status (2026-10-24) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog rows | **Done** — this document |
| 2 | Trim master tracker to minimal per-REQ copy; sync **`completed`** with close-out slugs | **Open** — sponsor/client |
| 3 | Populate **`execution_evidence.close_out_evidence`** or document dual-write policy | **Open** — sponsor/client |
| 4 | Refresh verification manifest **commit** to HEAD **`eab561d`** | **Open** — sponsor/client |
| 5 | Resolve adherence **gate_without_current_evidence** findings | **Open** — sponsor/client |

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md) — TIED-DEMO-15
- Client vocab: `/Users/fareed/Documents/dev/test/1792863463/tied-project/vocab/event-window-aggregator.md`
- Client working folder: `/Users/fareed/Documents/dev/test/1792863463/tied-project/working/REQ-OUT_OF_ORDER_EVENT_AGGREGATOR/`
- Store facilitator working folder: `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project/working/FACILITATOR-GF-15-1792863463/`
