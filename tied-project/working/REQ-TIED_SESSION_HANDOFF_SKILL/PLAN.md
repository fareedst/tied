# [REQ-TIED_SESSION_HANDOFF_SKILL] Session handoff skill — plan-new-feature

**Status:** Planned (refined). Canonical skill body: [`tools/bundled-session-handoff-skill/SKILL.md`](../../../tools/bundled-session-handoff-skill/SKILL.md).

**Sponsor name choice:** **`session-handoff`** (`/session-handoff`, `@session-handoff`).

## Intent

Standalone bundled skill (same class as **xlate** / **unblock**) so operators can **end one chat** and **resume in another** with: completions recorded, plan next steps highlighted, completion signals separated, and a **paste-ready resume prompt**—without claiming machine close-out or running git.

## TIED stack (mint at build-plan)

| Layer | Token |
|-------|--------|
| REQ | **REQ-TIED_SESSION_HANDOFF_SKILL** |
| ARCH | **ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY** — standalone bundle; complements prompt-type handoff docs; not a substitute for `plan-close-out` |
| IMPL | **IMPL-TIED_SESSION_HANDOFF_SKILL** — bundled SKILL.md + manifest registration |

**LEAP / bootstrap:** Add manifest entry under existing **[REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]** (no new installer code if catalog already iterates manifest):

```json
{ "skillName": "session-handoff", "storeDir": "tools/bundled-session-handoff-skill" }
```

**Cross-refs:** REQ-TIED_CLIENT_BOOTSTRAP_SKILLS, REQ-PROMPT_TYPE_GLOBAL_SKILLS, completion-signals handoff (methodology via prompt-shared).

## Non-goals

- Automatic git status, commit, or push
- Replacing `sub-close-out-evidence-sync` or envelope validation
- Adding to `tied-boundary.md` TIED leaf list (explicit standalone skill only)

## Governing decisions

- **depth_tier:** minimal (skill prose + manifest row + install test marker)
- **gate_policy:** advisory
- **Audience:** operator/sponsor before new conversation

## Satisfaction criteria (draft)

| id | Criterion |
|----|-----------|
| `skill-body` | SKILL.md documents procedure + resume prompt template |
| `manifest` | Listed in `BUNDLED_STANDALONE_CLIENT_SKILLS` |
| `install` | `tied-install` places `.cursor/skills/session-handoff` and `.claude/skills/session-handoff` |
| `test` | Catalog/e2e tests iterate manifest and assert `/session-handoff` marker in copied SKILL.md |

## Implement sequence

1. Mint REQ/ARCH/IMPL + pseudo-code (reference prompt-shared completion signals).
2. RED: extend `client-bootstrap-skills.test.ts` / catalog test for third skill.
3. GREEN: manifest entry only (installer already generic).
4. Vocab row in `project-operations-mcp.md`; `tied_validate_consistency`.
5. Optional: working PLAN **Session handoff** section template in skill (already in SKILL.md).

## Declared change surface

- `tools/bundled-session-handoff-skill/SKILL.md` (exists)
- `tools/bootstrap/manifest.json`
- Tests (extend existing bootstrap skill tests)
- TIED YAML indexes + detail files
- `tied-project/vocab/project-operations-mcp.md`

## Dependency

**[REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]** should be **closed or stable** before handoff REQ close-out (shared manifest contract).
