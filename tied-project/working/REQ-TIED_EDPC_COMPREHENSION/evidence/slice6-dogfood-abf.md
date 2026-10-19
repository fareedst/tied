# Slice 6 dogfood — workflows A + B + F

**Date:** 2026-10-19  
**Tier:** `toolchain_readonly` · **Target:** stdd (`/Users/fareed/Documents/dev/chatgpt/stdd`)  
**Scoped analysis run_id:** `edpc-dogfood-slice6-20261019`  
**Baseline revision:** `6b498c9b`

| Step | Tool | Result |
| --- | --- | --- |
| A | `tied_edpc_engagement_validate` (gate tracker) | **ok: true** |
| A | `tied_edpc_access_validate` (evidence-access-matrix) | **ok: true** |
| B | `tied_easar_inventory_receipt_build` (`mcp-server/src/edpc`, 9 files) | **written** [../inventory.v1.json](../inventory.v1.json) |
| F | `tied_edpc_publish_build` | **ok: true**, `gaps: []` → [edpc/edpc-publish-manifest.v1.json](./edpc/edpc-publish-manifest.v1.json) |

**SCM shell:** [edpc/scm-snapshot-shell.v1.yaml](./edpc/scm-snapshot-shell.v1.yaml) (baseline aligned to git short SHA).

**Envelope:** [request-evidence-envelope.v1.json](../request-evidence-envelope.v1.json) (integrated scan; see gaps for evidence-chain-profile and advisory inquiry warns).

**CLI note:** Run `tied-cli` gate persistence with **absolute** `gates_dir` / `ledger_path` or cwd = repo root — relative paths under `tied-project/...` otherwise land under `mcp-server/tied-project/`.
