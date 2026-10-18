# Slice 6 verification gate — portable export (Stage 9)

**run_id:** `easar-slice6-verify-20261019`  
**Tracker:** [gate-tracker-slice6-verification.yaml](../gate-tracker-slice6-verification.yaml)  
**Receipt:** [verification-2026-10-18T08-56-08-007Z.json](../gates/verification-2026-10-18T08-56-08-007Z.json)

## Deliverables

| Artifact | Path |
| --- | --- |
| Portable map | [recovery-portable-map.v1.yaml](./recovery-portable-map.v1.yaml) |
| Export manifest | [recovery-export-manifest.v1.json](./recovery-export-manifest.v1.json) |
| MCP tool | `tied_easar_recovery_export_build` |

## Machine gate

- **allowed:** `true`
- **diagnostics:** `warn_not_success`, `finding_unresolved` (advisory)
- **Tests:** `npm test --prefix mcp-server -- easar-receipts recovery-export` (pass)

## Completion signals (slice-level)

- **Machine verification:** **pass** — checklist gate `allowed=true` for Slice 6 tracker
- **Process contract:** **pass** — manifest extended; inquiry paired with distinct `run_id`
- **Program close_out:** **unchanged** — MVP close_out `easar-close-out-20261018` remains valid (no LEAP re-close in this pass)
