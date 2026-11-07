# Test strategy — Netflix ontology comparison (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Wave 1 capture

- [ ] Metadata table includes Source URL, authors, dates, sibling analysis link
- [ ] TL;DR present; Netflix metrics labeled **Netflix-reported** in Notes
- [ ] Article body sections present; no navigation junk
- [ ] **Notes for stdd readers** with proof boundary

## Wave 2 analysis

- [ ] All template § required sections (executive summary through related documents)
- [ ] Harness lessons subsections with mapping tables
- [ ] Primary capability matrix (~12 rows)
- [ ] Authority boundary mermaid
- [ ] Anti-patterns (≥5 rows)
- [ ] Explicit non-adoptions; proof boundary
- [ ] No new REQ/ARCH/IMPL minted in body

## Git and links

- [ ] `.gitignore` allowlist for both markdown files
- [ ] `git check-ignore -v` shows negated rules for both paths
- [ ] Relative links from `docs/comparisons/` resolve to siblings and `tied-bundle/`

## Commands (optional)

```bash
git check-ignore -v docs/comparisons/netflix-ontology-driven-observability.md
git check-ignore -v docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md
```
