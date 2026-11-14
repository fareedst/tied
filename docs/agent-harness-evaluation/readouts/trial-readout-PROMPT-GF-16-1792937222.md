# Trial readout: PROMPT-GF-16 → client `1792937222`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-25 |
| **Touchpoint** | **`@record-gf-trial`** facilitator publish (subject build + close-out on client prior to ingest) |
| **Trial prompt** | [PROMPT-GF-16](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-16) |
| **Catalog map** | [TIED-DEMO-16](catalog-tied-compact-tools.md#family-d--resilience--changing-reality-tied-demo-1418) — reconciliation engine |
| **Exercise bridge** | **STATE-06** (desired vs observed; partial corrective actions; convergence documentation) |
| **Client root** | `/Users/fareed/Documents/dev/test/1792937222-gf-16` |
| **Product REQ** | `REQ-RECONCILIATION_ENGINE` (client `tied-project/`) |
| **Proof boundary (primary)** | `executable_behavior` — Vitest on observe→diff→single-apply loop |
| **Proof boundary (secondary)** | `traceability_structure` — client R+A+I, CITDP, gates |
| **Outcome** | **Successful product implementation; first recorded PROMPT-GF-16 trial; process contract partial (template tracker vs close-out receipts); wrong-base-path episode repaired** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (PROMPT-GF-16 verbatim)

```text
Build a reconciliation engine: desired state vs observed state, apply corrective actions that may fail or partially succeed, and loop until converged or a documented stop condition. Tests include partial failures and superseding desired state.
```

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| desired state vs observed state | `Map<resourceId, Record<string,string>>`; observed via `observe()` each iteration | client PLAN §1; `engine.ts` |
| corrective actions may fail or partially succeed | `ApplyResult`: success / failed / partial with `applied` KV subset | `types.ts`; integration tests |
| loop until converged or documented stop | `stopReason`: `converged`, `max_iterations`, `stall` | `runUntilStop()` |
| partial failures | Failed apply leaves drift; partial merges subset then re-observes | `partial failure` test |
| superseding desired state | `desiredGeneration` on `setDesired`; stale apply results ignored | `superseding desired` test |
| prune orphans | Observed ids not in desired → delete actions | `diff.ts`; diff unit tests |

**Costly choices (consequence ladder):** Treating **wrong `TIED_BASE_PATH`** repair as methodology failure → **costly misread** (field observation only). **Machine `close_out` allowed** without **tracker `close_out_evidence` backfill** → **costly misread**. Single trial as methodology effectiveness → **costly misread**. Disposable client only → **reversible**.

---

## What was built (description)

- **Interface:** TypeScript ESM library `reconciliation-engine@0.1.0`; public `ReconciliationEngine` from `src/index.ts`.
- **Behavior:** One corrective action per loop iteration; deterministic action ordering (deletes, creates, updates; lexicographic ids); generation stamp on apply context; fingerprint-based stall detection.
- **Modules:** `src/reconciliation/` — `types.ts`, `diff.ts`, `fingerprint.ts`, `engine.ts`.
- **Tests:** `tests/diff.test.ts` (4), `tests/reconciliation-engine.test.ts` (7) — **11** Vitest cases total (converge, partial failure, superseding desired, maxIterations, stall, external observe, integration-style API).
- **TIED stack (client):** `REQ-RECONCILIATION_ENGINE`, `ARCH-RECONCILIATION_ENGINE`, `IMPL-RECONCILIATION_ENGINE` with pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-RECONCILIATION_ENGINE.yaml` (**minimal**, **advisory**); working folder `tied-project/working/REQ-RECONCILIATION_ENGINE/`.
- **Vocab:** `tied-project/vocab/reconciliation-engine.md` + routing row.
- **Bootstrap:** TIED **4.0.0** disposable client; git commits `d6e4ef8` (bootstrap), `60a9fc8` (feature + close-out). HEAD `60a9fc85ffeddb7cb7c8389faa5218b9bd914dea`.
- **Verification (2026-10-25, facilitator re-run):** `npm test` — **11 tests**, **2 files**, all green; `npm run lint:ts` — exit 0; `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (full JSON in store working evidence).

**Disturbance ladder used:** **L0** (`diff.test.ts` resource/KV classification), **L2** (engine loop: partial apply, superseding generation, stall, max iterations, external observe). No mutation harness or L4+ combined faults — appropriate for **STATE-06** / executable-primary **TIED-DEMO-16** scope.

---

## Outcome record

**Implementation outcome:** Successful. The client ships the reconciliation engine with documented stop reasons, prune-on-shrink semantics, and named tests for partial failure and superseding desired state.

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A−**, Test strategy **A−**, Algorithm / implementation **A**, Process adherence **B+**, Methodology learning readout **B− (partial)**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass (receipt)** | `close_out-2026-10-25T14-17-45-240Z.json` → `allowed: true`; envelope validate blocking gaps **0** per [traceable-commit-evidence.md](/Users/fareed/Documents/dev/test/1792937222-gf-16/tied-project/working/REQ-RECONCILIATION_ENGINE/evidence/traceable-commit-evidence.md) |
| **Process contract** | **partial** | Full checklist **template** tracker; `execution_evidence.close_out_evidence` still **template-empty** (`date: null`) while traceable-commit + close_out gate exist on disk |
| **Adherence ledger** | **pass (populated)** | Multiple `gate_decided` events + `tied_verify` status mutations for REQ/IMPL — **stronger** than GF-11 hollow ledger |
| **TIED base path episode** | **repaired** | Initial YAML writes targeted wrong store path; indexes copied into client via MCP; documented in traceable-commit evidence — not a product defect |

**GF cohort extras:** No client **`feedback.yaml`**. No `trial-prompt-interaction-inventory.v1.json`.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-RECONCILIATION_ENGINE.yaml`, matching ARCH/IMPL paths | Reconciliation engine traceability stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-RECONCILIATION_ENGINE.yaml` | Minimal depth; STATE-06 counterexamples |
| **PLAN** | `tied-project/working/REQ-RECONCILIATION_ENGINE/PLAN.md` | Strong RESOLVE + normative loop contract (PROMPT-GF-16) |
| **Request envelope** | `.../evidence/request-evidence-envelope.v1.json` | Registry; blocking gaps cleared at close-out |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test + lint:ts |
| **Gate receipts (on disk)** | `.../gates/pre_implementation-*.json`, `verification-*.json`, `close_out-2026-10-25T14-17-45-240Z.json` | close_out **`allowed: true`** |
| **Traceable commit** | `.../evidence/traceable-commit-evidence.md` | Gate + envelope refs; ship commit **`60a9fc8`** |
| **Adversarial inquiry** | — | **N/A** at minimal depth |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

**Facilitator verification artifacts (store):** [tied-project/working/FACILITATOR-GF-16-1792937222/evidence/build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-GF-16-1792937222/evidence/build-plan-verification-evidence.md)

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-16 mapped to partial/failed apply, superseding desired, explicit stop reasons, and prune orphans — aligns with **TIED-DEMO-16** / **STATE-06** convergence documentation. |
| Traceability closure | 20% | **A−** | Full R+A+I + sidecar; client vocab; CITDP persisted; facilitator `tied_validate_consistency` **`ok: true`**. Minus: wrong-base-path episode required MCP repair (documented, not silent). |
| Test strategy | 20% | **A−** | Dedicated partial + superseding cases; diff unit tests; stall/maxIterations/external observe. No L4+ combined fault grid — honest for loop-1 **STATE-06** bridge. |
| Algorithm / implementation | 20% | **A** | One-action-per-iteration loop; generation stale-drop; fingerprint stall; deterministic action ordering. |
| Process adherence | 15% | **B+** | **Stronger** than GF-11/GF-15 template drift alone: populated adherence ledger + close_out receipt + traceable commit. **Weaker** than ideal: master tracker `close_out_evidence` not backfilled. |
| Methodology learning readout | 10% | **B− (partial)** | Not PROMPT-GF-19/20; no **`feedback.yaml`**. Grade **field observation** quality (wrong-base-path lesson in traceable-commit) — not Loop 3 effectiveness. |

**Catalog disposition note:** **TIED-DEMO-16** remains catalog **`exercise-bridge`** with partial-success/convergence documentation lens; this client is the **first recorded built instance** via **PROMPT-GF-16** in the greenfield recorded-trials table.

**Exercise catalog lens:** Pass 1 (design) — strong PLAN + CITDP; Pass 2 (tests vs defects) — explicit partial/superseding without mutation; Pass 3 (hidden disturbances) — not run.

**TIED 4.0.0:** Bootstrap matches other Oct-2026 GF cohort clients; wrong-base-path close-out documents **MCP scoping** stress for facilitators, not proof that 4.0.0 improves outcomes.

---

## Cohort comparisons (facilitator)

| Peer | Compare on |
| --- | --- |
| **GF-15** ([readout](trial-readout-PROMPT-GF-15-1792863463.md)) | Both **algorithm-primary** loop-1 libraries (DATA-04 vs STATE-06). GF-16 **control-loop** semantics (observe→act→observe); GF-15 **streaming-time** windows. **Shared:** template tracker vs close-out receipt drift; no client feedback file. |
| **GF-14** ([readout](trial-readout-PROMPT-GF-14-1792479171.md)) | GF-14 **heavier** gate/envelope trail; GF-16 **richer adherence ledger** on subject despite tracker template gap. |
| **GF-04** ([readout](trial-readout-PROMPT-GF-04-1792857852.md)) | Both **TIED 4.0.0** Oct-2026 builds. GF-04 **traceability-primary** + **methodology_improvement** feedback; GF-16 **STATE-06 executable-primary** + **no** feedback file. |
| **GF-11** ([readout](trial-readout-PROMPT-GF-11-1792344147.md)) | GF-16 **stronger process artifacts** (adherence ledger populated, close_out allowed); GF-11 **hollow** ledger contrast. |

---

## Facilitator follow-ups

| # | Action | Status (2026-10-25) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog rows | **Done** — this document |
| 2 | Trim master tracker to minimal per-REQ copy; sync **`completed`** with close-out slugs | **Open** — sponsor/client |
| 3 | Populate **`execution_evidence.close_out_evidence`** on subject tracker | **Open** — sponsor/client |
| 4 | Optional: add client **`feedback.yaml`** methodology_improvement row for wrong-base-path lesson | **Open** — sponsor/client |
| 5 | Dual-track Kaizen close (coordinator **`REQ-GF16-KAIZEN-OUTCOME-CLOSE`**) | **Done (2026-10-25)** — register [`feedback-dual-track-register.md`](../tied-project/working/REQ-GF16-KAIZEN-OUTCOME-CLOSE/evidence/feedback-dual-track-register.md); Track B **`improved`** (`fb-mvny01eb-my451g`); Track A **`not_measured`** → countermeasure **`REQ-TIED_CLIENT_FEEDBACK_CAPTURE`** |
| 6 | CLI countermeasure + resolver LEAP (`REQ-TIED_CLI_MCP_JSON_BASE_PATH`) | **Done** — GF-16 cwd smoke [`gf16-tied-cli-base-path-smoke.json`](../tied-project/working/REQ-GF16-KAIZEN-OUTCOME-CLOSE/evidence/gf16-tied-cli-base-path-smoke.json) |
| 7 | Capture countermeasure docs (`REQ-TIED_CLIENT_FEEDBACK_CAPTURE` Track A) | **Done (2026-10-25)** — [`PLAN.md`](../tied-project/working/REQ-TIED_CLIENT_FEEDBACK_CAPTURE/PLAN.md); witness **`fb-mvnyr5n2-aaeg1j`**; outcome remains **`not_measured`** until next cohort |

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md) — TIED-DEMO-16
- Client vocab: `/Users/fareed/Documents/dev/test/1792937222-gf-16/tied-project/vocab/reconciliation-engine.md`
- Client working folder: `/Users/fareed/Documents/dev/test/1792937222-gf-16/tied-project/working/REQ-RECONCILIATION_ENGINE/`
- Store facilitator working folder: `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project/working/FACILITATOR-GF-16-1792937222/`
