# Constraint migration receipt v1 — collector design

**Schema ID:** `constraint-migration-receipt.v1` (OD-P2-2)  
**Artifacts:** [`constraint-migration-receipt.v1.schema.json`](constraint-migration-receipt.v1.schema.json) · [`constraint-migration-receipt.v1.example.json`](constraint-migration-receipt.v1.example.json)  
**Program context:** Phase 2 G1 **advisory**; methodology pin **48d1fbb+**

## Purpose

A **constraint migration receipt** is a deterministic, machine-readable snapshot of pseudocode analysis for one sidecar (or qualification fixture) at a pinned analyzer and methodology lineage. It proves **migration-state analysis** for fleet governance; it does **not** replace [REQ-REQUEST_EVIDENCE_ENVELOPE](../../tied/requirements/REQ-REQUEST_EVIDENCE_ENVELOPE.yaml) checklist/inquiry/verification envelopes.

Collectors (P2-F harness hooks, future migration CLI) **project** analyzer and validator outputs into this schema. Human readers and inventory automation must treat **unknown, truncation, unsupported, and budget-exceeded** outcomes as **first-class disclosures**, never as implicit pass.

## Section semantics

| Section | Source (typical) | Semantics |
|---------|------------------|-----------|
| `receipt_meta` | Harness | `schema_version` **1**; unique `receipt_id`; `gate_stage` **G1** in Phase 2; `program_gate_policy` **advisory** through Phase 2 exit. |
| `pin` | Run config | `methodology_pin` (e.g. `48d1fbb+`); `analyzer_build_identity` (version + build); optional `manifest_entry_id` from qualification manifest or future inventory row. |
| `subject` | Sidecar under test | Repo-relative `sidecar_path`; `input_identity` SHA-256 of normalized sidecar bytes; `grammar_version`; `annotation_profile` (migration tier). |
| `layer_a` | `tied_validate_consistency` (optional) | When `applicable` is false, `ok` documents skip policy. When run, `tied_consistency_ok` mirrors consistency validation. |
| `layer_b` | `pseudocode_validate` / structural compat | `validator_schema_version` **layer-b-pseudocode-validator.v1**; contract precision counters; optional SHAPE-003..006 rows. |
| `layer_c` | `pseudocode_analyze` / gate | Flags `gate_mode`, `typed_flow`, `constraint_flow`; `constraint_gate_errors_policy`; aggregate `ok`; **must** set `analysis_truncated` / `diagnostics_truncated` from report. |
| `constraint` | Report `constraint_language` section | Mirrors solver/alias/budget fields; **explicit** `solver_truncated`, `alias_analysis_truncated`, `budget_exceeded`, `constraint_diagnostics_truncated`. |
| `unknown_summary` | Aggregated `unknowns` + caps | Counts: `unknown`, `truncated`, `unsupported`, `prose_only`, `budget_exceeded`. |
| `constraint_gate_errors` | Proven constraint diagnostics | May be **non-empty under G1**; each row includes `proven: true` for violations counted as gate errors. |
| `promotion_readiness` | P2-F / P2-G | Phase 2 exit booleans; fixture receipts may leave all **false** until qualification runs. |

## Unknown / truncation policy (MUST NOT silent pass)

Aligned with [Phase 1 unknown policy](../../docs/pseudocode-constraint-v2-fleet-migration-phase-1-plan.md) and Phase 2 plan § Unknown policy:

1. Collectors **MUST NOT** emit `layer_c.ok: true` with zero `unknown_summary` counts when `layer_c.analysis_truncated` or `layer_c.diagnostics_truncated` is true (JSON Schema enforces `ok: false` for those flags).
2. When `constraint.solver_truncated` is true, `unknown_summary.truncated` **MUST** be ≥ 1 (JSON Schema `allOf`).
3. Under **G1 advisory**, non-zero unknowns or non-empty `constraint_gate_errors` **disclose** risk; they do not alone define `promotion_readiness.qualification_green`. They **MUST NOT** be omitted when present in the analyzer report.
4. Operators **MUST NOT** treat inventory `last_receipt_path` or a green-looking `layer_c.ok` as fleet-migrated proof when truncation flags or unknown counts indicate incomplete analysis.

## Relationship to client inventory

[`client-inventory-manifest.v1.schema.json`](client-inventory-manifest.v1.schema.json) `clients[].last_receipt_path` will reference a receipt file for that client (Phase 4 population). Phase 2 validates schema and example only; inventory rows remain template-level.

## Relationship to request evidence envelope

REQ request evidence envelopes aggregate checklist, inquiry, verification, and pseudocode-analysis artifacts for **feature delivery**. Receipts are **narrower**: one sidecar/fixture, migration-oriented Layer A/B/C + constraint projection. Envelope builders may **link** to a receipt path as read-only provenance; P2-D does not implement envelope emission.

## Validation

From repository root (requires Node 18+):

```bash
npx --yes ajv-cli validate \
  -s working/fleet-constraint-v2/constraint-migration-receipt.v1.schema.json \
  -d working/fleet-constraint-v2/constraint-migration-receipt.v1.example.json \
  --spec=draft2020 --strict=false
```

Expected: `working/fleet-constraint-v2/constraint-migration-receipt.v1.example.json valid`

## P2-F collector (implemented)

Harness: `working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/lib/constraint-migration-receipt.ts`  
Runner: `run-fleet-g1-qualification.ts` via `run-harness.sh fleet-g1`  
Output: `qualification/fleet-g1/receipts/*.receipt.json` + `fleet-g1/summary.json`

Sample validation (after a fleet-g1 run):

```bash
npx --yes ajv-cli validate \
  -s working/fleet-constraint-v2/constraint-migration-receipt.v1.schema.json \
  -d working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/fleet-g1/receipts/tier-b-stdd-IMPL-MODULE_VALIDATION.receipt.json \
  --spec=draft2020 --strict=false
```
