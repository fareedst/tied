# Session handoff — DOC-STDD-TIED-PROJECT-BROWNFIELD

**Recorded:** 2026-10-31  
**Baseline:** `cf321c96`  
**Workflow:** build-plan (non-tied index boundary)

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

## Publish gaps (methodology backlog)

- TIED YAML corpus not in source-graph / scoped-analysis
- Meta-hub EDPC template not productized
- Checklist gate tools vs `config.yaml` `identity` namespace mismatch
- Full-corpus envelope coverage (250 working folders)

## Refresh triggers (workflow G)

- MCP tool surface or `yaml-loader` / identity routing changes
- Working-artifact placement policy changes
- Major waves on intent control plane or install layout

## Do not commit

- Repo-root `project-identity.v1.yaml` (local Path 3 dogfood)

## Close-out status

**Machine close-out:** deferred (DOC token, minimal depth, no CITDP persist)  
**Verification:** scoped MCP tests — see [build-plan-handoff.md](./build-plan-handoff.md)  
**Traceable commit:** sponsor-requested; stage DOC tree, `docs/stdd-workflows.md`, dedupe deletions, evaluation YAML — exclude root identity marker

## Optional next

- Re-run envelope batch with corrected `tied_base_path` for REQ-LEAP_PROPOSAL_QUEUE / layered install rows
- `@close-out` if promoting to traceable commit
- `add-feature` for TIED-corpus comprehension tooling from publish gaps
