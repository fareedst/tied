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
3. **RESOLVE** — Before naming REQ/ARCH/IMPL tokens, block names, UI labels, or storage paths, map sponsor terms to indexed vocabulary entries. Use a RESOLVE table when multiple terms compete.
4. **RESOLVE charter** — When costly choices (consequence ladder rung 3+) remain open, emit sponsor-facing questions; do not treat the agent as intent authority ([REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]).
5. **Refinement gate** — If intent is still ambiguous after PRELOAD, ask the minimum clarifying question before TIED or code work.
6. **RECORD** — Add or update `tied-project/vocab/*.md` when stable new concepts appear.
7. **Optional** — Call MCP `tied_vocabulary_explorer_run` when breadth search helps RESOLVE (advisory only).

## Related MCP (during work, not Touchpoint 1)

- `tied_sponsor_questions` — structured costly-choice extraction from CITDP/LEAP artifacts while implementing.
- `tied_project_lint` — read-only validation aggregation before commits.

## Checklist touchpoint

Maps to checklist slug **translate-sponsor-intent** ([PROC-VOCABULARY_INDEX] Touchpoint 1).
