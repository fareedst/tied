# Test strategy — REQ-TIED_CORPUS_COMPREHENSION (slice 1)

**Depth:** minimal · **Gate policy:** advisory

## Module boundaries

| Module | Path | Validates independently |
| --- | --- | --- |
| Corpus index builder | `mcp-server/src/corpus-graph/index-builder.ts` | Unit (fixture tree) |
| Map / trace / freshness | `mcp-server/src/corpus-graph/*.ts` | Unit |
| MCP handlers | `mcp-server/src/corpus-graph/mcp-handlers.ts` | Composition + handler tests |
| Tool registration | `mcp-server/src/tools/index.ts` | Existing composition pattern |

## RED-first sequence

1. **Index builder** — fixture with `requirements.yaml` (3 tokens), detail files, one dangling `detail_file` path → diagnostic `MISSING_DETAIL`.
2. **Cross-ref edges** — detail YAML cites `[REQ-*]` / list fields → edge kind `references`.
3. **Sidecar scan** — pseudocode `.md` mentions `[IMPL-*]` → edge to token node (static regex).
4. **No mutation** — refresh must not call `yaml_index_*` / write under `tied-project/` (regression guard).
5. **Freshness** — touch fixture file after index build → `STALE_INDEX` advisory diagnostic.
6. **MCP composition** — tools registered and return receipt schema `corpus-graph-receipt.v1`.

## Commands

```bash
npm run lint:ts --prefix mcp-server
npm test --prefix mcp-server -- corpus-graph
```

## Proof boundaries (tests assert)

- Static file read only; no runtime TIED semantics
- Regenerable cache under `tied-bundle/reports/corpus-graph/`
- Read-only project YAML (no index/detail writes from MCP path)
