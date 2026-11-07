# Test strategy — store vendor skills (store only)

No automated RED tests in repo. Manual verification for `@non-tied-build` and optional `@non-tied-close`.

## Track A — Docker official (existing)

- [x] 12 directories under `skills/docker-*/` each contain `SKILL.md`
- [x] `git check-ignore -v skills/docker-build-strategies` matches managed `skills/` rule
- [x] `.cursor/skills/docker-build-strategies/SKILL.md` readable (symlink)
- [x] `.claude/skills/docker-build-strategies/SKILL.md` readable (symlink)

## Track B — agent-browser (skills.sh)

- [x] `npx --yes skills list` shows `agent-browser` at `.agents/skills/agent-browser`
- [x] `test -f .agents/skills/agent-browser/SKILL.md`
- [x] `git check-ignore -v .agents/skills/agent-browser` ignored (via `skills/` and/or `.agents/skills/` rules)
- [x] `skills-lock.json` is **trackable** (`git check-ignore -v skills-lock.json` → not ignored)
- [ ] `npx --yes skills experimental_install` succeeds on a clean `.agents/skills/` (optional destructive re-check)

## Git hygiene

- [x] `git status` shows no staged/untracked payloads under `skills/` or `.agents/skills/`
- [x] Committed plan folder (+ `skills-lock.json` + `.gitignore` hunk)

## Operator CLI

- [x] `command -v agent-browser` succeeds on operator host
- [x] `agent-browser skills get core | head` succeeds

## Store bootstrap coexistence

- [x] After `./tied-install.sh --refresh` from store root: `tied-yaml` under `.cursor/skills/`
- [x] Docker `docker-*` symlinks still resolve
- [x] Track B stub still present at `.agents/skills/agent-browser/SKILL.md`

## Client boundary

- [ ] Fresh disposable client lacks `agent-browser` and `docker-*` unless operator copies manually

## Boundary (forbidden)

- [x] No `tools/bootstrap/*` or `tied-bundle/` client doc changes for vendor propagation
- [x] No new REQ/ARCH/IMPL tokens

## Repeatable commands

```bash
REPO="/Users/fareed/Documents/dev/chatgpt/stdd"
cd "$REPO"

git check-ignore -v skills/docker-build-strategies
git check-ignore -v .agents/skills/agent-browser
git check-ignore -v skills-lock.json || echo "skills-lock.json should not be ignored"

npx --yes skills list | rg agent-browser
test -f .agents/skills/agent-browser/SKILL.md
test -f .cursor/skills/docker-compose-patterns/SKILL.md

agent-browser skills get core | head -5
```
