# Test strategy — Docker official skills (store only)

Manual checks before `@non-tied-close`.

## Inventory

- [x] 12 directories under `skills/docker-*/` each contain `SKILL.md`

## Git hygiene

- [x] `git check-ignore -v skills/docker-build-strategies` matches `skills/`
- [x] `git status` shows no staged/untracked skill payloads (only this plan folder if committed)

## Dual harness discovery

- [x] `.cursor/skills/docker-build-strategies/SKILL.md` readable (symlink)
- [x] `.claude/skills/docker-build-strategies/SKILL.md` readable (symlink)

## Store bootstrap coexistence

- [x] After `./tied-install.sh --refresh` from store root: `tied-yaml` present under `.cursor/skills/`
- [x] `docker-*` symlinks still resolve after refresh

## Optional MCP

- [ ] `docker-docs` in `.cursor/mcp.json` only if operator configured it (not required for build pass)

## Boundary

- [x] No `tools/bootstrap/*` or `tied-bundle/` client doc changes
- [x] No new REQ/ARCH/IMPL tokens
