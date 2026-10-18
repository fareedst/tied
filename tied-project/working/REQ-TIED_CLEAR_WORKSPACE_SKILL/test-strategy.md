# Test strategy — REQ-TIED_CLEAR_WORKSPACE_SKILL

**depth_tier:** minimal · **gate_policy:** advisory

## Module boundary

New skill bundle + prompt-shared routing doc; shared manifest/test wave with handoff REQ.

## RED (before manifest GREEN)

Same bootstrap tests as handoff REQ:

- Catalog expects **`clear-workspace`** in standalone list
- Installed `clear-workspace/SKILL.md` contains `/clear-workspace`

No unit test for routing logic (prose-only orchestrator) unless a future fixture extracts routing into testable MCP — **out of scope**.

## GREEN

1. Add `tools/bundled-clear-workspace-skill/SKILL.md`
2. Add `tools/bundled-prompt-type-skills/prompt-shared/clear-workspace-routing.md`
3. Append manifest row for `clear-workspace`

## Verification

```bash
node --test tools/bootstrap/lib/client-skills-catalog.test.mjs
cd mcp-server && npm test -- client-bootstrap-skills
```

## Manual smoke (operator)

Invoke `@clear-workspace` with a named `tied-project/working/{REQ}/` folder; confirm receipt path convention `evidence/git-hygiene-receipt-{date}.md` when hygiene runs.
