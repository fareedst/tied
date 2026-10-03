# Orchestrator evidence pointer — client `1789069630` (permissions / TCC class)

**Orchestrator program:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) Phase 4 (P4-F)  
**Repository root:** `/Users/fareed/Documents/dev/test/1789069630`  
**Wave:** `W-ext-1789069630-1`

## Authoritative REQ (client repo — not in stdd)

Migration REQ, CITDP, and close-out tracker live in the **client repository** when the owner executes apply. stdd holds scan + G3 receipt evidence only (SC-FLEET-P4-005).

Suggested client token: **`REQ-PSEUDOCODE_MIGRATION`**.

**Note (2026-09-13, seq 4B):** Client **`REQ-PSEUDOCODE_MIGRATION`** close-out complete — enforce Tier-3 + G3; inventory **`fleet-migrated-client`**.

## Client gate receipts (SC-FLEET-P4-005 — authoritative)

| Phase | Receipt (client repo) |
|-------|------------------------|
| verification | `/Users/fareed/Documents/dev/test/1789069630/working/REQ-PSEUDOCODE_MIGRATION/gates/verification-result.json` (`allowed: true`) |
| close_out | `/Users/fareed/Documents/dev/test/1789069630/working/REQ-PSEUDOCODE_MIGRATION/gates/close_out-result.json` (`allowed: true`) |

Checklist: `working/REQ-PSEUDOCODE_MIGRATION/agent-req-implementation-checklist.yaml` (client repo).

## Orchestrator evidence

| Artifact | Path |
|----------|------|
| Inventory diff | `working/fleet-constraint-v2/waves/1789069630/dry-run/inventory-diff.v1.json` |
| Sidecar list | `working/fleet-constraint-v2/waves/1789069630/wave-1-sidecars.yaml` |
| G3 receipts | `working/fleet-constraint-v2/waves/1789069630/receipts/summary.json` |
| G3 wave summary | `working/fleet-constraint-v2/waves/1789069630/receipts/summaries/W-ext-1789069630-1.json` |
| Inventory row | `working/fleet-constraint-v2/client-inventory-manifest.v1.yaml` (`1789069630` — `constraint-ready-v2`, header-only 0) |
