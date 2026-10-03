# Phase 4b — RISK-UNIFIED-005 operator-path inventory

| Path | Status (4b) | Replacement / notes |
| --- | --- | --- |
| `tools/agent-stream/` (Ruby ATDD harness) | **Removed** | `tied agentstream` / `scripts/run-feature-batch-agentstream.sh` |
| `scripts/adherence_append_action_attempted.rb` | **Removed** | `mcp-server/dist/cli/adherence-append-action-attempted.js`; `.cursor/hooks/log.rb` TS bridge |
| `scripts/run-feature-batch.sh` | **Retired Ruby default** | Thin `exec` to `run-feature-batch-agentstream.sh` |
| `scripts/yaml_tool.sh` | **Deferred (Tier 3)** | `@tied/yaml-cli` / `tied yaml` for canonical path; shell still invokes Ruby sorter |
| `scripts/lint_yaml.sh` | **Deferred (Tier 3)** | `tied yaml lint` where documented; shell front-end may remain |
| `scripts/compare_yaml_dirs.rb` | **Deferred (OQ-4-3)** | Not required for 4b removal gate |
| `scripts/yaml_semantic_compare.rb` | **Deferred (OQ-4-3)** | Not required for 4b removal gate |
| `scripts/validate_tokens.sh` | **Deferred (4e backlog)** | Out of 4b scope |
| `tools/agentstream/` (Go) | **Retained until 4d** | Legacy opt-in (`TIED_AGENTSTREAM_IMPL=go`) and oracle tests after **4c** TS default |

**Operator unified suite (Node):** `cd mcp-server && npm run build && npm test` covers MCP, adherence hook TS bridge, and `@tied/*` packages. **Go** remains on PATH for agentstream until slice **4c/4d**.
