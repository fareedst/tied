# Test strategy — REQ-TIED_PROMPT_SKILL_DISK_HANDOFF

**Profile:** minimal · advisory · **RED first** in `@build-plan` Phase A.

## Static contract (primary)

| ID | Assertion | File | RED before fix |
|----|-----------|------|----------------|
| S1 | Plan leaves reference `session-handoff.md` and **Plan execution steps** | `prompt-type-skills.test.ts` | yes |
| S2 | Plan leaves forbid chat-only / require disk paths | `prompt-type-subagent.test.ts` | yes |
| S3 | `handoff` SKILL references plan execution ledger | bundled session-handoff skill | yes |
| S4 | `session-handoff-structure.md` contains Required / Optional / Recommendations subsection | `session-handoff-structure-doc.test.mjs` | yes |
| S5 | `prompt-execution-mode.md` links `prompt-skill-disk-handoff.md` | skills or structure test | yes |
| S6 | `SHARED_REFERENCES` includes `prompt-skill-disk-handoff.md` | `prompt-type-skills.test.ts` | yes |
| S7 | `build-plan` / `close-out` agent bodies mention handoff path when revising steps | `prompt-type-subagent.test.ts` | yes |

### Suggested needle strings (Phase A)

- `Plan execution steps`
- `prompt-skill-disk-handoff.md`
- `evidence/session-handoff.md`
- `chat-only` or `lists disk paths`

## Non-goals for v1

- Runtime lint of handoff markdown on disk
- Agentstream batch enforcement (optional follow-on)

## Close-out battery

```bash
npm test --prefix mcp-server -- src/e2e/prompt-type-subagent.test.ts src/e2e/prompt-type-skills.test.ts
node --test tools/bootstrap/lib/session-handoff-structure-doc.test.mjs
```

## Gate notes

- Advisory `tied_checklist_gate_validate` (`pre_implementation`) should pass after CITDP adversarial block aligns to schema (refine slice).
- Blocking RED in plan mode is expected until `@build-plan`.
