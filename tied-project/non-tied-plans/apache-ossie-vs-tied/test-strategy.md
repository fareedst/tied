# Test strategy — Apache Ossie × TIED Waves 1–2 (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Preconditions

- [ ] Plan slug `apache-ossie-vs-tied` matches handoff
- [ ] Build uses **`static_only`** unless validator run is explicitly logged

## Wave 1 capture

- [ ] Metadata table (Source, incubating, Captured date, Purpose, sibling analysis link after Wave 2)
- [ ] TL;DR (3–5 bullets); **Notes for stdd readers** with proof boundary
- [ ] Thematic sections per PLAN (repo map, semantic model, ontology, dialect, tooling, roadmap, OSI rename)
- [ ] Claims labeled **Ossie-reported** / **spec-observed** / **roadmap-reported**
- [ ] **No** `[REQ-*]` minted in body

## Wave 2 analysis content

- [ ] Metadata table per template (Purpose, capture sibling link, Distinct from, TIED anchors)
- [ ] All **14 sections** present in template order
- [ ] Executive summary: center-of-gravity **and** Q1–Q6 evaluation-framework table
- [ ] Source summary from Wave 1 only (no unsourced GitHub deep dives)
- [ ] §3 sibling table includes NVIDIA, Netflix, Open Ontologies, NDTP, Arun (if file exists), Heimsbakk cross-link
- [ ] §4 minimum **9** thematic mapping subsections with tables
- [ ] §6 capability matrix 12–15 rows; disposition vocabulary only
- [ ] §7 mermaid: valid node IDs, three-layer authority boundary
- [ ] §11 Wave 3 phases default **Defer**
- [ ] §13 proof boundary cites evaluation framework Principles 1, 5, 7; no comparable-arms claim
- [ ] **No** REQ/ARCH/IMPL tokens minted in body

## Consistency gates

- [ ] Does not claim TIED ships Ossie or KPI semantic catalogs
- [ ] Does not equate `validate.py` / grader with `tied_verify` or Q1 arms
- [ ] Distinguishes **structural** vs **conceptual** interoperability (Ossie roadmap) from TIED token graph
- [ ] Wave 1 **Analysis (sibling)** links Wave 2; NVIDIA **Distinct from** reciprocal line present
- [ ] Business SoT vs delivery SoT discussed under Q3 compose only

## Git publish (allowlisted)

- [ ] `git check-ignore -v docs/comparisons/apache-ossie.md` shows negated rule (tracked)
- [ ] `git check-ignore -v docs/comparisons/apache-ossie-vs-tied-agent-management.md` shows negated rule (tracked)
- [ ] Plan folder committable on `@non-tied-close` / traceable-commit

## Commands

```bash
git check-ignore -v docs/comparisons/apache-ossie.md
git check-ignore -v docs/comparisons/apache-ossie-vs-tied-agent-management.md
test -f docs/comparisons/apache-ossie.md && wc -l docs/comparisons/apache-ossie.md
test -f docs/comparisons/apache-ossie-vs-tied-agent-management.md && wc -l docs/comparisons/apache-ossie-vs-tied-agent-management.md
rg -n '^[^|]*\|[^|]*REQ-[A-Z]' docs/comparisons/apache-ossie-vs-tied-agent-management.md || true
```
