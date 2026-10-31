# Git hygiene receipt — DOC-STDD-TIED-PROJECT-BROWNFIELD

- **request_token:** DOC-STDD-TIED-PROJECT-BROWNFIELD
- **context_mode:** plan_close_out
- **apply:** false
- **date:** 2026-10-31

## Scoped staging (close-out)

| Path | Action |
| --- | --- |
| `docs/stdd-workflows.md` | add |
| `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/**` | add (exclude regenerable 2.4MB source-graph index) |
| `tied-project/working/**/CITDP-*.yaml` | stage deletions (identical dedupe) |
| `tied-project/working/evaluation/envelope-gap-report.v1.yaml` | add |
| `CHANGELOG.md` | add |

## Excluded

- `project-identity.v1.yaml` (repo root, local dogfood)
- `mcp-server/test/fixtures/**`, `tied-bundle/reports/source-graph/**` (unrelated drift)
- `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,...}.yaml` (unrelated untracked test citdp)
- `evidence/source-graph-index.v1.json` (regenerable via `tied_source_graph_refresh`)
- `evidence/tied-validate-consistency-summary.json` (gitignore regenerable pattern)

## MCP preview

`tied_git_hygiene` ok; `committed_working_stage_candidates` empty (new DOC tree untracked until add).
