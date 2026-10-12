# LangGraph pilot (`tied-langgraph-pilot`)

Phase 1 scaffold for [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md).

## Install

```bash
cd tools/langgraph-pilot
uv venv && uv pip install -e ".[dev]"
# or: python -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"
```

## Tests (CI)

```bash
uv run pytest
```

Unit tests mock MCP JSON-RPC; no live Node MCP server is required.

## Optional live MCP smoke

From repo root, with `TIED_BASE_PATH` pointing at `tied-project/`:

```bash
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_config_get_base_path '{}'
```

The pilot `McpClient` can spawn `node mcp-server/dist/index.js` when configured with a real transport (see `tied_langgraph/mcp_client.py`).

## Run ledger (P2)

Schema: [`schemas/langgraph-run-ledger.v1.json`](schemas/langgraph-run-ledger.v1.json). Observations append under the run directory via `tied_langgraph.ledger.append_observation` (tool, commit, exit code, artifact path, sha256).

Envelope gaps drive routes through `tied_langgraph.routing` (`continue` | `collect_more` | `escalate`); error-severity gaps never continue. Staleness compares `candidate_commit` to evidence commit in `tied_langgraph.policies.staleness`.
