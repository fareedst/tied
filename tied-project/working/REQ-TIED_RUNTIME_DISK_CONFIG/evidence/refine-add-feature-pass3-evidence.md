# add-feature — pass 3 full runtime disk

**request_token:** REQ-TIED_RUNTIME_DISK_CONFIG  
**Date:** 2026-11-03  
**linked_plan:** [PLAN-rdc-full-runtime-disk-pass3.md](../PLAN-rdc-full-runtime-disk-pass3.md)

## Resolved

- **Scope:** Non-secret operator toggles → disk; secrets env-only; paths unchanged (pass 2).
- **Token:** Extend **REQ-TIED_RUNTIME_DISK_CONFIG** (pass 3 track), not a new REQ.
- **Schema:** `tied-store-config.v1` **`operator:`** + gitignored **`.tied/operator.local.yaml`**.
- **Depth / gates:** minimal / advisory.

## Gate

`pre_implementation`: **allowed: true** (2026-11-03; minimal depth).

## Slice 1 shipped (code)

- `resolveOperatorFlagsForInstall` / `loadMergedOperatorConfig` in `tied-runtime-config.mjs`
- `installMcpLayer` disk-first `collect_metrics`
- Unit tests green; **SC-RDC-OPERATOR-DISK** appended to REQ detail

## Next slices

See plan todos: envelope hooks, agentstream readers, JEV overlay, docs, verification, close-out.
