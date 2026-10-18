# [REQ-TIED_SESSION_HANDOFF_SKILL] Handoff skill — refined plan

**Status:** Refined (2026-10-18). **Program:** [../PLAN-HANDOFF-CLEAR-WORKSPACE-SKILLS/PLAN.md](../PLAN-HANDOFF-CLEAR-WORKSPACE-SKILLS/PLAN.md)

**Canonical skill body:** [`tools/bundled-session-handoff-skill/SKILL.md`](../../../tools/bundled-session-handoff-skill/SKILL.md)

**Sponsor invoke name:** **`handoff`** (`/handoff`, `@handoff`).

**Evidence log (filename):** **`tied-project/working/{REQ}/evidence/session-handoff.md`** — do **not** use `handoff.md`.

**Legacy phrasing:** Sponsors may say “session handoff”; **doc-only** — no `session-handoff` skill install name.

---

## Intent

Standalone bundled skill (same class as **xlate** / **unblock**) so operators can **end one chat** and **resume in another** with completions, plan next steps, completion signals, and a paste-ready resume prompt—without claiming machine close-out or running git.

---

## TIED stack (mint at build-plan)

| Layer | Token |
| --- | --- |
| REQ | **REQ-TIED_SESSION_HANDOFF_SKILL** |
| ARCH | **ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY** — complements prompt-type handoffs; **not** `plan-close-out` |
| IMPL | **IMPL-TIED_SESSION_HANDOFF_SKILL** — SKILL.md + manifest `skillName: handoff` |

**Manifest row (target):**

```json
{ "skillName": "handoff", "storeDir": "tools/bundled-session-handoff-skill" }
```

**Cross-refs:** [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS], [REQ-PROMPT_TYPE_GLOBAL_SKILLS], [completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md).

---

## Skill deltas (from current SKILL.md)

| Area | Change |
| --- | --- |
| Frontmatter | `name: handoff`; description leads with `/handoff` |
| Invocation | Strip `/handoff`; legacy “session handoff” wording called out once |
| Persist log | **Mandatory** when working folder known: update **`evidence/session-handoff.md`** |
| Boundaries table | Row label **`/handoff`**; contrast **`/plan-close-out`**, **`/clear-workspace`** |

---

## Governing decisions

- **depth_tier:** minimal
- **gate_policy:** advisory

---

## Satisfaction criteria

| id | Criterion |
| --- | --- |
| `skill-body` | Procedure + resume template + **session-handoff.md** path |
| `manifest` | `handoff` in `BUNDLED_STANDALONE_CLIENT_SKILLS` |
| `install` | `.cursor/skills/handoff` and `.claude/skills/handoff` |
| `test` | Bootstrap tests assert `/handoff` in copied SKILL.md |

---

## Declared change surface

- `tools/bundled-session-handoff-skill/SKILL.md`
- `tools/bootstrap/manifest.json`
- `mcp-server/src/e2e/client-bootstrap-skills.test.ts`
- `tools/bootstrap/lib/client-skills-catalog.test.mjs`
- TIED project YAML (REQ/ARCH/IMPL)
- `tied-project/vocab/project-operations-mcp.md`

**CITDP:** [CITDP-REQ-TIED_SESSION_HANDOFF_SKILL.yaml](./CITDP-REQ-TIED_SESSION_HANDOFF_SKILL.yaml)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)  
**Tests:** [test-strategy.md](./test-strategy.md)
