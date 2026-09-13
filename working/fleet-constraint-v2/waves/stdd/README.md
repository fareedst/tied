# stdd fleet wave artifacts (Phase 4 G3)

Wave sidecar lists (`wave-*-sidecars.yaml`) and G3 receipts live here. Receipts prove **analysis disposition** at gate G3; they do **not** by themselves mark `fleet-migrated-client`.

## Header apply (APPLY_MIGRATION_ASSIST)

Pilot workflow: `working/fleet-constraint-v2/pilots/pilot-migration-workflow.v1.md`.

stdd-only assist tooling:

```bash
# Dry-run (default) — planned actions + stable hash
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh fleet-stdd-apply-dry-run

# Apply (destructive) — requires matching dry-run hash or --force
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-fleet-stdd-apply.ts --all-legacy --apply --receipts
```

Dry-run output: `dry-run/apply-all-legacy.v1.json` (or `apply-W-stdd-N.v1.json` per wave). Snapshots before apply: `dry-run/snapshots/`.

After apply, refresh inventory and dashboard:

```bash
run-fleet-inventory-scan.ts --apply
run-fleet-dashboard-refresh.ts
```
