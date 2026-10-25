# Refine-plan pass 2 — REQ-TIED_CLI_MCP_JSON_BASE_PATH

**Date:** 2026-10-25  
**Prompt type:** refine-plan  
**Authoritative PLAN:** [../PLAN.md](../PLAN.md)

## Trigger

Sponsor question: does the plan account for TIED clients with mcp.json for **Cursor and/or Claude**?

## Delta vs pass 1

| Area | Pass 1 | Pass 2 |
| --- | --- | --- |
| Harness | Both paths in RESOLVE row | **§1.1 Dual harness** — four layout rows + operator contract |
| Precedence | CITDP test bullet only | **Normative** in PLAN + CITDP success criteria |
| Tests | Generic mcp read | **Cursor-only**, **Claude-only**, **both-present** RED |
| CITDP | — | `REQ-TIED_CLAUDE_HARNESS` affected; **RISK-003** divergent mcp files |
| Docs | SKILL + AGENTS | + **bootstrap README** |

## Gate

Re-run `pre_implementation` after CITDP edit — **allowed: true** — [`pre_implementation-2026-10-25T14-45-50-757Z.json`](../gates/pre_implementation-2026-10-25T14-45-50-757Z.json).

## Next step

`@build-plan` unchanged.
