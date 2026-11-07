# Session handoff — netflix-ontology-observability-vs-tied

**handoff_kind:** session  
**Date:** 2026-11-06  
**request_token:** n/a (non-tied)  
**prompt_type:** non-tied-build

## Plan spine

Linked [PLAN.md](../PLAN.md) · [test-strategy.md](../test-strategy.md)

## Authoritative refs

| Role | Path |
| --- | --- |
| Source (external) | https://netflixtechblog.com/ontology-driven-observability-building-an-end-to-end-knowledge-graph-at-netflix-scale-421392cf5adf |
| Local extract (gitignored) | `docs/comparisons/netflix-ontology-driven-observability-medium-extracted.txt` |
| Wave 1 capture | `docs/comparisons/netflix-ontology-driven-observability.md` |
| Wave 2 analysis | `docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md` |
| Three-wave template | `tied-bundle/docs/external-service-three-wave-comparison-template.md` |

## Plan execution steps

**Last updated:** 2026-11-06 · **prompt_type:** non-tied-build · **PLAN:** ../PLAN.md

### Required

- [x] `wave1-capture` — `docs/comparisons/netflix-ontology-driven-observability.md` (metadata, TL;DR, article body, notes)
- [x] `wave2-analysis` — `docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md` (full template sections)
- [x] `git-allowlist` — `.gitignore` lines 47–48 for both Netflix comparison paths
- [x] `sibling-backlinks-partial` — Distinct from on Open Ontologies, NDTP, Heimsbakk × TIED analyses

### Optional

- [x] `non-tied-close` — included in `b7414d73` with REQ-TIED_NETFLIX Wave 3
- [ ] `sibling-backlinks-complete` — LangChain, Anthropic FV, `tied-vs-well-known-methodologies.md` reciprocal links (Phase 1 defer in Wave 2 doc)
- [ ] `bundle-crosslink` — cite Netflix in `tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md` (Wave 3 defer)
- [ ] `methodology-matrix-row` — sponsor-only costly choice per `methodology-composition-matrix.md`

### Recommendations

- Read Wave 2 **first** for TIED mapping; Wave 1 for verbatim Netflix narrative.
- Pair-read **Heimsbakk** (meaning) + **Netflix** (operational identity) + **Open Ontologies** (governance) when advising client KGM work.
- No REQ/ARCH/IMPL from comparison prose — Wave 3 only via `add-feature` / `build-plan`.

### Changelog (this slug)

- 2026-11-06 non-tied-build: Wave 1–2 docs; plan folder; `.gitignore`; three sibling Distinct from updates.

## Environment

**workspace_root:** `/Users/fareed/Documents/dev/chatgpt/stdd` (TIED store)  
**execution_site:** store — comparison outreach docs only  
**TIED YAML:** unchanged (no MCP writes this thread)

## Finished this session

- Netflix **Wave 1 + Wave 2** comparison pair under `docs/comparisons/`.
- Non-tied plan slug `netflix-ontology-observability-vs-tied` with `PLAN.md`, `test-strategy.md`, this handoff.
- Git: files are **trackable** (`git status` shows `??` on new docs); not committed.

## Completion signals

- Wave 2 exit checklist in [test-strategy.md](../test-strategy.md) — manual pass before close-out.
- No `tied_validate_consistency` (no project YAML changes).

## Do next

1. **`@non-tied-close`** — commit when ready:

   - `docs/comparisons/netflix-ontology-driven-observability.md`
   - `docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md`
   - `tied-project/non-tied-plans/netflix-ontology-observability-vs-tied/**`
   - `.gitignore`
   - Modified sibling analyses (3 files)

2. **Wave 3** — **Defer** unless sponsor wants methodology matrix row or harness-doc cross-links.

## Constraints

- Comparison docs are **reference only** — do not mint REQ/ARCH/IMPL from markdown.
- Companion `.txt` / `.source.html` stay local/gitignored; do not redistribute article HTML.
- Operational ontology (QuipuDB, AutoRCA) is **not** TIED core — compose-don’t-replace only.

## Repeatable verification

```bash
REPO="/Users/fareed/Documents/dev/chatgpt/stdd"
git -C "$REPO" status --short \
  docs/comparisons/netflix-ontology-driven-observability.md \
  docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md \
  tied-project/non-tied-plans/netflix-ontology-observability-vs-tied/ .gitignore

# Trackable (should list as ?? or M, not omitted)
test -f "$REPO/docs/comparisons/netflix-ontology-driven-observability.md"
test -f "$REPO/docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md"
grep -q 'netflix-ontology-driven-observability.md' "$REPO/.gitignore"
wc -l "$REPO/docs/comparisons/netflix-ontology-driven-observability"*.md
```
