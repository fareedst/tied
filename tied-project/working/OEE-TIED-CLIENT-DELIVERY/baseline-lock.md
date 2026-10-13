# Baseline lock — OEE-TIED-CLIENT-DELIVERY

**Git revision:** `b74d9548ffba11e44e081dbc055fe09824544497`  
**Repository:** STDD (TIED methodology store)  
**Scope:** Methodology delivery surfaces — bootstrap, MCP, skills, checklist gates — not application product code in downstream clients.

## Evidence sources inventoried

| Source type | Location | Use |
| --- | --- | --- |
| Operator docs | `AGENTS.md`, `tied-bundle/docs/client-development-index.md` | Declared envelopes |
| Bootstrap | `tools/bootstrap/tied-install.sh`, `tools/bootstrap/README.md` | WF-002 |
| MCP server | `mcp-server/README.md`, `mcp-server/dist/index.js` | WF-001, WF-003 |
| Skills | `.cursor/skills/tied-yaml/SKILL.md`, bundled prompt-type skills | WF-004 |
| Gates | `tied gate check`, `tied_checklist_gate_validate` docs in client-development-index | WF-003 |
| Tests (structural) | `mcp-server/src/**/*.test.ts` | Proof boundary for tool contracts |

## Out of scope for this baseline

- Individual client application repositories (no `project-manifest` collected).
- Live IDE telemetry.

## Re-baseline trigger

Re-lock when external workflow register rows change disposition to `approved` and promotion targets a specific `[REQ-*]` implementation slice.
