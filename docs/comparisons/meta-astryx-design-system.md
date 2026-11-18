# Meta Astryx — repository summary (read-only capture)

| Field | Value |
| --- | --- |
| **Source** | [meta/astryx](https://github.com/meta/astryx) (MIT) |
| **Homepage** | [astryx.atmeta.com](https://astryx.atmeta.com) (**target-repo-observed**) |
| **Status (upstream)** | Beta (**Meta-reported** in README themes) |
| **Purpose** | Read-only repository summary for Wave 2 comparison — **external content**; does not mint REQ/ARCH/IMPL tokens; **does not reproduce** upstream README or `AGENTS.md` body. |
| **Captured** | 2026-11-17 |
| **Analysis (sibling)** | [meta-astryx-design-system-vs-tied-agent-management.md](meta-astryx-design-system-vs-tied-agent-management.md) |

---

## TL;DR

- **Open design system** — 150+ accessible components, brand theming, dark mode, patterns and templates; built on React 19+ with StyleX used internally while consumers import pre-built CSS and use typed React components (**Meta-reported** / **target-repo-observed**).
- **npm packages** — `@astryxdesign/core`, `@astryxdesign/cli`, `@astryxdesign/build`, and `@astryxdesign/theme-*` themes; global or per-project CLI install modes (**target-repo-observed**).
- **Agent-ready** — API, docs, and CLI designed so people and coding assistants build the same way; `astryx init` installs **agent blocks**; computer-level skill path documented in CLI agent-docs (**target-repo-observed**).
- **Instruction surface** — Root `AGENTS.md` is the canonical, tool-agnostic guidance; nested `AGENTS.md` files hold path-specific rules; CLI output kept short because agents read every byte (**target-repo-observed**).
- **Knowledge governance** — Specs under `docs/specs/` with `authority: draft|current|archived`; only **`current`** records govern implementation; `pnpm specs:for` maps paths to records; PR rubric for record writing (**target-repo-observed**).
- **Measurement** — `internal/vibe-tests` probe whether instructions help LLMs emit correct component usage; “earned by measurement” stated as a product principle (**Meta-reported** / **target-repo-observed**).
- **Scale (marketing)** — Claimed largest design system inside Meta powering 13,000+ apps (**Meta-reported** — **not_measured** in stdd).

---

## What it is

Astryx is Meta’s **open-source design system** for product UI: foundations (typography, color, layout, accessibility), a large component library, and documented interaction **patterns** (tables, detail pages, wizards, navigation). Consumers are application teams (and agents helping them), not methodology owners.

### Architecture (summary)

From README structure themes (**target-repo-observed**):

| Area | Role |
| --- | --- |
| `packages/core` | Components, theme system, utilities |
| `packages/cli` | Docs, scaffolding, templates, themes, codemods |
| `packages/build` | StyleX build plugins for source builds |
| `packages/themes` | Named theme packages (neutral, butter, chocolate, etc.) |
| `apps/` | Docs site, Storybook, example apps |
| `internal/` | Test utilities, eslint plugin, **vibe-tests** |

**Composition model** — Open internals: compose at any level, swizzle to own source; theme via CSS custom properties without forking (**Meta-reported**).

### Agent consumption model

| Mechanism | Role |
| --- | --- |
| `astryx docs` / component `.doc.mjs` tree | Machine- and human-readable reference (**target-repo-observed**) |
| `astryx init` | Writes managed agent instruction blocks; `init --remove-agents` for cleanup (**target-repo-observed**) |
| Global skill install | Symlinks / skill folder for cross-project Astryx literacy (**target-repo-observed** in agent-docs) |
| `package.json` `astryx` script | Stable invocation path for assistants (**Meta-reported** ergonomics) |

---

## Observation boundary (stdd)

| Fact class | Label |
| --- | --- |
| Structure and themes read via GitHub API **2026-11-17** | **target-repo-observed** |
| Internal scale, star counts, production outcomes | **Meta-reported** |
| stdd execution | **Did not** run `pnpm install`, vibe-tests, or publish packages during capture |

---

## Notes for stdd readers

- Wave 3 compose guide: [meta-astryx-ds-agent-plane-compose.md](../../tied-bundle/docs/meta-astryx-ds-agent-plane-compose.md) ([REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3](../../tied-project/requirements/REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3.yaml)).
- Wave 2 **agent-management** mapping: [meta-astryx-design-system-vs-tied-agent-management.md](meta-astryx-design-system-vs-tied-agent-management.md).
- Distinct from [Google Agent Skills × TIED](google-agent-skills-vs-tied-agent-management.md) (catalog CI) and [Persante SDD × TIED](persante-sdd-skills-vs-tied-agent-management.md) (wiki feature specs).
- Process template: [external-service-three-wave-comparison-template.md](../../tied-bundle/docs/external-service-three-wave-comparison-template.md).