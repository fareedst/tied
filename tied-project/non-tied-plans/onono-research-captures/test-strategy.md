# Test strategy — ONONO Wave 2 comparison (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Preconditions (Wave 0)

- [x] Seven article/manifesto captures + index under `docs/comparisons/onono-*.md`
- [x] `git check-ignore -v docs/comparisons/onono-research-capture-index.md` → ignored

## Wave 2 analysis

- [ ] Metadata table: purpose, audience, source URL, **local capture sibling** link only, status/date, proof boundary
- [ ] All template required sections (executive summary through proof boundary; §3 = scope ownership, not sibling table)
- [ ] Source summary bullets grouped by theme; **ONONO-reported** labels on product claims
- [ ] Harness lessons with mapping tables (system learning, Mind Ontology, agency, uncertainty)
- [ ] Primary capability matrix (~12 rows) with disposition vocabulary
- [ ] Authority boundary mermaid
- [ ] Anti-patterns (≥5 rows); explicit non-adoptions; proof boundary (`not_measured` for effectiveness)
- [ ] **No** new REQ/ARCH/IMPL tokens in body; **no** links to other `docs/comparisons/*-vs-tied*` peers

## Local-only git

- [ ] `git check-ignore -v docs/comparisons/onono-progressive-ai-system-learning-vs-tied-agent-management.md` shows ignored (not allowlisted)
- [ ] `git status docs/comparisons/onono-*` does not list new vs-tied file as tracked

## Commands

```bash
git check-ignore -v docs/comparisons/onono-progressive-ai-system-learning-vs-tied-agent-management.md
test -f docs/comparisons/onono-progressive-ai-system-learning-vs-tied-agent-management.md && wc -l docs/comparisons/onono-progressive-ai-system-learning-vs-tied-agent-management.md
```
