# Test strategy — REQ-TIED_WORKFLOW_VISUALIZATION_SKILL

**depth_tier:** minimal · **gate_policy:** advisory

## Module boundary

Bootstrap standalone skill catalog + static `SKILL.md` contract (no new MCP runtime). Parity: [REQ-TIED_FEEDBACK_REPORT_SKILL](../REQ-TIED_FEEDBACK_REPORT_SKILL/test-strategy.md).

## RED (before manifest GREEN)

1. **`tools/bootstrap/lib/client-skills-catalog.test.mjs`**
   - `loadStandaloneClientSkills` length **6**
   - Sorted names include **`workflow-visualization`**
   - `installStandaloneSkillsCopy` includes `workflow-visualization/SKILL.md` with `/workflow-visualization`
2. **`mcp-server/src/e2e/feedback-skill.test.ts`**
   - Update expected standalone skill name array (six entries).
3. **`mcp-server/src/e2e/workflow-visualization-skill.test.ts`** (new)
   - Frontmatter: `name: workflow-visualization`, quoted `description`, `disable-model-invocation: true`
   - Body asserts: default `docs/`, `-workflows.md` pattern, **Verification gaps**, read-only / no TIED write boundary, no mandate to edit `src/`
   - `reference.md` defines **visualization catalog** perspectives (foundation A*, integration D*, domain C*) and workflow inventory — not a fixed count of eleven
   - `installStandaloneSkillsCopy` places skill under `.cursor/skills/workflow-visualization/`

## GREEN

1. Create `tools/bundled-workflow-visualization-skill/{SKILL.md,reference.md}`
2. Append manifest row `{ skillName: workflow-visualization, storeDir: tools/bundled-workflow-visualization-skill }`
3. Mint REQ/ARCH/IMPL + pseudocode sidecar
4. Vocab + README + handoff Related row + client-development-index hook

## Verification

```bash
node --test tools/bootstrap/lib/client-skills-catalog.test.mjs
cd mcp-server && npx tsx --test src/e2e/workflow-visualization-skill.test.ts
cd mcp-server && npx tsx --test src/e2e/feedback-skill.test.ts
```

After TIED mint:

```bash
# tied-cli or MCP
tied_validate_consistency
```

## Composition / E2E

Not required — install path covered by bootstrap pattern. **No** E2E that generates real client `docs/*-workflows.md` in CI (fixture optional later in `examples/` only).

## Security

Skill procedure forbids connection strings and host literals in generated docs; contract test may grep for explicit prohibition phrases in `SKILL.md`.
