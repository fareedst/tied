# Build-plan verification — REQ-TIED_PROJECT_SIZE_LAYERS

**date:** 2026-11-09

## Commands

```bash
cd mcp-server && npm test -- --test-name-pattern 'project-size'
node --test tools/bootstrap/lib/project-size-record-wf-trial-contract.test.mjs
```

**Result:** all pass (manifest `close-out-project-size-layers-2026-11-09`)

```bash
scripts/lint_yaml.sh tied-project/config/project-size-metrics.registry.yaml
```

**Result:** pass

## Touchpoints

| Area | Path |
| --- | --- |
| MCP module | `mcp-server/src/project-size/` |
| Tool registration | `tied_project_size_snapshot` in `mcp-server/src/tools/index.ts` |
| Policy | `tied-project/config/project-size-metrics.registry.yaml` |
| Catalog | `docs/demos/catalog-tied-size-and-trial-statistics.md` |
| Facilitator | `tools/bundled-record-wf-trial-skill/reference.md` § Project size layers |
