# Plan: Netflix ontology-driven observability × TIED (Wave 1–2)

**Slug:** `netflix-ontology-observability-vs-tied`  
**Track:** `@non-tied-plan` → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [Netflix Technology Blog](https://netflixtechblog.com/ontology-driven-observability-building-an-end-to-end-knowledge-graph-at-netflix-scale-421392cf5adf); local extract [`docs/comparisons/netflix-ontology-driven-observability-medium-extracted.txt`](../../../docs/comparisons/netflix-ontology-driven-observability-medium-extracted.txt)

## Scope

Doc-only **external-service comparison** Waves 1–2 per [`tied-bundle/docs/external-service-three-wave-comparison-template.md`](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md). No project REQ/ARCH/IMPL YAML, no Wave 3 REQ.

## Deliverables

| Artifact | Path |
| --- | --- |
| Wave 1 capture | `docs/comparisons/netflix-ontology-driven-observability.md` |
| Wave 2 analysis | `docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md` |
| Git allowlist | `.gitignore` `!docs/comparisons/netflix-ontology-*.md` |
| Sibling back-links | NDTP, Open Ontologies, Heimsbakk × TIED analyses (minimal) |

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).

## Forbidden

Minting REQ/ARCH/IMPL from comparison prose; `tied_verify` with update; automatic git push.
