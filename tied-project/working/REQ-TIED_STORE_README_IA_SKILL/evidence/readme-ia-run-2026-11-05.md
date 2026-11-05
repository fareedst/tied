# README IA run — 2026-11-05

Target: `README.md` (store root). Renderer: GitHub GFM. Preservation: strict.

## Information-architecture map

| Original top-level topic | Resulting chapter / entry |
| --- | --- |
| Opening identity + hub links | Unchanged (document title + intro) |
| Quick start subsections | **Quick start (macOS)** — added context intro; subsections unchanged |
| Explore TIED + certifiability row | **Explore TIED** — context intro + `---` boundary |
| Store setup, client bootstrap, primary repo | **Install and use** — routing table; three former `##` sections demoted to `###` under this chapter |
| Client numbered steps 1–3 | Under **Getting started…** as `####` |
| Primary repo subsections | Under **Primary implementation repository** as `####` |
| Agentstream / feature-spec batch | **Spec-driven execution (optional)** — context intro |
| Script bullet list | **Tooling and scripts** — context intro |
| Hub / AGENTS / YAML pointers | **Where to read next** — cross-link to intent table |
| Tree diagram | **Repository layout** — context intro |
| Language + license | Unchanged |

## Change summary

- Added **How to use this README** intent navigation table near the top.
- Inserted short **Context:** orientations at major chapter boundaries (Quick start, Explore, Install, Spec-driven, Tooling, Layout).
- Used horizontal rules (`---`) between Quick start → Explore → Install → Spec-driven → Tooling.
- Nested install reference material under **Install and use** (heading level only; anchor slugs preserved where titles unchanged).
- No content removed; no commands, tokens, or paths altered.

## Preservation report

- All substantive paragraphs, tables, code blocks, mermaid diagrams, and links retained.
- Modality and requirements language unchanged.
- Explicit HTML anchors (`compact-feature-rhythm`, `performing-work-in-certifiable-workflows`) untouched.
- Heading text unchanged except new **How to use this README** section.

## Verification report

| Check | Result |
| --- | --- |
| Markdown structure | One `#` title; logical `##` / `###` / `####` nesting under Install |
| Internal `#` links in edited file | Spot-checked: `#install-and-use`, `#tied-source-repository-setup`, `#getting-started-with-a-new-client-project`, `#primary-implementation-repository`, `#2-optionally-enable-the-mcp-server`, `#compact-feature-rhythm`, `#methodology-development-layout` — titles/slugs unchanged |
| Automated link checker | Not run in CI this session |
| Generator regen | N/A — hand-authored README |
