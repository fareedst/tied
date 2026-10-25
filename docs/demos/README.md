# Demo and exercise catalogs

Human-readable catalogs for picking small programs and TIED-shaped build exercises. None of these pages register `[REQ-*]` tokens or imply universal maturity scores.

## Catalogs

| Document | Grades / stresses |
| --- | --- |
| [Agent resilience exercise catalog](catalog-compact-programming-exercises.md) | Algorithmic resilience (ENV/DATA/CON/STATE/ALG/ADV); may be built without full TIED stack |
| [TIED compact demo tool catalog](catalog-tied-compact-tools.md) | TIED traceability, TDD, composition, **Kaizen loop**, **methodology learning experiment**, explicit **proof boundaries** |
| [Greenfield plan-new-feature prompt catalog](catalog-greenfield-plan-new-feature-prompts.md) | Plain-language `@plan-new-feature` trial prompts for `test-new-tied-client` clients (facilitator grading maps to `TIED-DEMO-*`) |

## Trial readouts (facilitator)

Documented disposable-client runs (`/xlate` + grading vs catalog). Not REQ tokens.

| Readout | Prompt | Client |
| --- | --- | --- |
| [PROMPT-GF-01 @ 1791731617](trial-readout-PROMPT-GF-01-1791731617.md) | [PROMPT-GF-01](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-01) | `/Users/fareed/Documents/dev/test/1791731617` |
| [PROMPT-GF-02 @ 1791739774](trial-readout-PROMPT-GF-02-1791739774.md) | [PROMPT-GF-02](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-02) | `/Users/fareed/Documents/dev/test/1791739774` |
| [PROMPT-GF-25 @ 1791754135](trial-readout-PROMPT-GF-25-1791754135.md) | [PROMPT-GF-25](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-25) | `/Users/fareed/Documents/dev/test/1791754135` |
| [PROMPT-GF-11 @ 1792344147](trial-readout-PROMPT-GF-11-1792344147.md) | [PROMPT-GF-11](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-11) | `/Users/fareed/Documents/dev/test/1792344147` |
| [PROMPT-GF-14 @ 1792479171](trial-readout-PROMPT-GF-14-1792479171.md) | [PROMPT-GF-14](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-14) | `/Users/fareed/Documents/dev/test/1792479171` |
| [PROMPT-GF-04 @ 1792857852](trial-readout-PROMPT-GF-04-1792857852.md) | [PROMPT-GF-04](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-04) | `/Users/fareed/Documents/dev/test/1792857852` |
| [Custom audit brief @ 1792861936](trial-readout-CUSTOM-AUDIT-BRIEF-1792861936.md) | Custom ([TIED-DEMO-23](catalog-tied-compact-tools.md#family-f--meta-tied-tooling-tied-demo-2324) lens) | `/Users/fareed/Documents/dev/test/1792861936` |
| [PROMPT-GF-15 @ 1792863463](trial-readout-PROMPT-GF-15-1792863463.md) | [PROMPT-GF-15](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-15) | `/Users/fareed/Documents/dev/test/1792863463` |
| [PROMPT-GF-16 @ 1792937222](trial-readout-PROMPT-GF-16-1792937222.md) | [PROMPT-GF-16](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-16) | `/Users/fareed/Documents/dev/test/1792937222-gf-16` |

## Disposition legend (TIED catalog)

| Tag | Meaning |
| --- | --- |
| `idea` | Not implemented |
| `exercise-bridge` | Same problem as an exercise-catalog ID plus TIED deliverables |
| `runbook` | Link to existing runnable documentation |
| `meta-tool` | Exercises TIED MCP, gates, or bootstrap |

## Facilitator skill (store only)

After a greenfield client build, open the **TIED store** repo and invoke **`@record-gf-trial`** with the client directory or id. Install stub: `./tied-install.sh --allow-self-install --layers skills .` from the store root. Canonical procedure: [tools/bundled-record-gf-trial-skill/SKILL.md](../../tools/bundled-record-gf-trial-skill/SKILL.md).

## Runnable entry points

- [TIED feature demo](../tied-feature-demo.md) — staged feature orchestration walkthrough
- [Client development index](../../tied-bundle/docs/client-development-index.md) — `tied gate check`, MCP, checklist tooling
- [New-client adherence runbook](../pseudocode-new-client-tied-adherence-runbook.md) — disposable client smoke (`test-new-tied-client`)

## Vocabulary

Preferred terms for Loop 2–3 grading: [feedback-to-tied](../../tied-project/vocab/feedback-to-tied.md) · [quality-assurance](../../tied-project/vocab/quality-assurance.md).
