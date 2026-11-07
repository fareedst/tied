# Test strategy — Arun Srinivasan map projection Wave 1 capture (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Tooling preconditions

- [ ] `agent-browser skills get core` run (or documented fallback if CLI unavailable)
- [ ] Substack post body captured via browser (scroll if truncated)
- [ ] Metadata **Published** date matches article (2026-11-03)

## Wave 1 capture content

- [ ] Metadata table: canonical URL, captured date, local-only / no REQ mint disclaimer
- [ ] **Why no article body** section present (summary-only)
- [ ] TL;DR with **Srinivasan-reported** on all substantive claims
- [ ] Thematic sections cover Ever Given Q1–Q3, four category mistakes, three projections, contract test, edge→node, PROV/time, legend checklist, closing
- [ ] UFO-L comprehension figures (72.6% → 83.2%) labeled **Srinivasan-reported**
- [ ] **No** TIED capability matrix, **no** REQ/ARCH/IMPL tokens in body
- [ ] Notes link [`docs/tied-methodology-evaluation-framework.md`](../../../docs/tied-methodology-evaluation-framework.md) with correct proof boundary
- [ ] Related comparison links only (Heimsbakk, Open Ontologies, Netflix, NDTP)

## Consistency gates

- [ ] Figay “no single upper ontology truth” and monoculture warning reflected accurately
- [ ] Layer legend lists BFO/IOF, UFO/UFO-L, PROV-O as in article (not collapsed into one ontology)
- [ ] General Average / Incoterms / bill-of-lading relator chain summarized without invented legal conclusions
- [ ] No pasted secrets or paywalled full text

## Local-only git

- [ ] `git check-ignore -v docs/comparisons/arun-srinivasan-every-map-has-a-projection.md` shows ignored (not allowlisted)
- [ ] Plan folder may commit on `@non-tied-close`; capture stays gitignored unless sponsor opts in

## Commands

```bash
git check-ignore -v docs/comparisons/arun-srinivasan-every-map-has-a-projection.md
test -f docs/comparisons/arun-srinivasan-every-map-has-a-projection.md && wc -l docs/comparisons/arun-srinivasan-every-map-has-a-projection.md
```
