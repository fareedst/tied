# Facilitator lens

**Audience:** People running disposable-client trials, grading LLM workflow comparisons, and publishing readouts—not production feature delivery.

---

## Demo and exercise catalogs

Index: [docs/demos/README.md](../demos/README.md)

| Catalog | Use when |
| --- | --- |
| [Greenfield add-feature prompts](../demos/catalog-greenfield-plan-new-feature-prompts.md) | Plain-language `@add-feature` trials on `test-new-tied-client` |
| [Four-phase workflow trials](../demos/catalog-traditional-workflow-trial-prompts.md) | `add-feature` → `refine-plan` → `build-plan` → `close-out` comparisons |
| [TIED compact tools](../demos/catalog-tied-compact-tools.md) | Traceability, TDD, composition, proof boundaries |
| [Agent resilience exercises](../demos/catalog-compact-programming-exercises.md) | Algorithmic stress without full TIED stack |

---

## Runnable entry points

- [TIED feature demo](../tied-feature-demo.md) — staged feature orchestration (disposable temp project)
- [Client development index](../../tied-bundle/docs/client-development-index.md) — gates, MCP, checklist tooling
- [New-client adherence runbook](../pseudocode-new-client-tied-adherence-runbook.md) — disposable smoke

---

## Store-only facilitator skills

From store root (self-install stubs when needed):

| Skill | After |
| --- | --- |
| `@record-gf-trial` | Greenfield disposable client build |
| `@record-wf-trial` | Four-phase workflow trial |

See catalog headers in [demos README](../demos/README.md#facilitator-skills-store-only).

---

## Grading vocabulary

[feedback-to-tied.md](../../tied-project/vocab/feedback-to-tied.md) · [quality-assurance.md](../../tied-project/vocab/quality-assurance.md)

Trial readouts under `docs/demos/trial-readout-*.md` are facilitator evidence—not `[REQ-*]` tokens.

---

[← Hub index](index.md) · [Operator lens](operator-lens.md)
