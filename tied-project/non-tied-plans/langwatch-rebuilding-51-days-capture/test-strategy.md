# Test strategy — LangWatch 51-day rebuild Wave 1 capture (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Tooling preconditions

- [ ] `agent-browser skills get core` (dedicated `--scope worktree --prefix langwatch` session on every command)
- [ ] Blog opened; cookies handled once; **Text only** mode used for capture pass
- [ ] All 15 TOC sections visited (click or scroll); Acts I–III covered

## Wave 1 capture content

- [ ] Metadata table: canonical URL, captured date, local-only / no REQ mint disclaimer
- [ ] TL;DR with **LangWatch-reported** on all substantive metrics
- [ ] Sections cover: parallel branch, module layout, move/merge risk, trace review (11 Sep), lint/enforcer/skills, haven/simulators/test drive, lessons + production misses
- [ ] In-article link summaries present (rule definition, lint-rule skill, lane agent, Jev, Claude usage) with URLs — no full external site paste
- [ ] **No** TIED capability matrix, **no** REQ/ARCH/IMPL tokens in body (metadata disclaimer OK)
- [ ] Notes link [`docs/tied-methodology-evaluation-framework.md`](../../../docs/tied-methodology-evaluation-framework.md) with Q1/Q5 proof boundary
- [ ] Related comparison links (LangChain, Cursor, Traefik) in Notes only

## Consistency gates

- [ ] Distinguish **list-price token costs** from subscription spend (article disclaimer preserved)
- [ ] Production misses (agent UI field, NLP) stated as **LangWatch-reported** post-ship catches—not TIED confirmed findings
- [ ] Do not equate module lint graph with TIED token graph or MCP consistency
- [ ] Merge “clean but wrong” lesson preserved without inventing git metrics

## Local-only git

- [ ] `git check-ignore -v docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md` shows ignored
- [ ] Plan folder may commit on `@non-tied-close`; capture stays gitignored unless sponsor opts in

## Commands

```bash
git check-ignore -v docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md
test -f docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md && wc -l docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md
rg -n 'REQ-[A-Z]' docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md || true
```
