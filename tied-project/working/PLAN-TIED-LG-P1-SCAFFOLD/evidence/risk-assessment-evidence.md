# risk-assessment — PLAN-TIED-LG-P1-SCAFFOLD

**Date:** 2026-10-12 · **depth_tier:** integrated · **gate_policy:** per_citdp

| Risk | Ladder | Mitigation |
| --- | --- | --- |
| Wrong `TIED_BASE_PATH` on live MCP | Costly | Preflight via `tied_config_get_base_path`; charter base-path table |
| SQLite checkpoint path escape | Reversible | Run dir under explicit `run_directory`; tests use tmp_path |
| Subprocess MCP abuse | Costly | Read-only tool allowlist in scaffold; mock transport in CI |
| Minimal depth copied from P0 | Costly | Child CITDP `depth_tier: integrated`; persistence trigger recorded |

**Eligibility triggers:** `persistence`, `external_input` (MCP subprocess).
