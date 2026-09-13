# Pilot migration workflow v1

**Program:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) Phase 3  
**Tooling:** [REQ-PSEUDOCODE_MIGRATION_TOOLING](../../tied/requirements/REQ-PSEUDOCODE_MIGRATION_TOOLING.yaml) · [IMPL-PSEUDOCODE_MIGRATION_TOOLING](../../tied/implementation-decisions/IMPL-PSEUDOCODE_MIGRATION_TOOLING-pseudocode.md)  
**Gate stage:** G2 (verification-blocking trial on pilot client REQ only; orchestrator advisory through Phase 3 exit)

## Workflow

1. **BUILD_PILOT_INVENTORY** — scan active IMPL sidecars; classify migration state; write `inventory-diff.v1.json` under `pilots/{client_id}/dry-run/`.
2. **RUN_MIGRATION_DRY_RUN** — compute deterministic hash of planned assist-only edits (v2 header insertion per OD-P3-4); no writes when `dry_run: true`.
3. **APPLY_MIGRATION_ASSIST** (optional) — insert `Grammar-Version: v2` where missing on in-scope wave list only.
4. **EMIT_MIGRATION_RECEIPT** — `pseudocode_analyze` with G2 profile; write `constraint-migration-receipt.v1` under `pilots/{client_id}/receipts/`.
5. **REVERT_MIGRATION_APPLY** — restore sidecar bytes from dry-run snapshot; re-emit advisory G2 receipt to prove rollback without analyzer code change.

## Harness entrypoints

From repository root (after `mcp-server` build):

```bash
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh pilot-inventory
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh pilot-g2
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh pilot-g2-rollback
```

## Dry-run hash (SC-FLEET-P3-003)

`inventory-diff.v1.json` includes `dry_run_content_hash` (SHA-256 of normalized JSON: sidecar path + planned actions). Re-running scan without sidecar changes MUST reproduce the hash.

## External pilots (OD-P3-7)

Default **read-only** scan from stdd tooling. Apply commits require client-owner approval on a client branch.
