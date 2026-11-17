# URL / README fetch receipt — harness-profiler

**Captured:** 2026-11-17 (plan refine pass)  
**Method:** `WebFetch` on article + GitHub README (read-only; no vendor scripts executed in stdd)

## Article (Furmanov-reported)

- **URL:** https://afurmanov.com/harness-profiler  
- **Title:** What Did My Software Factory Just Do?  
- **Published:** 2026-11-15 (page metadata)  
- **Author:** A. Furmanov  

**Themes captured for Wave 1 TL;DR:**

- Claude Code plugin **harness-profiler**; hooks on every tool call → `.harness-profile/.jsonl`
- UML sequence view: bars = contexts; diamonds = inline skills; forks = new context
- Real case: second **validation** run repeated Rails review/tests though only Markdown changed; both runs **PASS**
- **check-trace** skill pattern: assert factory invariants on `tree --verbose` output

## Repository (target-repo-observed)

- **URL:** https://github.com/afurmanov/harness-profiler  
- **Install (Claude Code):** `/plugin marketplace add afurmanov/harness-profiler`; `/plugin install harness-profiler@harness-profiler`
- **Web/repo hook:** `npx -y github:afurmanov/harness-profiler init claude` → `.claude/harness-profiler/`, settings.json entries, `show-profile` skill
- **JSONL field sample:** `v`, `harness`, `session`, `tool`, `name`, `duration_ms`, `context_tokens`, etc.
- **Render:** `npx -y github:afurmanov/harness-profiler tree --format html`; `/harness-profiler:show-profile`
- **Constraints:** Codex not supported yet; hook silent without Node; traces excluded via `.git/info/exclude`
- **License:** MIT

**Proof boundary:** Receipt is evidence for comparison prose only—not TIED methodology effectiveness.