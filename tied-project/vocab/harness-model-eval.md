# Harness model evaluation (HMEP) (canonical)

**Scope:** `@tied/harness-eval`, stream-json and manifest ingestion, configuration fingerprints, HMEP store layout, and M1 proof boundaries for token metrics vs workflow trial readouts.

**Traceability:** [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM](../requirements/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml) · [ARCH-TIED_HARNESS_MODEL_EVAL_PLATFORM](../architecture-decisions/ARCH-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml) · [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM](../implementation-decisions/IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml)

**See also:** [`routing.md`](routing.md) (row **2c**) · [`domain-references.md`](domain-references.md) · [`harness-metering-canary.md`](harness-metering-canary.md) · [`agentstream.md`](agentstream.md) · [`quality-assurance.md`](quality-assurance.md) · [PLAN.md](../working/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/PLAN.md)

---

## Canonical terms

| Preferred term | Meaning |
| --- | --- |
| **HARNESS_EVAL_STORE** | Default eval store root under `tied-bundle/reports/harness-eval/`. |
| **harness-eval** | CLI and package normalizing Cursor/Claude telemetry and workflow orchestrator manifests into comparable rows. |
| **manifest-only import** | Import trial metadata without JSONL; token numeric fields remain `null` until stream-json is present. |
| **configuration fingerprint** | SHA-256 over stable harness, model, and effort fields for idempotent comparison. |
| **origin_id** | Idempotent key for a single token observation row in the eval store. |
| **proof boundary** | Token and harness-eval metrics are not merged into `@record-wf-trial` prose grading in HMEP M1. |
| **engineering-suite-v1** | Named harness-eval suite scenario family for engineering workflow fixtures. |
| **SC-HMEP-M1** | HMEP milestone 1 scope boundary: store schema, import paths, and explicit non-implications vs facilitator readouts. |
| **SC-HMEP-M2** | Pricing catalog, schema v2 cost columns, suite verifiers (`token_present`), and `report cohort` CLI. |
| **SC-HMEP-M3** | Billing ledger import, schema v3 provider/actual cost columns, `report reconcile` (file-backed; no live APIs). |
| **SC-HMEP-M4** | Committed regression baselines and `replay batch` historical import manifest. |
| **billing ledger** | Operator YAML under `docs/demos/harness-eval/billing/` keyed by `trial_id`; opt-in via `billing import --ledger`. |
| **regression baseline** | Committed metrics manifest under `docs/demos/harness-eval/baselines/` with content-integrity hash. |
| **replay manifest** | Batch import list under `docs/demos/harness-eval/replay/` (`harness-eval-replay-manifest-v1`). |
| **baseline bind** | Match expectation to trial via `wf_id` + `harness` (optional `model_slug` / `trial_id` pin). |
| **list-price-v1** | Committed USD/MTok catalog under `docs/demos/harness-eval/pricing/`. |

## Boundaries

- Workflow trial **session grading** remains under **`/record-wf-trial`** vocabulary; HMEP supplies **token metrics** and import receipts, not substitute grades.
- **`tied_validate_consistency`** and checklist gates are unchanged by harness-eval ingest.

## Alphabetical index

| Term | Section |
| --- | --- |
| configuration fingerprint | Canonical terms |
| engineering-suite-v1 | Canonical terms |
| harness-eval | Canonical terms |
| HARNESS_EVAL_STORE | Canonical terms |
| manifest-only import | Canonical terms |
| origin_id | Canonical terms |
| proof boundary | Canonical terms |
| baseline bind | Canonical terms |
| billing ledger | Canonical terms |
| replay manifest | Canonical terms |
| regression baseline | Canonical terms |
| SC-HMEP-M1 | Canonical terms |
| SC-HMEP-M3 | Canonical terms |
| SC-HMEP-M2 | Canonical terms |
| SC-HMEP-M4 | Canonical terms |
