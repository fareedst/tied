---
name: prompt-type-router
description: "Composes multiple prompt-type workflows in caller-specified order. Use only when the caller explicitly names prompt-type-router or lists multiple prompt types (e.g. refine-plan then build-plan). Do not activate for a single clear type, ambiguous natural language (\"plan and ship\"), or to wrap use-skill recursively."
disable-model-invocation: true
---

# prompt-type-router

**Explicit-only invocation.** Never infer composition from ambiguous intent.

See [prompt-execution-mode.md](../prompt-shared/prompt-execution-mode.md) for plan vs agent leaves.

## Taxonomy (18 leaf types)

| prompt-type | Class | skill execution mode |
| --- | --- | --- |
| `add-feature` | TIED plan | plan |
| `refine-plan` | TIED plan | plan |
| `build-plan` | TIED execute | agent |
| `close-out` | Git + TIED | agent |
| `debug` | TIED debug | agent (monolithic) |
| `question` | minimal | — |
| `use-skill` | TIED full | monolithic |
| `ammend-commit` | Git + TIED | agent |
| `non-tied-plan` | non-tied track | plan |
| `non-tied-refine` | non-tied track | plan |
| `non-tied-build` | non-tied track | agent |
| `non-tied-close` | non-tied track | agent |
| `non-tied-debug` | TIED-client-local | monolithic |
| `leap-ad-hoc` | Git + TIED | — |
| `leap-diff-promote` | Git + TIED | — |
| `citdp-record` | CITDP-only | plan |
| `citdp-promote` | TIED full | agent |
| `other` | minimal | — |

## Inputs

- Ordered list of prompt types (YAML list or comma-separated)
- Optional shared envelope: `git-condition:`
- **Invocation remainder:** shared request text passed to each leaf
- **Linked plan:** required for `refine-plan`, `build-plan`, `non-tied-refine`, and `non-tied-build` when those types run

## Behavior

1. **Validate** each type against the taxonomy; unknown → list taxonomy and **stop**
2. **Deduplicate** adjacent duplicates; preserve first-seen order
3. **Do not infer** from natural language — ask for explicit type list
4. For each type in order: load matching leaf `SKILL.md`; pass remainder; pass linked plan where required
5. **Merge gates:** plan-mode leaves must not satisfy Implement gates; agent-mode leaves (`build-plan`, `non-tied-build`, …) run RED/code gates
6. **Do not** route `use-skill` through the router when router is the target
7. Output one composed instruction block with per-type section headers

## Composition examples

| Request | Action |
| --- | --- |
| `add-feature`, `refine-plan`, `build-plan`, `close-out` | TIED four-step sponsor sequence |
| `non-tied-plan`, `non-tied-refine`, `non-tied-build`, `non-tied-close` | Non-TIED four-step sequence |
| `refine-plan` then `build-plan` | Improve linked plan → execute |
| `citdp-record` then `citdp-promote` | Standalone CITDP → full enforcement |
| `debug` only | Single leaf; Capture Failure before Plan |

## Leaf skill locations

Each leaf lives at `~/.cursor/skills/<prompt-type>/SKILL.md`.

## Forbidden

Inferring types from intent; automatic git; `pbpaste`/`pbcopy`; activating for single-type requests that name a leaf directly.
