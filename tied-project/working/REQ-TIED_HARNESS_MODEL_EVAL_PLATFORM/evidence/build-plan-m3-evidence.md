# build-plan M3 evidence

**date:** 2026-11-13  
**prompt_type:** build-plan  
**request_token:** REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM

## Delivered

- Schema v3 (`provider_reported_cost`, `actual_charged_cost`)
- `src/billing/*` ledger load + apply + import
- CLI `billing import --ledger`, `report reconcile`
- Contract `harness-eval-billing-ledger.schema.json` + `sample-ledger-v1.yaml`
- IMPL pseudo-code blocks IMPORT_BILLING_LEDGER, MIGRATE_EVAL_SCHEMA_V3, APPLY_BILLING_LEDGER_ENTRIES, REPORT_BILLING_RECONCILE
- REQ satisfaction criteria SC-HMEP-M3-01…05 (and M2 index backfill)

## Verification

```bash
cd mcp-server/packages/harness-eval && npm test
node --test mcp-server/contracts/harness-eval/*.test.mjs
```

**Result:** 23 package tests + 3 contract tests pass.

## Gates

- `pre_implementation`: allowed (advisory, minimal)
- `tied_validate_consistency`: run post-REQ update
- M3 **`@close-out`**: not run (deferred)

## Do next

Sponsor **`@close-out`** for M3 traceable commit.
