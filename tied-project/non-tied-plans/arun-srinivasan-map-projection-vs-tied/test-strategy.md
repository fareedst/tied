# Test strategy — Arun map projection × TIED Wave 2 (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Preconditions

- [ ] Wave 1 capture exists: `docs/comparisons/arun-srinivasan-every-map-has-a-projection.md`
- [ ] Plan slug `arun-srinivasan-map-projection-vs-tied` matches handoff

## Wave 2 analysis content

- [ ] Metadata table per template (Purpose, capture sibling link, Distinct from, TIED anchors)
- [ ] All **14 sections** present in template order
- [ ] Executive summary includes center-of-gravity table (Srinivasan vs TIED)
- [ ] Source summary bullets cite **Srinivasan-reported** only (from Wave 1 capture)
- [ ] §3 sibling scope table includes Heimsbakk, Netflix, NDTP, Open Ontologies, NVIDIA, Anthropic FV
- [ ] §4 minimum **8** thematic mapping subsections with tables
- [ ] §6 capability matrix 12–15 rows with disposition vocabulary only
- [ ] §7 mermaid: valid node IDs, three-layer authority boundary
- [ ] §11 Wave 3 phases default **Defer**
- [ ] §13 proof boundary cites evaluation framework + no comparable-arms claim
- [ ] **No** REQ/ARCH/IMPL tokens minted in body

## Consistency gates

- [ ] Does not claim TIED is OWL/BFO/UFO or ships SHACL on token graphs
- [ ] Does not equate `tied_validate_consistency` with gUFO shapes
- [ ] Cross-links Wave 1 capture; Wave 1 **Analysis (sibling)** updated to Wave 2 path
- [ ] Heimsbakk overlap explicit (meaning ownership) without duplicating that analysis

## Local-only git

- [ ] `git check-ignore -v docs/comparisons/arun-srinivasan-every-map-has-a-projection-vs-tied-agent-management.md` shows ignored
- [ ] Plan folder committable on `@non-tied-close`

## Commands

```bash
git check-ignore -v docs/comparisons/arun-srinivasan-every-map-has-a-projection-vs-tied-agent-management.md
test -f docs/comparisons/arun-srinivasan-every-map-has-a-projection-vs-tied-agent-management.md && wc -l docs/comparisons/arun-srinivasan-every-map-has-a-projection-vs-tied-agent-management.md
```
