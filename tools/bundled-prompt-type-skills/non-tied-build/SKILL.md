---
name: non-tied-build
description: "Agent-mode execution of a linked non-TIED plan: RED/TDD and product changes without TIED sync. Use when the caller names non-tied-build. Do not use for build-plan or non-tied-plan."
disable-model-invocation: true
---

# non-tied-build

Explicit invocation only (`@non-tied-build` or `prompt-type: non-tied-build`).

[REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]

## Execution mode

**skill execution mode:** agent

See [prompt-execution-mode.md](../prompt-shared/prompt-execution-mode.md).

## Inputs

- **Linked plan:** required.
- **Invocation remainder:** optional constraints.

## Procedure

1. **Implement** — [non-tied-build.md](../prompt-shared/non-tied-build.md)

## Gates

Test strategy from plan before code.

## Outputs

Product changes per plan; hand off to `@non-tied-close`.

## Forbidden

- TIED index/detail writes; `tied_verify` with update; automatic git push
