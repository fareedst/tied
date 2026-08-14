---
name: prompt-type-router
description: Composes multiple prompt-type workflows in caller-specified order. Use only when the caller explicitly names prompt-type-router or lists multiple prompt types (e.g. refine-plan then build-plan). Do not activate for a single clear type, ambiguous natural language ("plan and ship"), or to wrap use-skill recursively.
disable-model-invocation: true
---

# prompt-type-router

**Explicit-only invocation.** Never infer composition from ambiguous intent.

## Taxonomy (13 leaf types)

| prompt-type | Class |
| --- | --- |
| `plan-new-feature` | TIED full |
| `refine-plan` | TIED full |
| `build-plan` | TIED execute |
| `plan-close-out` | Git + TIED |
| `debug` | TIED debug |
| `question` | minimal |
| `use-skill` | TIED full |
| `ammend-commit` | Git + TIED |
| `non-tied-plan` | TIED-client-local |
| `non-tied-debug` | TIED-client-local |
| `leap-ad-hoc` | Git + TIED |
| `leap-diff-promote` | Git + TIED |
| `other` | minimal |

## Inputs

- Ordered list of prompt types (YAML list or comma-separated)
- Optional shared envelope: `git-condition:`
- **Invocation remainder:** shared request text passed to each leaf
- **Linked plan:** required for `refine-plan` and `build-plan` when those types run

## Behavior

1. **Validate** each type against the taxonomy; unknown → list taxonomy and **stop**
2. **Deduplicate** adjacent duplicates; preserve first-seen order
3. **Do not infer** from natural language — ask for explicit type list
4. For each type in order: load matching leaf `SKILL.md` procedure; pass the invocation remainder verbatim; pass a linked or in-message plan to `refine-plan` and `build-plan`
5. **Merge gates:** later Implement gates apply only after earlier Plan gates satisfied
6. **Do not** route `use-skill` through the router when router is the target
7. Output one composed instruction block with per-type section headers

## Composition examples

| Request | Action |
| --- | --- |
| `refine-plan` then `build-plan` | Improve the linked plan → execute build-plan on the result |
| `debug` only | Single leaf; Capture Failure before Plan |
| "fix bug and ship" (ambiguous) | Ask: `debug` + `plan-close-out`? or `non-tied-debug`? |

## Leaf skill locations

Each leaf lives at `~/.cursor/skills/<prompt-type>/SKILL.md`.

## Forbidden

Inferring types from intent; automatic git; `pbpaste`/`pbcopy`; activating for single-type requests that name a leaf directly.
