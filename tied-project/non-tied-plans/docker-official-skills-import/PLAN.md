# Plan: Docker official skills (TIED store only)

**Slug:** `docker-official-skills-import`  
**Track:** `@non-tied-plan` → `@non-tied-build` → optional `@non-tied-close`  
**Source:** `/Users/fareed/Downloads/skills-main-2/skills` ([docker/skills](https://github.com/docker/skills), Apache-2.0)

## Scope

**TIED methodology store checkout only.** Local gitignored vendor tree under `skills/docker-*` with symlinks for Cursor and Claude. **Not** shipped via `tied-install`, `tools/bootstrap/manifest.json`, or client docs.

## Layout

| Path | Role |
|------|------|
| `skills/docker-*/` | Canonical copy (gitignored) |
| `.cursor/skills/docker-*/` | Symlink → `../../skills/<name>` |
| `.claude/skills/docker-*/` | Symlink → `../../skills/<name>` |

## Inventory (12 skills)

`docker-project-foundations`, `docker-build-strategies`, `docker-compose-patterns`, `docker-sandboxes-lifecycle`, `docker-sandboxes-network-credentials`, `docker-sandboxes-env`, `docker-sandboxes-kits`, `docker-agent-config`, `docker-agent-run`, `docker-agent-deploy`, `docker-docs`, `docker-destructive-guardrails`

## Forbidden

No client propagation, no `tools/bundled-*`, no TIED YAML, no committed skill bodies.

## Handoff

See [evidence/session-handoff.md](evidence/session-handoff.md) for refresh commands. Optional: `docker-docs` HTTP MCP in store-local `.cursor/mcp.json`.
