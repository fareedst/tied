# Client-owned migration evidence — `1789177584` (URL-fetch class)

**Orchestrator program:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) Phase 4 (P4-F)  
**Client analysis:** [docs/urlfetch-client-1789177584-agentic-analysis.md](../../docs/urlfetch-client-1789177584-agentic-analysis.md)  
**Access policy:** OD-P3-7 — stdd tooling **read-only** scan; apply commits require client owner approval.

## Authoritative REQ (client repo)

When executing apply on the client tree, persist **`REQ-PSEUDOCODE_MIGRATION`** (or client-scoped equivalent) in the **client** `tied/` with CITDP and a per-request tracker under `working/REQ-*/`. stdd does **not** substitute for client close-out (SC-FLEET-P4-005).

Client token: **`REQ-PSEUDOCODE_MIGRATION_PILOT_1789177584`** — seq **4B** close-out complete (`fleet-migrated-client`).

## Client gate receipts (SC-FLEET-P4-005 — authoritative)

| Phase | Receipt (client repo) |
|-------|------------------------|
| verification | `/Users/fareed/Documents/dev/test/1789177584/working/REQ-PSEUDOCODE_MIGRATION_PILOT_1789177584/gates/verification-result.json` (`allowed: true`) |
| close_out | `/Users/fareed/Documents/dev/test/1789177584/working/REQ-PSEUDOCODE_MIGRATION_PILOT_1789177584/gates/close_out-result.json` (`allowed: true`) |

## Orchestrator evidence (Phase 4 G3 wave)

| Artifact | Path |
|----------|------|
| Read-only inventory scan (P4-F) | `working/fleet-constraint-v2/waves/1789177584/dry-run/inventory-diff.v1.json` |
| Wave sidecar list | `working/fleet-constraint-v2/waves/1789177584/wave-1-sidecars.yaml` |
| G3 receipts + summary | `working/fleet-constraint-v2/waves/1789177584/receipts/` |
| Partition wave | `W-ext-1789177584-1` in `working/fleet-constraint-v2/fleet-wave-partition.v1.yaml` |
| Inventory row | `working/fleet-constraint-v2/client-inventory-manifest.v1.yaml` |

## Phase 3 historical

| Artifact | Path |
|----------|------|
| Pilot dry-run scan | `working/fleet-constraint-v2/pilots/1789177584/dry-run/inventory-diff.v1.json` |
