# Test strategy — REQ-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE

**depth_tier:** minimal · **gate_policy:** advisory

| ID | Assertion |
|----|-----------|
| L1 | `store-readme-structure.test.ts` passes with new `REQUIRED_SUBSTRINGS`: `manual-mcp-acceptance`, `Customize`, `MCPs`, `tied-yaml-optin`, `2 new MCP servers found`, `Enable selected` |
| L2 | README still satisfies three-band H2 order and preserved headings (existing structure test) |
| L3 | Quick start step 4 links to `#manual-mcp-acceptance` |
| L4 | `agent mcp enable` remains documented under advanced/optional (not removed) |
| L5 | Manual: operator completes Cursor + Claude flows; note in `evidence/cursor-claude-mcp-acceptance.md` (screenshot optional) |

**Command:**

```bash
cd mcp-server && node --import tsx --test src/store-readme-structure.test.ts
```

**RED timing:** L1 substring list is the failing spec at build start until README is updated (`@build-plan`).
