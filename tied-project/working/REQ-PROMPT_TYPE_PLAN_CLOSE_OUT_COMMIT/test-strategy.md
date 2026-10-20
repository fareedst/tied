# Test strategy — plan-close-out traceable-commit

**REQ:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml)  
**Change class:** Prompt Composer contract (docs + static tests; no new runtime API)

## Unit / static (primary)

| Test file | What it locks |
| --- | --- |
| [prompt-type-subagent.test.ts](../../../mcp-server/src/e2e/prompt-type-subagent.test.ts) | `.cursor/agents/plan-close-out.md` references close_out gates, gitignore hygiene, **traceable-commit / git hygiene**, handoff with commit outcome; **ammend-commit** and **leap-diff-promote** still forbid commit |
| [prompt-type-skills.test.ts](../../../mcp-server/src/e2e/prompt-type-skills.test.ts) | `SHARED_REFERENCES` includes **`traceable-commit-close-out.md`**; all skill links resolve; frontmatter YAML valid |
| [plan-skills.test.ts](../../../mcp-server/src/jev/plan-skills.test.ts) | If hint asserts `commit deferred` for plan-close-out, update to traceable-commit wording |

## RED → GREEN order

1. Extend tests (RED).
2. Add shared doc + skill/agent edits (GREEN).
3. Re-run full prompt-type e2e slice.

## Commands

```bash
cd mcp-server && node --test src/e2e/prompt-type-subagent.test.ts src/e2e/prompt-type-skills.test.ts
cd mcp-server && node --test src/jev/plan-skills.test.ts
```

## Manual smoke (optional)

- Grep installed client stub path in bootstrap manifest: `plan-close-out/SKILL.md` mentions traceable commit after gates.
- Invoke `@plan-close-out` on a small staged doc-only change; confirm commit skipped when gate receipt shows `allowed: false`.

## Close-out (Phase 3)

| Check | Command / tool | Blocks commit |
| --- | --- | --- |
| Verification replay | `node --test` prompt-type e2e slice + `tied_validate_consistency` | Yes (process contract) |
| Machine close-out | `run-close-out-gates.mjs --phase close_out --envelope-blocking --sync-dispositions --reconcile` | Yes when `merged_decision.allowed` false |
| Hygiene preview | MCP `tied_git_hygiene` `plan_close_out`, `apply: false` | No (required before commit) |
| Traceable-commit | Scoped staging + Touchpoint 3 VALIDATE | Yes when gates blocked |

Reference close-out pattern: [REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE/evidence/closeout-run-close-out-gates-final.json](../REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE/evidence/closeout-run-close-out-gates-final.json) (minimal depth, `blocking_gap_count: 0`).

## Out of scope

- Live MCP integration test for `tied_git_hygiene` (covered by existing [git-hygiene.test.ts](../../../mcp-server/src/project-operations/git-hygiene.test.ts)).
