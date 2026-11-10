# Test strategy — REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS

**plan_phase:** pre-implementation — RED tests authored in `@build-plan` only.

## Preconditions

- Parent [REQ-TIED_PROJECT_SIZE_LAYERS](../REQ-TIED_PROJECT_SIZE_LAYERS/PLAN.md) MCP module green.
- `mcp-server` built before composition tests.

## Required (`@build-plan`)

| ID | Test | Pass criteria |
| --- | --- | --- |
| T1 | Controlled fixture: two sidecar bodies | Same `applied_lines`, different `applied_utf8_bytes` (long trimmed line vs short lines) |
| T2 | Template overlap bytes | `template_overlap_utf8_bytes` > 0 when template lines dominate; `applied_utf8_bytes` reduced accordingly |
| T3 | Invariants | `applied_utf8_bytes <= gross_utf8_bytes`; overlap bytes ≤ gross bytes |
| T4 | MCP composition | [project-size-mcp.composition.test.ts](../../../mcp-server/src/project-size/project-size-mcp.composition.test.ts) asserts new keys on fixture |
| T5 | Error receipt | Missing `tied-project` branch returns zero UTF-8 fields in operational_intent |
| T6 | Registry | `scripts/lint_yaml.sh tied-project/config/project-size-metrics.registry.yaml` |
| T7 | Facilitator render | Glossary mentions `applied_utf8`; optional assert dogfood receipt column if refreshed |

## Command battery (close-out evidence)

```bash
npm run build --prefix mcp-server
npm test --prefix mcp-server -- --test-name-pattern project-size
node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs
scripts/lint_yaml.sh tied-project/config/project-size-metrics.registry.yaml
```

## Security / safety

- Read-only snapshot; no subject YAML mutation.
