# Skill execution mode (plan vs agent)

[REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [ARCH-PROMPT_TYPE_SKILL_EXECUTION_MODE] [IMPL-PROMPT_TYPE_SKILL_EXECUTION_MODE]

Normative **`plan`** or **`agent`** on leaf prompt-type skills. Distinct from **harness profile** (agentstream/Task tuning) and from Cursor IDE Plan mode (IDE constraints are **additive**, never a bypass).

## Plan mode

**Allowed**

- Read repository source, tests, fixtures, and TIED indexes.
- MCP/tools that do not mutate product code (validate, analyze, read index/detail).
- **TIED lane:** Writes under `tied-project/working/{REQ-TOKEN}/` (`PLAN.md`, tracker, draft CITDP, test-strategy design).
- **TIED lane:** Documentation-first project REQ/ARCH/IMPL design in `tied-project/` when the linked plan scopes it — still no product tree mutations.
- **Non-TIED lane:** Writes under `tied-project/non-tied-plans/{slug}/` per [non-tied-boundary.md](non-tied-boundary.md).
- Optional advisory `tied_checklist_gate_validate` (`phase: pre_implementation`); blocking RED progression is **expected** in plan mode.

**Forbidden**

- Mutations under product code, tests, fixtures, or data trees unless the plan is explicitly docs-only with zero product diff.
- [tied-implement.md](tied-implement.md); RED/TDD; composition/E2E; `tied_verify` with update.
- Completion, verification, or close-out claims.
- Running a later sequence step in the same invocation.

**Stop rule:** **Plan-mode handoff** — canonical artifact paths, token or slug, and the next explicit skill (`@refine-plan`, `@build-plan`, …).

## Agent mode

Execute leaves may run RED/code, verification gates, and close-out (or non-TIED scoped commit) per their skill contracts.

## Declaration

Leaf skills declare mode in the body (not YAML frontmatter):

```markdown
## Execution mode

**skill execution mode:** plan
```
