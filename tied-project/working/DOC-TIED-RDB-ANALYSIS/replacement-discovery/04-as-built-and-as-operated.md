# 04 — As-built and as-operated

| Field | Value |
| --- | --- |
| **Engagement** | `DOC-TIED-RDB-ANALYSIS` |
| **RDB phase** | 5 (slice 5 — runtime topology) |
| **Completed** | 2026-11-18 |
| **Revision** | `c8353309` |

## As-built topology (methodology store)

The **store** (`stdd`) is a single git repository that **builds**, **ships**, and **dogfoods** TIED. Clients are separate repos that receive an installed slice via `tied-install`.

```mermaid
flowchart TB
  subgraph repo [Store repo root]
    BW[build-workspace.sh]
    TI[tied-install.sh]
    BC[scripts/build-commands.sh]
  end
  subgraph build [Build outputs]
    MCPdist[mcp-server/dist/index.js]
    CLI[tied CLI packages/cli]
    AS[@tied/agentstream]
  end
  subgraph corpus [Declarative corpus]
    TB[tied-bundle/ methodology]
    TP[tied-project/ store project]
  end
  subgraph bootstrap [Install engine]
    IL[tools/bootstrap/install-layers.mjs]
    PTS[tools/bundled-prompt-type-skills/]
  end
  BW --> MCPdist
  BW --> CLI
  BW --> AS
  BW --> IL
  TI --> IL
  IL --> TB
  IL --> TP
  MCPdist --> IDE[IDE / tied-cli MCP consumer]
  AS --> IDE
  BC --> WF[workflow_trial_agentstream]
  WF --> AS
```

Canonical component list: `registry/topology.yaml`.

## Deploy / build path (operator)

| Step | Command / artifact | Produces |
| --- | --- | --- |
| 1 | `./build-workspace.sh` | `mcp-server` npm install + `npm run build`; `tools/bootstrap` npm install |
| 2 | Verify | `mcp-server/dist/index.js`, `@tied/cli`, `@tied/agentstream` dist |
| 3 | Client install | `./tied-install.sh /path/to/client` (requires step 1) |
| 4 | Optional factory | `source scripts/build-commands.sh && test-new-tied-client` |
| 5 | Optional MCP smoke | `cd mcp-server && npm test` → `scripts/run-mcp-tests.mjs` |

**Runtime:** No long-lived server is required for default operator flows — MCP is **stdio** from IDE or CLI. HTTP entry exists (`tied-mcp-http`) but store dogfooding emphasizes stdio + agentstream.

## Workspace packages (observed)

| Package | Role |
| --- | --- |
| `@tied/mcp` | MCP tool surface, YAML loader, validation |
| `@tied/cli` | Umbrella `tied` command |
| `@tied/agentstream` | Checklist batch/live, harness drivers |
| `@tied/bootstrap` | Shared install helpers (via `tools/bootstrap`) |
| `@tied/checklist-resume` | Shared resume planner with MCP |
| `@tied/harness-eval` | HMEP import, trial metrics (harness readouts) |
| `@tied/yaml-cli` | CLI YAML operations |

## As-operated patterns

### Developer session (store)

1. Open store in IDE; MCP config points at built `dist/index.js` with `TIED_BASE_PATH` = `.../tied-project`.
2. Agent reads methodology from merged view (`tied-bundle/` + `tied-project/` per slice 4).
3. Changes to **methodology source** happen in store `tied-bundle/` (git); changes to **store project** obligations in `tied-project/`.

### Client onboarding

1. Build store once.
2. `tied-install.sh` copies or links bundle, skills, MCP env into client.
3. Client agents use same MCP binary (local or via `TIED_MCP_BIN` to store).

### Harness / trials

1. `workflow_trial_agentstream wf-NN` (via sourced `build-commands.sh`).
2. Agentstream drives Cursor/Claude harness; evidence under `docs/agent-harness-evaluation/readouts/` and client `evidence/`.
3. Optional HMEP capture imports into harness-eval store (package).

## CI / automation (partial inventory)

| Workflow | Scope |
| --- | --- |
| `.github/workflows/windows-bootstrap-smoke.yml` | Windows `tied-install` / bootstrap path |
| `.github/workflows/observability-receipt-contract-smoke.yml` | Receipt contract smoke |

**GAP-001:** Full hook/pre-commit inventory still incomplete; local `npm test` in `mcp-server/` is the primary integration gate for MCP changes.

## Environment dependencies

| Dependency | Minimum | Used by |
| --- | --- | --- |
| Node.js | 18+ | build, MCP, bootstrap, agentstream |
| npm | bundled with Node | workspaces build |
| git | operator | corpus + working evidence |
| Cursor / Claude CLI | optional | agentstream live paths |

## Coupling notes (analysis)

- **Install ↔ build:** `tied-install` fails closed without `mcp-server/dist/index.js` (CON-023).
- **Agentstream ↔ store dist:** Jev harness paths require store-built `harness-tool-guard.js` (see agentstream README).
- **Skills ↔ bootstrap:** Prompt-type skills materialize from `tools/bundled-prompt-type-skills/` on install.

## Gate G-5

| Criterion | Met |
| --- | --- |
| As-built diagram or narrative | Yes — mermaid + deploy table |
| Store deploy/test path | Yes — build-workspace → install → optional factory/tests/trials |
| Links to CAP | CMP entries reference CAP-002, CAP-007, CAP-008 |