# Test strategy — REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE

**Scope:** Prompt-type skill bundle, subagent wrappers, bootstrap manifest, enrollment constants, TIED docs/vocab. **No runtime MCP behavior change** beyond optional new `surface_ref` values.

## Unit / static

1. **`mcp-server/src/e2e/prompt-type-skills.test.ts`**
   - `LEAF_SKILLS` includes `non-tied-refine`, `non-tied-build`, `non-tied-close` (18 total).
   - `SHARED_REFERENCES` includes `prompt-execution-mode.md`, `tied-plan-prepare.md`, `non-tied-plan-prepare.md`, `non-tied-build.md`, `non-tied-close.md`.
   - Plan leaves: body matches `/skill execution mode:\s*plan/i`; must not link `tied-implement.md` in Procedure.
   - Agent leaves: `skill execution mode: agent` on `build-plan`, `close-out`, `non-tied-build`, `non-tied-close`.

2. **`mcp-server/src/e2e/prompt-type-subagent.test.ts`**
   - `LEAF_PROMPT_TYPES` length 18.
   - `add-feature`: Refine before Plan; **no** `3. **Implement**` after Plan.
   - `refine-plan`: same.
   - New agents exist and reference canonical skills under `tools/bundled-prompt-type-skills/`.

3. **`PROMPT_TYPE_LEAF_IDS`** — enrollment test green with three new ids.

4. **`tools/bootstrap/lib/layers/skills-linked.test.mjs`** — stub resolution for new dirs.

## Integration

- `tied-install.sh --mode full` on temp dir: 18 leaf stubs + shared refs resolve.
- `tied_validate_consistency` after project TIED mutations.

## Out of scope

- Agentstream workflow trial scripts (separate TODO).
- Changing `debug` / `use-skill` monolithic procedures.

## RED order (@build-plan)

Write failing asserts in (1) and (2) before editing skill markdown.
