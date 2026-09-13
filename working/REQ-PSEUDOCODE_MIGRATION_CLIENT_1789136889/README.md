# Orchestrator evidence pointer — client `1789136889` (TCP connect class)

**Orchestrator program:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) Phase 4 (P4-F)  
**Repository root:** `/Users/fareed/Documents/dev/test/1789136889`  
**Wave:** `W-ext-1789136889-1`

## Authoritative REQ (client repo — not in stdd)

Migration REQ, CITDP, and close-out tracker live in the **client repository** when the owner executes apply. stdd holds scan + G3 receipt evidence only (SC-FLEET-P4-005).

Client token: **`REQ-PSEUDOCODE_MIGRATION`** — seq **4B** close-out complete (`fleet-migrated-client`).

## Client gate receipts (SC-FLEET-P4-005 — authoritative)

| Phase | Receipt (client repo) |
|-------|------------------------|
| verification | `/Users/fareed/Documents/dev/test/1789136889/working/REQ-PSEUDOCODE_MIGRATION/gates/verification-result.json` (`allowed: true`) |
| close_out | `/Users/fareed/Documents/dev/test/1789136889/working/REQ-PSEUDOCODE_MIGRATION/gates/close_out-result.json` (`allowed: true`) |

## Orchestrator evidence

| Artifact | Path |
|----------|------|
| Inventory diff | `working/fleet-constraint-v2/waves/1789136889/dry-run/inventory-diff.v1.json` |
| Sidecar list | `working/fleet-constraint-v2/waves/1789136889/wave-1-sidecars.yaml` |
| G3 receipts | `working/fleet-constraint-v2/waves/1789136889/receipts/summary.json` |
