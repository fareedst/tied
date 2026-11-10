# Test strategy — project-size-batch-discover-compare

Facilitator/bootstrap checks in the **TIED store** repo. No RED tests in disposable clients.

## Preconditions

- `npm run build --prefix mcp-server` succeeds; `mcp-server/dist/project-size/snapshot-builder.js` exists.
- [`project-size-metrics.registry.yaml`](../../config/project-size-metrics.registry.yaml) passes `scripts/lint_yaml.sh`.

## Required (@non-tied-build)

| ID | Check | Pass criteria |
| --- | --- | --- |
| T1 | Discover unit tests | `project-size-discover-clients.test.mjs`: eligible vs ineligible tmp dirs; default pattern; limit; newest-first epoch sort |
| T2 | Render contract | `project-size-comparison-render.test.mjs`: renders [store dogfood JSON](../../working/REQ-TIED_PROJECT_SIZE_LAYERS/evidence/project-size-snapshot-store-dogfood.v1.json); footer contains `proof_boundary`; no forbidden phrases |
| T3 | CLI integration (gated) | `project-size-batch-compare.test.mjs`: if dist exists, snapshot mcp-server project-size fixture root; writes manifest + at least one receipt |
| T4 | Batch command | `node --test tools/bootstrap/lib/project-size-*.test.mjs` — all pass |
| T5 | First operator run | CLI with `--pattern wf-agentstream` `--limit 25` writes `evidence/comparison-table.md` and `evidence/manifest.v1.json` |

## Optional (sponsor)

| ID | Check | Notes |
| --- | --- | --- |
| O1 | `--include-store` | Adds methodology store row for contrast with disposables |
| O2 | `--manifest` | One-off extra roots not under discover parent |
| O3 | `@record-wf-trial` | Separate skill; size appendix per client |

## Security / safety

- Read-only on subject `repo_root` trees (snapshot builder does not mutate YAML).
- No credentials, no git push, no MCP writes to project REQ/ARCH/IMPL.
- Output stays under `tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/`.
