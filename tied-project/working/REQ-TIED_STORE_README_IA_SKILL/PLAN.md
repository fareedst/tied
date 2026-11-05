# PLAN — REQ-TIED_STORE_README_IA_SKILL

## Intent

Install sponsor **readme-information-architecture** skill (v1.0) as a **store-only** bundled facilitator skill for improving TIED store README and docs presentation — **not** inherited methodology.

## Locked decisions

| Decision | Choice |
|----------|--------|
| Install surface | `STORE_FACILITATOR_SKILLS` (self-install on TIED store only) |
| Not in | `tied-bundle/`, `BUNDLED_STANDALONE_CLIENT_SKILLS` |
| Bundle path | `tools/bundled-readme-information-architecture-skill/` |
| Invoke | `/readme-information-architecture`, `@readme-information-architecture` |
| Traceability | `[REQ-TIED_STORE_README_IA_SKILL]` + ARCH/IMPL; relates to `[REQ-TIED_STORE_README_EXPERIENCE_HUB]` |

## Build scope

- Manifest entry + bundled `SKILL.md` / `reference.md`
- Bootstrap tests + `readme-information-architecture-skill.test.ts`
- Vocab row in `project-operations-mcp.md`
- Store linked stub via `tied-install.sh` on store root

## Handoff

After verification: `@build-plan` close-out or `@close-out` when sponsor requests commit.
