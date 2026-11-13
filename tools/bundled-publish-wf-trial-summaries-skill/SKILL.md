---
name: publish-wf-trial-summaries
description: "Store-only facilitator workflow — no trial inputs. Refreshes cohort WF trial summaries (runs registry, comparison matrix, project-size comparison-table) from existing docs/demos trial-readout-PROMPT-WF-*.md analyses. Run after @record-wf-trial when indexes drift. Not @record-wf-trial."
disable-model-invocation: true
---

# publish-wf-trial-summaries

**Audience:** facilitator in the **TIED methodology store** repo.

**When:** After one or more **`@record-wf-trial`** readouts exist on disk, cohort **indexes and cross-tables** need a full refresh—without naming individual client ids.

Explicit invocation only (`/publish-wf-trial-summaries`, `@publish-wf-trial-summaries`).

## Prerequisites

- Store workspace with **`tied-yaml`** MCP.
- Readouts under `docs/demos/trial-readout-PROMPT-WF-*.md`.
- **Recorded trials** links in [workflow catalog](../../docs/demos/catalog-traditional-workflow-trial-prompts.md) maintained by `@record-wf-trial` (this skill does **not** rewrite catalog table rows in v1).

## Procedure

1. **Strip prefix** — Remove skill name; **no positional remainder required**. Optional flags only: [reference.md](./reference.md).

2. **Workspace gate** — `tied_config_get_base_path` must resolve **`{store}/tied-project/`**.

3. **PRELOAD** — [workflow catalog](../../docs/demos/catalog-traditional-workflow-trial-prompts.md); [size catalog](../../docs/demos/catalog-tied-size-and-trial-statistics.md); grading guardrails (no leaderboard).

4. **Run orchestrator** — From store root:

   ```bash
   node tools/bootstrap/lib/wf-trial-summaries-publish.mjs
   ```

   See [reference § Publish surface](./reference.md#publish-surface) for artifacts and skip flags.

5. **Review evidence** — Latest `tied-project/working/FACILITATOR-WF-PUBLISH-*/evidence/publish-summary.md` lists orphan readouts and steps run.

6. **Git commit** — **Sponsor-only** unless explicitly requested.

## Boundaries

| Surface | Role |
| --- | --- |
| **`@publish-wf-trial-summaries`** | Cohort index regen from readouts |
| **`@record-wf-trial`** | Per-client inspection + readout + catalog row |
| **`BUNDLED_STANDALONE_CLIENT_SKILLS`** | Does **not** include this skill |

## Related

- [reference.md](./reference.md) · [examples.md](./examples.md) · [README.md](./README.md)
- [`@record-wf-trial`](../bundled-record-wf-trial-skill/SKILL.md)
