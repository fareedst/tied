# Phase 4 report — data, state, integrations

**Engagement:** `DOC-TIED-RDB-ANALYSIS`  
**RDB phase:** 4 (slice 4)  
**Date:** 2026-11-18  
**Revision:** `c8353309`

## Findings

| ID | Finding |
| --- | --- |
| DAT-001–010 | Data entities for indexes, details, sidecars, merge view, working, vocab, install metadata, store corpus |
| INT-001–008 | MCP consumers: IDE, CLI, linked store, Claude harness, agentstream, host scripts, resources, env overrides |
| CON-016–022 | Data-layer contracts added; CON-002/003 deepened with intended/observed |
| G-4 | Met |

## Changes to understanding

- **Store mode** is not “project-only”: methodology merge still applies via **repo-root** `tied-bundle/` (CON-021), while `TIED_BASE_PATH` remains `tied-project/`.
- **Linked clients** may temporarily lack local methodology indexes (CON-022); operators rely on `TIED_MCP_BIN`, bundle env, or full install.

## Risks and gaps

| ID | Status |
| --- | --- |
| GAP-004 | Open — MCP tool catalog |
| GAP-005 | New — `tied-project/config.yaml` identity routing modes not fully enumerated |

## Verification performed

- Read `mcp-server/src/yaml-loader.ts` (merge, methodology root, write isolation) — EV-018.
- Read `mcp-server/src/tied-layout.ts` — EV-018.
- Read `tied-bundle/docs/detail-files-schema.md` + using-tied-without-mcp — EV-019, EV-020.
- Read `yaml-loader.test.ts` cases for write isolation — EV-018 (test names cited in report only).

## Next investigations

- **Slice 5:** `04-as-built-and-as-operated.md`, topology (mcp-server, bootstrap, agentstream), **G-5**.