# Test strategy — REQ-TIED_SESSION_HANDOFF_SKILL

**depth_tier:** minimal · **gate_policy:** advisory

## Module boundary

Bootstrap standalone skill catalog + e2e install copy (no new MCP runtime).

## RED (before manifest GREEN)

1. Update `tools/bootstrap/lib/client-skills-catalog.test.mjs`:
   - `loadStandaloneClientSkills` length **4**
   - Names include **`handoff`**
   - Copy install includes `handoff/SKILL.md` with `/handoff` marker
2. Update `mcp-server/src/e2e/client-bootstrap-skills.test.ts`:
   - Assert `handoff` skill copy after `installStandaloneSkillsCopy`
   - Claude `installClaudeSkills` inventory still passes via manifest-driven assert

## GREEN

1. Update `tools/bundled-session-handoff-skill/SKILL.md` (name + log path)
2. Append manifest row `{ skillName: handoff, storeDir: tools/bundled-session-handoff-skill }`

## Verification

```bash
node --test tools/bootstrap/lib/client-skills-catalog.test.mjs
cd mcp-server && npm test -- client-bootstrap-skills
```

Optional: `tied_validate_consistency` after TIED mint.

## Composition / E2E

Not required — install path covered by existing bootstrap e2e pattern.
