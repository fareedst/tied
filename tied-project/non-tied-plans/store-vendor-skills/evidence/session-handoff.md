# Session handoff — store-vendor-skills

**handoff_kind:** session  
**Date:** 2026-11-07  
**request_token:** n/a (non-tied)  
**prompt_type:** non-tied-build

## Plan spine

Linked [PLAN.md](../PLAN.md) · [test-strategy.md](../test-strategy.md)

## Authoritative refs

| Role | Path |
| --- | --- |
| Parent catalog | `tied-project/non-tied-plans/store-vendor-skills/PLAN.md` |
| Docker track (historical) | `tied-project/non-tied-plans/docker-official-skills-import/` |
| skills lock pin | `skills-lock.json` |
| `skills use` capture | `evidence/skills-use-agent-browser.txt` |
| agent-browser upstream | https://github.com/vercel-labs/agent-browser |

## Plan execution steps

**Last updated:** 2026-11-07 · **prompt_type:** non-tied-build · **PLAN:** ../PLAN.md

### Required

- [x] `track-b-agent-browser` — `npx skills use` → `evidence/skills-use-agent-browser.txt`; `skills add` refreshed stub; `npx skills list` shows Cursor agents
- [x] `git-hygiene` — `.agents/skills/` in `.gitignore` **outside** install-managed block (refresh-safe); `skills-lock.json` ready to commit
- [x] `track-a-verify` — 12 `skills/docker-*` dirs; `.cursor/skills/docker-compose-patterns/SKILL.md` symlink OK
- [x] `operator-cli` — `npm i -g agent-browser`; `agent-browser install`; `agent-browser skills get core` smoke OK
- [x] `bootstrap-coexistence` — `./tied-install.sh --refresh`; docker symlinks + `.agents/skills/agent-browser` survive
- [x] `plan-artifacts` — plan folder, docker superseded pointer, operator-lens subsection

### Optional

- [ ] `claude-harness` — explicit `skills add -a '*'` if Claude must list agent-browser separately from skills.sh defaults
- [x] `operator-lens-link` — subsection under Configuration rhythm in `docs/tied-experience/operator-lens.md`
- [ ] `non-tied-close` — commit `.gitignore`, `skills-lock.json`, plan folder when sponsor ready

### Recommendations

- Re-apply `.agents/skills/` under `.gitignore` only **outside** `# BEGIN TIED INSTALL MANAGED` — `tied-install --refresh` rewrites the managed block from bootstrap.
- Review https://skills.sh/vercel-labs/agent-browser before sessions using `Bash(agent-browser:*)`.

### Changelog (this slug)

- 2026-11-07 non-tied-refine: parent slug `store-vendor-skills`; unified Track A + B PLAN, test-strategy, Plan execution steps.
- 2026-11-07 non-tied-build: Track B install refresh; global CLI + Chrome; gitignore; operator-lens link; evidence capture.

## Environment

**workspace_root:** `/Users/fareed/Documents/dev/chatgpt/stdd` (TIED store)  
**execution_site:** store — not propagated to disposable clients  
**agent-browser CLI:** `/opt/homebrew/bin/agent-browser` (global; operator machine)

## Finished this build

- Track B stub at `.agents/skills/agent-browser/SKILL.md` (gitignored).
- Committable: plan slug, `skills-lock.json`, `.gitignore` hunk, docker PLAN pointer, operator-lens paragraph, `evidence/skills-use-agent-browser.txt`.

## Do next

`@non-tied-close` — staged commit when manual [test-strategy.md](../test-strategy.md) checks are acceptable.

## Constraints

Store-only; no TIED YAML MCP writes; no bootstrap manifest edits.

**Note:** Invoked as `@build-plan` but linked plan is non-TIED — executed under **non-tied-build** boundary (no `tied_checklist_gate_validate`).
