# Demo and exercise catalogs

Human-readable catalogs for picking small programs and TIED-shaped build exercises. None of these pages register `[REQ-*]` tokens or imply universal maturity scores.

## Catalogs

| Document | Grades / stresses |
| --- | --- |
| [Agent resilience exercise catalog](catalog-compact-programming-exercises.md) | Algorithmic resilience (ENV/DATA/CON/STATE/ALG/ADV); may be built without full TIED stack |
| [TIED compact demo tool catalog](catalog-tied-compact-tools.md) | TIED traceability, TDD, composition, **Kaizen loop**, **methodology learning experiment**, explicit **proof boundaries** |
| [Greenfield plan-new-feature prompt catalog](catalog-greenfield-plan-new-feature-prompts.md) | Plain-language `@add-feature` trial prompts for `test-new-tied-client` clients (facilitator grading maps to `TIED-DEMO-*`) |
| [Traditional four-phase workflow trial catalog](catalog-traditional-workflow-trial-prompts.md) | Compact **PROMPT-WF-*** remainders for `add-feature` → `refine-plan` → `build-plan` → `close-out`; LLM comparison (Composer 2.5, Luna low/med/high) |

## Trial readouts (facilitator — greenfield)

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
| [PROMPT-GF-05 @ 1792944114-gf-05](trial-readout-PROMPT-GF-05-1792944114.md) | [PROMPT-GF-05](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-05) | `/Users/fareed/Documents/dev/test/1792944114-gf-05` |
| [PROMPT-GF-10 @ 1792950723-gf-10](trial-readout-PROMPT-GF-10-1792950723-gf-10.md) | [PROMPT-GF-10](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-10) | `/Users/fareed/Documents/dev/test/1792950723-gf-10` |
| [PROMPT-GF-12 @ 1792966303-gf-12](trial-readout-PROMPT-GF-12-1792966303-gf-12.md) | [PROMPT-GF-12](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-12) | `/Users/fareed/Documents/dev/test/1792966303-gf-12` |
| [PROMPT-GF-17 @ 1792967943-gf-17](trial-readout-PROMPT-GF-17-1792967943-gf-17.md) | [PROMPT-GF-17](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-17) | `/Users/fareed/Documents/dev/test/1792967943-gf-17` |
| [PROMPT-GF-06 @ 1792969070-gf-06](trial-readout-PROMPT-GF-06-1792969070-gf-06.md) | [PROMPT-GF-06](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-06) | `/Users/fareed/Documents/dev/test/1792969070-gf-06` |

## Trial readouts (facilitator — four-phase workflow)

Documented disposable-client runs graded with **workflow choreography**. Not REQ tokens.

| Readout | Prompt | Model config | Client |
| --- | --- | --- | --- |
| [PROMPT-WF-01 comparison (IDE + agentstream)](wf-01-four-model-implementation-comparison.md) | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) | Luna low/med, Composer 2.5 IDE, Grok 4.7, Opus 5.5, Gemini 4 Argon, Muse Spark; **agentstream** Composer 2.5 | `/Users/fareed/Documents/dev/test/1793483171-wf-01-*` … `1793560725-wf-01-muse-spark13-med`; orchestrator: `workflow-trial-agentstream wf-01` |
| [PROMPT-WF-01 agentstream @ 1793604353](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md) | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1793604353-wf-agentstream-wf-01` |
| [PROMPT-WF-02 nine-model comparison](wf-02-nine-model-implementation-comparison.md) | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) | Composer 2.5, Gemini, Grok, Luna/Sol, Muse Spark/Wonder, Fable, Opus | `/Users/fareed/Documents/dev/test/1793562432-wf-02-*` … `1793592181-wf-02-claude-opus55-med` — per-client [readouts](trial-readout-PROMPT-WF-02-composer25-1793562432.md) … [Opus](trial-readout-PROMPT-WF-02-claude-opus55-med-1793592181.md) |
| [PROMPT-WF-03 agentstream @ 1793605811](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md) | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1793605811-wf-agentstream-wf-03` |
| [PROMPT-WF-03 Claude @ 1793815895](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md) | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) | `claude-haiku-5-5` | `/Users/fareed/Documents/dev/test/1793815895-wf-agentstream-wf-03-claude-claudehaiku55` |
| [PROMPT-WF-03 Cursor agentstream @ 1793817075](trial-readout-PROMPT-WF-03-composer25-1793817075-wf-agentstream-wf-03-cursor-composer25.md) | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1793817075-wf-agentstream-wf-03-cursor-composer25` |
| [PROMPT-WF-03 Cursor agentstream @ 1793820250](trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md) | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1793820250-wf-agentstream-wf-03-cursor-composer25` |
| [PROMPT-WF-03 Claude agentstream @ 1793842935](trial-readout-PROMPT-WF-03-claudehaiku55-1793842935-wf-agentstream-wf-03-claude-claudehaiku55.md) | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) | `claude-haiku-5-5` | `/Users/fareed/Documents/dev/test/1793842935-wf-agentstream-wf-03-claude-claudehaiku55` |
| [PROMPT-WF-04 Cursor agentstream @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1793851888-wf-agentstream-wf-04-cursor-composer25` |
| [PROMPT-WF-04 Claude Sonnet agentstream @ 1793852946](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md) | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) | `claude-sonnet-5-5` | `/Users/fareed/Documents/dev/test/1793852946-wf-agentstream-wf-04-claude-claudesonnet55` |
| [PROMPT-WF-04 Claude Haiku agentstream @ 1793853737](trial-readout-PROMPT-WF-04-claudehaiku55-1793853737-wf-agentstream-wf-04-claude-claudehaiku55.md) | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) | `claude-haiku-5-5` | `/Users/fareed/Documents/dev/test/1793853737-wf-agentstream-wf-04-claude-claudehaiku55` |
| [PROMPT-WF-05 Cursor agentstream @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1794042383-wf-agentstream-wf-05-cursor-composer25` |
| [PROMPT-WF-05 Cursor agentstream @ 1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1794049382-wf-agentstream-wf-05-cursor-composer25` |
| [PROMPT-WF-01 Cursor agentstream @ 1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md) | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1794044147-wf-agentstream-wf-01-cursor-composer25` |
| [PROMPT-WF-01 Cursor agentstream @ 1794048393](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md) | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) | `composer-2.5` / `composer-2.5-fast` | `/Users/fareed/Documents/dev/test/1794048393-wf-agentstream-wf-01-cursor-composer25` |
| [PROMPT-WF-01 Luna med agentstream @ 1794050603](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md) | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) | `luna-med` / `gpt-5.6-luna-medium-fast` | `/Users/fareed/Documents/dev/test/1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast` |
| [PROMPT-WF-01 Claude Haiku agentstream @ 1794055051](trial-readout-PROMPT-WF-01-claudehaiku55-1794055051-wf-agentstream-wf-01-claude-claudehaiku55.md) | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) | `claude-haiku-5-5` | `/Users/fareed/Documents/dev/test/1794055051-wf-agentstream-wf-01-claude-claudehaiku55` |
| [PROMPT-WF-05 Luna med agentstream @ 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md) | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) | `luna-med` / `gpt-5.6-luna-medium-fast` | `/Users/fareed/Documents/dev/test/1794052043-wf-agentstream-wf-05-cursor-lunamed` |
| [PROMPT-WF-05 Claude Haiku agentstream @ 1794053115](trial-readout-PROMPT-WF-05-claudehaiku55-1794053115-wf-agentstream-wf-05-claude-claudehaiku55.md) | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) | `claude-haiku-5-5` | `/Users/fareed/Documents/dev/test/1794053115-wf-agentstream-wf-05-claude-claudehaiku55` |
| [PROMPT-WF-05 Claude Sonnet agentstream @ 1794055754](trial-readout-PROMPT-WF-05-claudesonnet55-1794055754-wf-agentstream-wf-05-claude-claudesonnet55.md) | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) | `claude-sonnet-5-5` | `/Users/fareed/Documents/dev/test/1794055754-wf-agentstream-wf-05-claude-claudesonnet55` |

Maintained by **`@record-wf-trial`**. Catalog: [traditional workflow trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator).

## Disposition legend (TIED catalog)

| Tag | Meaning |
| --- | --- |
| `idea` | Not implemented |
| `exercise-bridge` | Same problem as an exercise-catalog ID plus TIED deliverables |
| `runbook` | Link to existing runnable documentation |
| `meta-tool` | Exercises TIED MCP, gates, or bootstrap |

## Facilitator skills (store only)

Install stubs: `./tied-install.sh --allow-self-install --layers skills .` from the store root.

| Skill | When |
| --- | --- |
| [**`@record-gf-trial`**](catalog-greenfield-plan-new-feature-prompts.md) | After greenfield / single-session client build — [SKILL.md](../../tools/bundled-record-gf-trial-skill/SKILL.md) |
| [**`@record-wf-trial`**](catalog-traditional-workflow-trial-prompts.md) | After four-phase workflow trial — [SKILL.md](../../tools/bundled-record-wf-trial-skill/SKILL.md) |

## Runnable entry points

- [TIED Experience Hub](../tied-experience/index.md) — visual methodology and audience lenses (store dogfood)
- [TIED feature demo](../tied-feature-demo.md) — staged feature orchestration walkthrough
- [Client development index](../../tied-bundle/docs/client-development-index.md) — `tied gate check`, MCP, checklist tooling
- [New-client adherence runbook](../pseudocode-new-client-tied-adherence-runbook.md) — disposable client smoke (`test-new-tied-client`)

## Vocabulary

Preferred terms for Loop 2–3 grading: [feedback-to-tied](../../tied-project/vocab/feedback-to-tied.md) · [quality-assurance](../../tied-project/vocab/quality-assurance.md).
