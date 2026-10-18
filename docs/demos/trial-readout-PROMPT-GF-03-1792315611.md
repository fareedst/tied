# Trial readout: PROMPT-GF-03 → client `1792315611`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-18 |
| **Touchpoint** | `/xlate` (translate-sponsor-intent) + **build-plan** (facilitator grading, Track A) |
| **Trial prompt** | [PROMPT-GF-03](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-03) |
| **Catalog map** | [TIED-DEMO-03](catalog-tied-compact-tools.md) — Schema evolution record reader |
| **Exercise bridge** | DATA-03 (catalog label — schema evolution / versioned records) |
| **Client root** | `/Users/fareed/Documents/dev/test/1792315611` |
| **Product REQ** | `REQ-SCHEMA_RECORD_READ` (client `tied-project/`) |
| **Proof boundary (primary)** | `executable_behavior` — v1/v2 normalization, Vitest + `tsc` |
| **Proof boundary (secondary)** | `traceability_structure` — R+A+I, integrated working folder |
| **Outcome** | **Successful product implementation; graded trial recorded; subject machine close-out incomplete** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (PROMPT-GF-03)

Build a library that reads records that may be in an older or newer JSON shape. Support missing fields, defaults, and unknown fields without crashing. Tests must cover at least two schema versions.

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| older/newer JSON shape | **wire version** v1 (legacy `name`/`active`) and v2 (`schemaVersion: 2`, `displayName`, `status`, `tags`) | Client `README.md`; `tied-project/working/REQ-SCHEMA_RECORD_READ/PLAN.md`; vocab `schema-record-read.md` |
| missing fields | Key absent or JSON `null` on known keys → **canonical defaults** | PLAN refine table; `adaptV1` / `applyDefaults` tests |
| unknown fields | Wire keys outside version **known-key set** → **`extensions`** bag | REQ satisfaction criteria; `collectExtensions` / adapter tests |
| without crashing | `readRecord` **never throws**; `{ ok: false, error }` for hard issues | `readRecord.test.ts` |
| two schema versions | Module tests for v1 and v2 adapters + composition | Six Vitest files, 23 cases |

**Costly choices (consequence ladder):** Caller-supplied JSON with **no size/depth caps** in v1 (CITDP **external_input** trigger). Documented residual risk — **reversible** for disposable demo, **costly** if promoted without hardening. Prototype-pollution keys copied like ordinary extension keys unless sponsor later requests stripping.

---

## What was built (description)

- **Interface:** TypeScript ESM library `schema-record-read@0.1.0`, Vitest, no UI.
- **Behavior:** `readRecord` detects wire version, adapts v1/v2 wire objects to a **canonical normalized record** (`id`, `displayName`, `status`, `tags`, `extensions`), applies defaults, returns structured results.
- **Modules:** `collectExtensions`, `detectVersion`, `adaptV1`, `adaptV2`, `applyDefaults`, `readRecord`; shared types in `canonicalSchema.ts`.
- **TIED stack (client):** `REQ-SCHEMA_RECORD_READ`, `ARCH-SCHEMA_RECORD_LAYERS`, `IMPL-SCHEMA_RECORD_READ` with grammar-v2 pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-SCHEMA_RECORD_READ.yaml` (**integrated** / **advisory**); checklist tracker, gate ledger with adherence events, request evidence envelope under `tied-project/working/REQ-SCHEMA_RECORD_READ/`.
- **Bootstrap:** Disposable client (`test-new-tied-client` pattern); linked install; git commits `14ecd54` (TIED 3.0.0), `a58228a` (feature). Bootstrap audit **G4** with **`with_consistency: false`** at onboarding.
- **Verification (2026-10-18):** `npm test` — **23 tests**, **6 files**, all green; `npm run build` (`tsc -b`) green. Facilitator `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (session run; summary under store `tied-project/working/FACILITATOR-GF03-1792315611/evidence/tied-validate-consistency-summary.json`).

---

## Outcome record

**Implementation outcome:** Successful. The client shipped the schema-evolution reader, documented version rules and error codes, module-level Vitest coverage, and an **integrated-depth** TIED working folder for `REQ-SCHEMA_RECORD_READ`.

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A−**, Test strategy **B+**, Algorithm / implementation **A−**, Process adherence **B**, Methodology learning readout **N/A**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built, not repaired in this session):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close-out** | **fail** | Latest `close_out` receipt `allowed: false` — `pending_required_step:traceable-commit`, `psa_missing:IMPL-SCHEMA_RECORD_READ`, `pseudocode_analysis_incomplete`, `finding_unresolved` |
| **Process contract** | **partial** | Many checklist slugs completed with typed evidence in gate ledger; **`traceable-commit` not** in `execution_evidence.completed`; verification gate also **`allowed: false`** (PSA / pseudocode analysis / inquiry warns) |
| **Adherence ledger** | **partial** | `gate-ledger.jsonl` contains `outcome_verified` rows from sync; full `tied_adherence_reconcile_run` with process grade **not** recorded for facilitator close-out |

**GF-01 cohort extras:** This trial did **not** add `feedback.yaml` or `trial-prompt-interaction-inventory.v1.json`.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL indexes + details** | `tied-project/requirements.yaml`, `requirements/REQ-SCHEMA_RECORD_READ.yaml`, matching ARCH/IMPL paths | Traceability stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-SCHEMA_RECORD_READ.yaml` | Integrated depth, `external_input` trigger, quality matrix |
| **Request envelope** | `tied-project/working/REQ-SCHEMA_RECORD_READ/evidence/request-evidence-envelope.v1.json` | Artifact registry; six advisory `finding_unresolved` / `warn_not_success` entries on inquiry gates |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test + tsc evidence |
| **Gate ledger** | `tied-project/working/REQ-SCHEMA_RECORD_READ/gates/gate-ledger.jsonl` | pre_implementation **allowed**; verification / close_out **blocked** on latest receipts |
| **Bootstrap audit** | `tied-project/working/tied-new-client-audit.v1.json` | G4 onboarding receipt |
| **Validate summary (facilitator)** | Store `tied-project/working/FACILITATOR-GF03-1792315611/evidence/tied-validate-consistency-summary.json` | `tied_validate_consistency` **ok: true** on 2026-10-18 |
| **Project lint (facilitator)** | Session MCP | `tied_project_lint` **ok: false** — pseudocode gate diagnostics on `IMPL-SCHEMA_RECORD_READ` (aligns with `psa_missing` / `pseudocode_analysis_incomplete`) |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-03 mapped to explicit version detection, defaults vs null, extensions, and non-throw API in PLAN, README, REQ, and vocab — matches **TIED-DEMO-03** / DATA-03 traceability emphasis. |
| Traceability closure | 20% | **A−** | Full R+A+I + persisted CITDP; REQ **Implemented**; facilitator `tied_validate_consistency` clean. Gaps: REQ `traceability.tests` lists three files vs six on disk; pseudocode lint gate failures vs Layer B contracts in sidecar. |
| Test strategy | 20% | **B+** | Six module/composition test files; **L0–L1** (v1/v2 golden paths, type errors, non-object roots, never-throws). No mutation harness, property oracle, or L3+ combined wire faults for DATA-03 depth. |
| Algorithm / implementation | 20% | **A−** | Layered adapters, extensions bag, structured errors; honest v1 limits in CITDP (unbounded JSON). |
| Process adherence | 15% | **B** | Integrated tracker, three-phase adversarial inquiry artifacts, envelope — comparable weight to GF-02. **Weaker gate disposition:** verification and close_out **not allowed**; missing `traceable-commit`; PSA/pseudocode analysis gaps. |
| Methodology learning readout | 10% | **N/A** | Loop 3 not in scope for PROMPT-GF-03. |

**Catalog disposition note:** **TIED-DEMO-03** remains catalog `idea` in the store doc; this client is a **built instance** via **PROMPT-GF-03**.

**Exercise catalog lens ([§9 three-pass model](catalog-compact-programming-exercises.md#9-a-more-revealing-grading-experiment)):** Pass 1 (design) — IMPL sidecar adapter pipeline; Pass 2 (tests vs defects) — no mutation harness; Pass 3 (hidden disturbances) — not run.

**Disturbance ladder used:** **L0** (v1/v2 golden normalization), **L1** (invalid field types, non-object roots, unsupported version strings). Not L3–L6.

**GF-02 comparison (facilitator):** Similar integrated folder weight and envelope inquiry warns; GF-03 has **clearer versioned-record semantics** (DATA-03) and **similar L0–L1 test cap**; **weaker** verification/close_out gate receipts than GF-02 after facilitator repair.

**GF-25 comparison (facilitator):** GF-03 declares **higher process depth** (integrated vs minimal) but **worse machine close-out** than GF-25’s minimal-path allowed gates in some receipts.

---

## Facilitator follow-ups

| # | Action | Status (2026-10-18) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog row | **Done** — this document |
| 2 | `tied_validate_consistency` on client | **Done** — `ok: true` (facilitator summary in store working folder) |
| 3 | Track B: `traceable-commit`, PSA, pseudocode analysis, green close_out on client | **Open** — sponsor-only |
| 4 | L2+ DATA-03 disturbances or mutation testing | **Open** — separate session |
| 5 | Align REQ `traceability.tests` with six Vitest files | **Open** — client maintainer |

---

## Deferred (separate trial)

- **Track B** process repair on disposable client `1792315611` before claiming process **A−**.
- GF-01-style **feedback.yaml** + **trial-prompt-interaction-inventory** for Kaizen digest cohort.

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md)
- [Agent resilience exercise catalog](catalog-compact-programming-exercises.md)
- Client product README: `/Users/fareed/Documents/dev/test/1792315611/README.md`
- Client PLAN: `/Users/fareed/Documents/dev/test/1792315611/tied-project/working/REQ-SCHEMA_RECORD_READ/PLAN.md`
