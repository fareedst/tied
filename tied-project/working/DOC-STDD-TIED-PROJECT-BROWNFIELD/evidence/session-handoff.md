# Session handoff — DOC-STDD-TIED-PROJECT-BROWNFIELD

**Recorded:** 2026-10-31 (updated gap-planning handoff)  
**Baseline:** `cf321c96` · **Close-out:** `944f0666`  
**Workflow:** build-plan + close-out (non-tied index boundary)

## Done

| Deliverable | Location |
| --- | --- |
| EDPC charter, matrix, queues, SCM, ledger, publish manifest | `evidence/edpc/` |
| Corpus map + code↔token sample + matrix + dedupe log | `evidence/reports/` |
| Source graph index + getBasePath trace summary | `evidence/source-graph-*` |
| Validate consistency summary | `evidence/tied-validate-consistency-summary.json` |
| Sponsor workflow hub | [docs/stdd-workflows.md](../../../docs/stdd-workflows.md) |
| Envelope gap refresh (10-token sample) | [working/evaluation/envelope-gap-report.v1.yaml](../evaluation/envelope-gap-report.v1.yaml) |
| CITDP dedupe | **64** net identical drafts removed (**65** deleted, **1** restored for GF05 e2e); **35** divergent kept |

## Publish gaps → plans

**Handoff for `@refine-plan` / `@add-feature`:** [gap-planning-handoff.md](./gap-planning-handoff.md) (maps each [edpc-publish-manifest.v1.json](./edpc/edpc-publish-manifest.v1.json) `gaps[]` entry to plan token, prompt type, and sprint order).

Quick list: G6 gate/config → G1 publish minimum_fields → G5 full envelope corpus → G4 meta-hub EDPC template → G7 verify boundary docs → G3 YAML corpus graph; G2 OFSM N/A unless Workflow D chartered.

## Refresh triggers (workflow G)

- MCP tool surface or `yaml-loader` / identity routing changes
- Working-artifact placement policy changes
- Major waves on intent control plane or install layout

## Do not commit

- Repo-root `project-identity.v1.yaml` (local Path 3 dogfood)

## Close-out status

**Machine close-out:** N/A (minimal DOC)  
**Traceable commit:** **`944f0666`** — see [close-out-handoff.md](./close-out-handoff.md)

## Do next

1. Pick a gap track from [gap-planning-handoff.md](./gap-planning-handoff.md) and run the listed prompt type.
2. Optional: link [docs/stdd-workflows.md](../../../docs/stdd-workflows.md) from README brownfield section.
3. Regenerable local: `evidence/source-graph-index.v1.json` (not in commit) via `tied_source_graph_refresh`.
