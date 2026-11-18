# Target repo receipt — Meta Astryx

| Field | Value |
| --- | --- |
| **URL** | https://github.com/meta/astryx |
| **Fetched** | 2026-11-17 (read-only GitHub API / search; no vendored tree in stdd) |
| **Storage** | **No README or AGENTS.md body** committed; themes paraphrased in Wave 1 and Wave 2 §2 |
| **License** | MIT (**target-repo-observed**) |
| **Homepage** | https://astryx.atmeta.com (**target-repo-observed**) |

## Theme bullets (paraphrase only)

- Open design system in beta; React 19+; StyleX internal; consumers import CSS and typed components (**Meta-reported**).
- npm packages: core, cli, build, theme-*; optional global CLI install (**target-repo-observed**).
- **Agent-ready** positioning: shared API, docs, CLI for people and assistants; `astryx init` writes agent blocks; computer-level skill under `~/.agents/skills/astryx` (**target-repo-observed** in agent-docs sources).
- Root `AGENTS.md` as tool-agnostic instruction surface; nested `AGENTS.md` for path-specific rules (**target-repo-observed**).
- Knowledge records with `authority: draft|current|archived`; `pnpm specs:for` path lookup; spec-writing rubric in PRs (**target-repo-observed**).
- `internal/vibe-tests` — offline checks that AGENTS.md helps LLMs generate correct component code (**target-repo-observed**).
- Principles: guidance over enforcement, strong conventions, one system for humans and AI, earned by measurement (**Meta-reported**).
- Scale claim: largest internal DS powering 13k+ apps (**Meta-reported** — not verified in stdd).