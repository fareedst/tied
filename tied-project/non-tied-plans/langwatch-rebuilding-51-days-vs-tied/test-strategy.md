# Test strategy — LangWatch × TIED Wave 2 (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Preconditions

- [ ] Wave 1 capture exists: `docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md`
- [ ] Plan slug `langwatch-rebuilding-51-days-vs-tied` matches handoff

## Wave 2 analysis content

- [ ] Metadata table per template (Purpose, capture sibling link, Distinct from, TIED anchors)
- [ ] All **14 sections** present in template order
- [ ] Executive summary includes center-of-gravity comparison **and** Q1–Q6 evaluation-framework table
- [ ] Source summary bullets cite **LangWatch-reported** only (from Wave 1 capture)
- [ ] §3 sibling scope table includes LangChain, Cursor, Traefik, Claude code review
- [ ] §4 minimum **9** thematic mapping subsections with tables
- [ ] §6 capability matrix 12–15 rows with disposition vocabulary only
- [ ] §7 mermaid: valid node IDs, three-layer authority boundary
- [ ] §11 Wave 3 phases default **Defer**
- [ ] §13 proof boundary cites evaluation framework + separate Q1 arms
- [ ] **No** REQ/ARCH/IMPL tokens minted in body

## Consistency gates

- [ ] Does not claim TIED ships module enforcer or 76-route lint pack
- [ ] Does not equate agent test-drive pass rate with `tied_verify` or evidence-chain integrated profile
- [ ] Cross-links Wave 1 capture; Wave 1 **Analysis (sibling)** updated to Wave 2 path
- [ ] LangChain overlap explicit (benchmark trace loop vs refactor structure)

## Local-only git

- [ ] `git check-ignore -v docs/comparisons/langwatch-rebuilding-51-days-vs-tied-agent-management.md` shows ignored
- [ ] Plan folder committable on `@non-tied-close`

## Commands

```bash
git check-ignore -v docs/comparisons/langwatch-rebuilding-51-days-vs-tied-agent-management.md
test -f docs/comparisons/langwatch-rebuilding-51-days-vs-tied-agent-management.md && wc -l docs/comparisons/langwatch-rebuilding-51-days-vs-tied-agent-management.md
rg -n 'REQ-[A-Z]' docs/comparisons/langwatch-rebuilding-51-days-vs-tied-agent-management.md || true
```
