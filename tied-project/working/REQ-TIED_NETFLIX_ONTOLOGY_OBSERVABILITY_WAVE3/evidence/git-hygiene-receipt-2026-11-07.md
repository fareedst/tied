# Git hygiene receipt — REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3

**Date:** 2026-11-07  
**Tool:** `tied_git_hygiene` · `context_mode: plan_close_out` · `apply: false`

## Wave 3 scoped untracked (stage for traceable commit)

- `docs/comparisons/netflix-ontology-driven-observability.md`
- `docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md`
- `tied-project/architecture-decisions/ARCH-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml`
- `tied-project/citdp/CITDP-REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3-pseudocode.md`
- `tied-project/requirements/REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml`
- `tied-project/working/REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3/` (PLAN, tracker, test-strategy, committed close-out evidence)
- `tied-project/non-tied-plans/netflix-ontology-observability-vs-tied/` (optional slice-0; sponsor may exclude)
- `tools/bootstrap/lib/methodology-composition-matrix-netflix-row.test.mjs`

## Wave 3 scoped dirty (include with wave)

- `docs/comparisons/methodology-composition-matrix.md`
- `docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md`
- `docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md`
- `docs/comparisons/tied-vs-well-known-methodologies.md`
- `tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md`
- `tied-bundle/docs/harness-trace-observation-loop.md`
- `tied-bundle/docs/external-service-three-wave-comparison-template.md`
- `tied-bundle/docs/client-development-index.md`
- `tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs`
- `tools/bootstrap/lib/methodology-composition-matrix-langchain-row.test.mjs`
- `tools/bootstrap/lib/methodology-composition-matrix-anthropic-fv-row.test.mjs`
- `tied-project/requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml`
- Index YAMLs: `requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml`
- `.gitignore` (netflix comparison allowlist if not already present)

## Gitignore hygiene

N/A for ephemeral REQ-scoped noise beyond existing comparison allowlist patterns (`tied_git_hygiene` preview; no `apply: true`).

## Regenerable (do not commit)

- `tied-bundle/working/REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3/gates/*.json`
- `request-evidence-envelope.v1.json` / `verification-evidence-manifest.v1.json` per repo `.gitignore` managed exceptions (stage only if sponsor opts in)
