# SC-CGH-06 — frozen 4015 fixture gate replay

**Date:** 2026-11-18  
**Script:** [sc-cgh-06-replay.mjs](./sc-cgh-06-replay.mjs) (imports `mcp-server/dist` after `npm run build` in `mcp-server/`)

## Inputs

| Artifact | Path |
| --- | --- |
| Product CITDP | [../fixtures/product-citdp-1794984015.yaml](../fixtures/product-citdp-1794984015.yaml) |
| Tracker | [../fixtures/disposable-tracker-1794984015.yaml](../fixtures/disposable-tracker-1794984015.yaml) |

## Results (`tied_gate_check`)

| Phase | `allowed` | `exit_code` | `malformed_citdp` in reasons |
| --- | --- | --- | --- |
| `verification` | `true` | `0` | no |
| `close_out` | `true` | `0` | no |

Captured output:

```json
{
  "verification": { "allowed": true, "exit_code": 0, "reasons": [], "receipt_path": null },
  "close_out": { "allowed": true, "exit_code": 0, "reasons": [], "receipt_path": null }
}
```