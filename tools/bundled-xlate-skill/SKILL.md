---
name: xlate
description: Touchpoint 1 vocabulary RESOLVE for sponsor intent — strip /xlate prefix, routing PRELOAD, RESOLVE charter, RECORD, optional vocabulary explorer. Use when the user invokes /xlate or asks to translate sponsor wording into TIED vocabulary.
disable-model-invocation: true
---

# xlate

Explicit invocation only (`/xlate` prefix or `@xlate`).

## Procedure

1. **Strip prefix** — Remove a leading `/xlate` (and surrounding whitespace) from the user message; treat the remainder as sponsor intent.
2. **Routing handoff** — Read `tied-project/vocab/routing.md` (client) and dispatch to `tied-bundle/vocab/routing.md` (methodology). **PRELOAD** only glossaries matched by keywords in the stripped message.
3. **Harness/platform RESOLVE** — When stripped intent names **model vs harness vs platform**, **coding agent platform**, **AI coding agent**, **workflow orchestrator**, **`tied agentstream`** placement, or **WF trial** matrix axes, **PRELOAD** [`tied-project/vocab/harness-platform-taxonomy.md`](../../tied-project/vocab/harness-platform-taxonomy.md) (routing row **2c**) before generic agentstream/HMEP glossaries.
4. **RESOLVE** — Before naming REQ/ARCH/IMPL tokens, block names, UI labels, or storage paths, map sponsor terms to indexed vocabulary entries. Use a RESOLVE table when multiple terms compete.
5. **RESOLVE charter** — When costly choices (consequence ladder rung 3+) remain open, emit sponsor-facing questions; do not treat the agent as intent authority ([REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]).
6. **Refinement gate** — If intent is still ambiguous after PRELOAD, ask the minimum clarifying question before TIED or code work.
7. **RECORD** — Add or update `tied-project/vocab/*.md` when stable new concepts appear.
8. **Optional** — Call MCP `tied_vocabulary_explorer_run` when breadth search helps RESOLVE (advisory only).

## Related MCP (during work, not Touchpoint 1)

- `tied_sponsor_questions` — structured costly-choice extraction from CITDP/LEAP artifacts while implementing.
- `tied_project_lint` — read-only validation aggregation before commits.

## Checklist touchpoint

Maps to checklist slug **translate-sponsor-intent** ([PROC-VOCABULARY_INDEX] Touchpoint 1).
