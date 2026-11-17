# Test strategy — Open Specter × TIED Waves 1–2 (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build` / `@non-tied-close`.

## Preconditions

- [ ] Plan slug `open-specter-legal-workspace-vs-tied` matches handoff
- [ ] Build uses **`static_only`** — local tree read only

## Wave 1 capture

- [ ] Metadata table (Source, Captured date, Purpose, Analysis sibling link)
- [ ] TL;DR (5–8 bullets); **Notes for stdd readers**
- [ ] Dual-tree layout documented
- [ ] Claims labeled **OpenSpecter-reported** / **target-repo-observed**
- [ ] No `[REQ-*]` minted in body

## Wave 2 analysis

- [ ] Metadata table per template
- [ ] All **14 sections** in template order
- [ ] Executive summary: dual COG + Q1–Q6 table
- [ ] §4 minimum **10** mapping subsections with tables
- [ ] §6 matrix 12–15 rows
- [ ] §7 mermaid authority boundary
- [ ] §11 Wave 3 default **Defer**
- [ ] No REQ/ARCH/IMPL tokens in body

## Consistency gates

- [ ] Does not claim TIED ships legal matter SaaS or legal advice
- [ ] Does not equate tabular cell pass or legal citations with `tied_verify`
- [ ] Does not claim Open Specter citation quality proves TIED gates
- [ ] Wave 1 **Analysis (sibling)** links Wave 2

## Git publish (allowlisted)

```bash
git check-ignore -v docs/comparisons/open-specter-legal-workspace.md
git check-ignore -v docs/comparisons/open-specter-legal-workspace-vs-tied-agent-management.md
```

Expected: negated rule (tracked), not silent ignore-only.

## Commands (post-build)

```bash
wc -l docs/comparisons/open-specter-legal-workspace.md docs/comparisons/open-specter-legal-workspace-vs-tied-agent-management.md
rg -c 'OpenSpecter-reported|target-repo-observed|TIED-existing|Recommendation-only|Defer|not_measured' docs/comparisons/open-specter-legal-workspace*.md
```