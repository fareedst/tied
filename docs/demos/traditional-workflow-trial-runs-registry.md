# Traditional workflow trial runs registry

| Field | Value |
| --- | --- |
| **Purpose** | Facilitator index of **PROMPT-WF-01…08** recorded trials — harness, model slug, session grades, orchestrator **Run time**, and **latest for cell** |
| **Rows** | **77** (matches [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator)) |
| **Status** | Maintainer snapshot |
| **Last updated** | 2026-11-09 |
| **Disclaimer** | Store documentation only — not a `[REQ-*]` token, not a maturity score, not a model leaderboard |

Full trial protocol and rubric: [catalog-traditional-workflow-trial-prompts.md](catalog-traditional-workflow-trial-prompts.md).

---

## Disposable client naming (tag eras)

Normative orchestrator tag: [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG](../../tied-project/requirements/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml) · [`build_wf_trial_disposable_tag`](../../scripts/lib/wf-trial-disposable-tag.inc.sh).

| `tag_era` | Pattern | Example |
| --- | --- | --- |
| `standard` | `{epoch}-wf-agentstream-wf-NN-{harness}-{modelBucket}` | `1794048393-wf-agentstream-wf-01-cursor-composer25` |
| `legacy-short` | `{epoch}-wf-agentstream-wf-NN` | `1793604353-wf-agentstream-wf-01` |
| `legacy-manual` | `{epoch}-wf-NN-{model-suffix}` | `1793562432-wf-02-composer25` (WF-02 cohort range; see summary row) |
| `cohort-summary` | Catalog wildcard row | WF-01 seven IDE · WF-02 nine-model |

`modelBucket` follows `MODEL_CONFIG` or normalized `MODEL_SLUG` (lowercase, no `.` or `-`). Dirnames may abbreviate buckets (e.g. `lunamed`, `gpt56lunamediumfast`) while **model config** stays the catalog id (`luna-med`, etc.).

---

## Master runs table

Rows are **PROMPT-WF-01…08** cells from [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator). **WF** is the two-digit prompt index (`01`…`08`). **Grades** — `{mean} · Req/Tr/Ts/Al/Pr/Ch/Ml` from each readout [Session grading](catalog-traditional-workflow-trial-prompts.md#facilitator-grading-readout): leading **mean** is the arithmetic average of dimension bands on a 0.0 (**F**)–4.0 (**A**) ladder (2 decimal places — **sort key**); trailing slash string is unchanged per-dimension bands. **Run time** — orchestrator wall clock in **seconds** (`finished_at − started_at` on `wf-trial-orchestrator-run.v1.json`); facilitator timing only, not a leaderboard. **Latest** — `yes` when this row has the highest `client_id` for `(WF index, harness, model slug)`; cohort rows `n/a`.

| WF | Client ID | Harness | Model slug | Exit | Run time | Grades | Latest | Readout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | — | mixed | — | — | — | — | n/a | [readout](wf-01-four-model-implementation-comparison.md) |
| 01 | 1794044147 | cursor | `composer-2.5-fast` | 1 | 324 | 1.86 · A/B−/F/F/B/F/B+ | no | [readout](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md) |
| 01 | 1794048393 | cursor | `composer-2.5-fast` | 0 | 747 | 3.87 · A/A/A−/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md) |
| 01 | 1794050603 | cursor | `gpt-5.6-luna-medium-fast` | 1 | 1010 | 3.16 · A/B/A−/A−/B−/D+/A− | yes | [readout](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md) |
| 01 | 1794055051 | claude | `claude-haiku-5-5` | 0 | 592 | 3.81 · A/A−/A/A/B+/A/A− | yes | [readout](trial-readout-PROMPT-WF-01-claudehaiku55-1794055051-wf-agentstream-wf-01-claude-claudehaiku55.md) |
| 02 | — | manual-IDE | — | — | — | — | n/a | [readout](wf-02-nine-model-implementation-comparison.md) |
| 03 | 1793605811 | cursor | `composer-2.5-fast` | — | — | 3.77 · A/A−/B+/A/A−/A−/N/A | no | [readout](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md) |
| 03 | 1793815895 | claude | `claude-haiku-5-5` | — | — | 3.14 · A−/B/A−/A/C+/D+/N/A | no | [readout](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md) |
| 03 | 1793817075 | cursor | `composer-2.5-fast` | — | — | 3.76 · A/A/B+/A/B+/A−/N/A | no | [readout](trial-readout-PROMPT-WF-03-composer25-1793817075-wf-agentstream-wf-03-cursor-composer25.md) |
| 03 | 1793820250 | cursor | `composer-2.5-fast` | — | 792 | 3.76 · A/A/A−/A/B+/A/B+ | yes | [readout](trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md) |
| 03 | 1793842935 | claude | `claude-haiku-5-5` | — | 520 | 3.43 · A/B−/B+/A/B/A−/B+ | yes | [readout](trial-readout-PROMPT-WF-03-claudehaiku55-1793842935-wf-agentstream-wf-03-claude-claudehaiku55.md) |
| 03 | 1793848636 | claude | `claude-sonnet-5-5` | — | 332 | 3.67 · A/A−/A−/A/B/A/B+ | no | [readout](trial-readout-PROMPT-WF-03-claudesonnet55-1793848636-wf-agentstream-wf-03-claude-claudesonnet55.md) |
| 04 | 1793851888 | cursor | `composer-2.5-fast` | — | 690 | 3.61 · A/B+/A/A−/B/A/B+ | no | [readout](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) |
| 04 | 1794167373 | cursor | `composer-2.5-fast` | 1 | 486 | 3.07 · A/B+/B+/A/C+/D+/B+ | no | [readout](trial-readout-PROMPT-WF-04-composer25-1794167373-wf-agentstream-wf-04-cursor-composer25.md) |
| 04 | 1794170303 | cursor | `composer-2.5-fast` | 0 | 707 | 3.81 · A/A/A/A−/A−/A/B+ | yes | [readout](trial-readout-PROMPT-WF-04-composer25-1794170303-wf-agentstream-wf-04-cursor-composer25.md) |
| 04 | 1793852946 | claude | `claude-sonnet-5-5` | — | 223 | 2.66 · B/C+/B+/A−/D+/C/B | no | [readout](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md) |
| 04 | 1793853737 | claude | `claude-haiku-5-5` | — | 748 | 3.40 · A−/B/A−/A−/B−/A−/B+ | yes | [readout](trial-readout-PROMPT-WF-04-claudehaiku55-1793853737-wf-agentstream-wf-04-claude-claudehaiku55.md) |
| 05 | 1794042383 | cursor | `composer-2.5-fast` | 1 | 269 | 1.61 · A/C/F/F/C+/F/B | no | [readout](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) |
| 05 | 1794049382 | cursor | `composer-2.5-fast` | 0 | 689 | 3.73 · A/B+/A−/A−/A−/A/A− | no | [readout](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) |
| 05 | 1794167900 | cursor | `composer-2.5-fast` | 1 | 364 | 2.37 · A/B/C+/F/B−/D+/B+ | no | [readout](trial-readout-PROMPT-WF-05-composer25-1794167900-wf-agentstream-wf-05-cursor-composer25.md) |
| 05 | 1794175632 | cursor | `composer-2.5-fast` | 0 | 787 | 3.87 · A/A/A/A−/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-05-composer25-1794175632-wf-agentstream-wf-05-cursor-composer25.md) |
| 05 | 1794052043 | cursor | `gpt-5.6-luna-medium-fast` | 1 | 1057 | 3.59 · A/A−/A−/A−/B+/B/A− | yes | [readout](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md) |
| 05 | 1794053115 | claude | `claude-haiku-5-5` | 0 | 392 | 2.71 · A−/B−/F/N/A/B/C+/B+ | yes | [readout](trial-readout-PROMPT-WF-05-claudehaiku55-1794053115-wf-agentstream-wf-05-claude-claudehaiku55.md) |
| 05 | 1794055754 | claude | `claude-sonnet-5-5` | 0 | 371 | 3.81 · A−/B+/A/A/A−/A/A | no | [readout](trial-readout-PROMPT-WF-05-claudesonnet55-1794055754-wf-agentstream-wf-05-claude-claudesonnet55.md) |
| 05 | 1794066499 | claude | `claude-sonnet-5-5` | 0 | 256 | 3.53 · A−/B/A/A/B+/B/A− | no | [readout](trial-readout-PROMPT-WF-05-claudesonnet55-1794066499-wf-agentstream-wf-05-claude-claudesonnet55.md) |
| 05 | 1794066889 | claude | `claude-sonnet-5-5` | 0 | 436 | 3.87 · A/A−/A−/A/A−/A/A | no | [readout](trial-readout-PROMPT-WF-05-claudesonnet55-1794066889-wf-agentstream-wf-05-claude-sonnet55.md) |
| 06 | 1794056678 | cursor | `composer-2.5-fast` | 0 | 682 | 3.87 · A−/A−/A/A/A/A/A− | yes | [readout](trial-readout-PROMPT-WF-06-composer25-1794056678-wf-agentstream-wf-06-cursor-composer25.md) |
| 06 | 1794062924 | claude | `claude-haiku-5-5` | 0 | 374 | 3.34 · A/B/A−/A/B/B−/B | yes | [readout](trial-readout-PROMPT-WF-06-claudehaiku55-1794062924-wf-agentstream-wf-06-claude-claudehaiku55.md) |
| 07 | 1794057839 | cursor | `composer-2.5-fast` | 0 | 722 | 3.91 · A/A/A/A−/A−/A/A | yes | [readout](trial-readout-PROMPT-WF-07-composer25-1794057839-wf-agentstream-wf-07-cursor-composer25.md) |
| 07 | 1794063964 | claude | `claude-haiku-5-5` | 0 | 294 | 3.43 · A/C+/A/A−/B+/B/A− | yes | [readout](trial-readout-PROMPT-WF-07-claudehaiku55-1794063964-wf-agentstream-wf-07-claude-claudehaiku55.md) |
| 07 | 1794068800 | claude | `claude-sonnet-5-5` | 0 | 389 | 3.86 · A/B+/A/A/A−/A/A | no | [readout](trial-readout-PROMPT-WF-07-claudesonnet55-1794068800-wf-agentstream-wf-07-claude-sonnet55.md) |
| 08 | 1794058677 | cursor | `composer-2.5-fast` | 0 | 613 | 3.91 · A/A−/A/A/A−/A/A | yes | [readout](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md) |
| 08 | 1794064806 | claude | `claude-haiku-5-5` | 0 | 340 | 3.63 · A/B/A−/A/B+/A−/A− | yes | [readout](trial-readout-PROMPT-WF-08-claudehaiku55-1794064806-wf-agentstream-wf-08-claude-claudehaiku55.md) |
| 08 | 1794069919 | claude | `claude-sonnet-5-5` | 0 | 268 | 3.81 · A/A−/A/A/B+/A/A− | no | [readout](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md) |
| 01 | 1794075385 | cursor | `gpt-5.6-luna-high-fast` | 0 | 454 | 1.90 · B+/C+/F/F/C/B−/B | no | [readout](trial-readout-PROMPT-WF-01-luna-high-1794075385-wf-agentstream-wf-01-cursor-lunahigh.md) |
| 01 | 1794091020 | cursor | `gpt-5.6-luna-high-fast` | 1 | 1102 | 3.24 · A−/B+/A−/B+/B−/C+/A− | yes | [readout](trial-readout-PROMPT-WF-01-luna-high-1794091020-wf-agentstream-wf-01-cursor-lunahigh.md) |
| 02 | 1794075940 | cursor | `gpt-5.6-luna-high-fast` | 0 | 2319 | 3.63 · A/B/A−/A/B+/A−/A− | yes | [readout](trial-readout-PROMPT-WF-02-luna-high-1794075940-wf-agentstream-wf-02-cursor-lunahigh.md) |
| 03 | 1794079067 | cursor | `gpt-5.6-luna-high-fast` | 0 | 243 | 0.71 · F/F/F/F/D+/D/B− | no | [readout](trial-readout-PROMPT-WF-03-luna-high-1794079067-wf-agentstream-wf-03-cursor-lunahigh.md) |
| 04 | 1794079332 | cursor | `gpt-5.6-luna-high-fast` | 0 | 594 | 1.86 · B−/C+/F/F/C+/B−/B | yes | [readout](trial-readout-PROMPT-WF-04-luna-high-1794079332-wf-agentstream-wf-04-cursor-lunahigh.md) |
| 05 | 1794079974 | cursor | `gpt-5.6-luna-high-fast` | 0 | 1604 | 3.49 · A/C+/A/A−/B/A−/A− | yes | [readout](trial-readout-PROMPT-WF-05-luna-high-1794079974-wf-agentstream-wf-05-cursor-lunahigh.md) |
| 06 | 1794081715 | cursor | `gpt-5.6-luna-high-fast` | 1 | 1018 | 2.51 · A−/D+/B+/B+/C/D/B | yes | [readout](trial-readout-PROMPT-WF-06-luna-high-1794081715-wf-agentstream-wf-06-cursor-lunahigh.md) |
| 07 | 1794086713 | cursor | `gpt-5.6-luna-high-fast` | 0 | 1367 | 3.63 · A/B+/B/A−/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-07-luna-high-1794086713-wf-agentstream-wf-07-cursor-lunahigh.md) |
| 08 | 1794088871 | cursor | `gpt-5.6-luna-high-fast` | 0 | 521 | 1.23 · C/F/F/F/C+/D+/B | yes | [readout](trial-readout-PROMPT-WF-08-luna-high-1794088871-wf-agentstream-wf-08-cursor-lunahigh.md) |
| 03 | 1794093680 | cursor | `gpt-5.6-luna-high-fast` | 0 | 397 | 2.19 · B/C+/F/N/A/D+/C/B− | yes | [readout](trial-readout-PROMPT-WF-03-luna-high-1794093680-wf-agentstream-wf-03-cursor-lunahigh.md) |
| 01 | 1794094975 | cursor | `gpt-5.6-luna-low-fast` | 0 | 434 | 2.37 · B+/C/F/N/A/C/C+/B | yes | [readout](trial-readout-PROMPT-WF-01-luna-low-1794094975-wf-agentstream-wf-01-cursor-lunalow.md) |
| 02 | 1794095569 | cursor | `gpt-5.6-luna-low-fast` | 0 | 304 | 2.47 · A−/C+/F/N/A/C+/C/B | yes | [readout](trial-readout-PROMPT-WF-02-luna-low-1794095569-wf-agentstream-wf-02-cursor-lunalow.md) |
| 03 | 1794095886 | cursor | `gpt-5.6-luna-low-fast` | 0 | 408 | 2.14 · B/C/F/N/A/D+/C/B− | yes | [readout](trial-readout-PROMPT-WF-03-luna-low-1794095886-wf-agentstream-wf-03-cursor-lunalow.md) |
| 04 | 1794096361 | cursor | `gpt-5.6-luna-low-fast` | 0 | 381 | 3.49 · A−/B+/A−/A−/B/A−/B+ | yes | [readout](trial-readout-PROMPT-WF-04-luna-low-1794096361-wf-agentstream-wf-04-cursor-lunalow.md) |
| 05 | 1794096774 | cursor | `gpt-5.6-luna-low-fast` | 0 | 471 | 3.24 · A−/B/B+/A−/C+/A−/B | yes | [readout](trial-readout-PROMPT-WF-05-luna-low-1794096774-wf-agentstream-wf-05-cursor-lunalow.md) |
| 06 | 1794097458 | cursor | `gpt-5.6-luna-low-fast` | 0 | 409 | 3.30 · A−/B/B+/A−/B−/A−/B | yes | [readout](trial-readout-PROMPT-WF-06-luna-low-1794097458-wf-agentstream-wf-06-cursor-lunalow.md) |
| 07 | 1794099967 | cursor | `gpt-5.6-luna-low-fast` | 0 | 421 | 3.29 · A−/B/B/B+/B/A−/B+ | yes | [readout](trial-readout-PROMPT-WF-07-luna-low-1794099967-wf-agentstream-wf-07-cursor-lunalow.md) |
| 08 | 1794100604 | cursor | `gpt-5.6-luna-low-fast` | 0 | 334 | 2.96 · B+/B−/C+/B/B−/A−/B | no | [readout](trial-readout-PROMPT-WF-08-luna-low-1794100604-wf-agentstream-wf-08-cursor-lunalow.md) |
| 01 | 1794101529 | claude | `claude-sonnet-5-5` | 0 | 351 | 3.77 · A/A−/A−/A/B+/A/A− | yes | [readout](trial-readout-PROMPT-WF-01-claudesonnet55-1794101529-wf-agentstream-wf-01-claude-sonnet55.md) |
| 02 | 1794101881 | claude | `claude-sonnet-5-5` | 0 | 249 | 3.37 · A/B+/A/A/C+/B/B | yes | [readout](trial-readout-PROMPT-WF-02-claudesonnet55-1794101881-wf-agentstream-wf-02-claude-sonnet55.md) |
| 03 | 1794102131 | claude | `claude-sonnet-5-5` | 0 | 268 | 3.73 · A/A−/A/A−/B/A/A− | yes | [readout](trial-readout-PROMPT-WF-03-claudesonnet55-1794102131-wf-agentstream-wf-03-claude-sonnet55.md) |
| 04 | 1794102400 | claude | `claude-sonnet-5-5` | — | 308 | 3.67 · A/A−/B+/A−/B+/A/A− | yes | [readout](trial-readout-PROMPT-WF-04-claudesonnet55-1794102400-wf-agentstream-wf-04-claude-sonnet55.md) |
| 05 | 1794102708 | claude | `claude-sonnet-5-5` | 0 | 254 | 3.43 · A/B−/A/A/B/B/B+ | yes | [readout](trial-readout-PROMPT-WF-05-claudesonnet55-1794102708-wf-agentstream-wf-05-claude-sonnet55.md) |
| 06 | 1794102962 | claude | `claude-sonnet-5-5` | 0 | 260 | 3.67 · A/B+/A−/A/B+/A−/A− | yes | [readout](trial-readout-PROMPT-WF-06-claudesonnet55-1794102962-wf-agentstream-wf-06-claude-sonnet55.md) |
| 07 | 1794103222 | claude | `claude-sonnet-5-5` | 0 | 423 | 3.81 · A/A−/A/A/B+/A/A− | yes | [readout](trial-readout-PROMPT-WF-07-claudesonnet55-1794103222-wf-agentstream-wf-07-claude-sonnet55.md) |
| 08 | 1794103645 | claude | `claude-sonnet-5-5` | — | 290 | 3.61 · A−/A−/B+/A/B+/A/B+ | yes | [readout](trial-readout-PROMPT-WF-08-claudesonnet55-1794103645-wf-agentstream-wf-08-claude-sonnet55.md) |
| 01 | 1794181275 | cursor | `grok-4.7-medium-fast` | 0 | 2139 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-01-grok47-med-1794181275-wf-agentstream-wf-01-cursor-grok47med.md) |
| 02 | 1794183415 | cursor | `grok-4.7-medium-fast` | 0 | 2191 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-02-grok47-med-1794183415-wf-agentstream-wf-02-cursor-grok47med.md) |
| 03 | 1794188384 | cursor | `grok-4.7-medium-fast` | 0 | 2620 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-03-grok47-med-1794188384-wf-agentstream-wf-03-cursor-grok47med.md) |
| 04 | 1794191005 | cursor | `grok-4.7-medium-fast` | 0 | 4329 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-04-grok47-med-1794191005-wf-agentstream-wf-04-cursor-grok47med.md) |
| 05 | 1794195336 | cursor | `grok-4.7-medium-fast` | 0 | 2321 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-05-grok47-med-1794195336-wf-agentstream-wf-05-cursor-grok47med.md) |
| 06 | 1794197658 | cursor | `grok-4.7-medium-fast` | 0 | 2562 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-06-grok47-med-1794197658-wf-agentstream-wf-06-cursor-grok47med.md) |
| 07 | 1794200222 | cursor | `grok-4.7-medium-fast` | 0 | 2149 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-07-grok47-med-1794200222-wf-agentstream-wf-07-cursor-grok47med.md) |
| 08 | 1794202372 | cursor | `grok-4.7-medium-fast` | 0 | 2542 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) |
| 01 | 1794205559 | cursor | `composer-2.5-fast` | 0 | 850 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-01-composer25-1794205559-wf-agentstream-wf-01-cursor-composer25.md) |
| 02 | 1794206410 | cursor | `composer-2.5-fast` | 0 | 1086 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-02-composer25-1794206410-wf-agentstream-wf-02-cursor-composer25.md) |
| 03 | 1794207497 | cursor | `composer-2.5-fast` | 0 | 863 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-03-composer25-1794207497-wf-agentstream-wf-03-cursor-composer25.md) |
| 04 | 1794208361 | cursor | `composer-2.5-fast` | 0 | 851 | 3.83 · A/A−/A/A−/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-04-composer25-1794208361-wf-agentstream-wf-04-cursor-composer25.md) |
| 05 | 1794209213 | cursor | `composer-2.5-fast` | 0 | 845 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-05-composer25-1794209213-wf-agentstream-wf-05-cursor-composer25.md) |
| 06 | 1794210060 | cursor | `composer-2.5-fast` | 0 | 883 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-06-composer25-1794210060-wf-agentstream-wf-06-cursor-composer25.md) |
| 07 | 1794210943 | cursor | `composer-2.5-fast` | 0 | 797 | 3.87 · A/A−/A/A/A−/A/A− | yes | [readout](trial-readout-PROMPT-WF-07-composer25-1794210943-wf-agentstream-wf-07-cursor-composer25.md) |
| 08 | 1794211741 | cursor | `composer-2.5-fast` | 0 | 706 | 3.57 · A−/A−/B+/A/B+/A−/B+ | yes | [readout](trial-readout-PROMPT-WF-08-composer25-1794211741-wf-agentstream-wf-08-cursor-composer25.md) |
| 08 | 1794231848 | cursor | `gpt-5.6-luna-low-fast` | 0 | 523 | 3.34 · A−/B+/B+/A−/B−/A−/B | yes | [readout](trial-readout-PROMPT-WF-08-luna-low-1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow.md) |

---

## Footnotes

- **Run time source:** Disposable client `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json`, or [`client-snapshots.json`](../../tied-project/working/FACILITATOR-WF-BATCH-1794094/evidence/client-snapshots.json) when snapshotted; `—` when no manifest.
- **Grade mean (sort key):** Bands map to scores **A** 4.0, **A−** 3.7, **B+** 3.3, **B** 3.0, **B−** 2.7, **C+** 2.3, **C** 2.0, **C−** 1.7, **D+** 1.3, **D** 1.0, **F** 0.0; **N/A** omitted from the mean. Simple arithmetic mean (not catalog rubric weights). Registry sort aid only — not `maturity_score` or methodology effectiveness.
- **Grade source:** Facilitator readouts under `docs/demos/trial-readout-PROMPT-WF-*.md` at build time; authoritative per-dimension bands remain in each readout and after the `·` in **Grades**.
- **Cohort rows:** Per-client grades for WF-01 IDE matrix and WF-02 nine-model cells live in comparison pages and individual readouts, not in the summary rows above.
- **Forbidden:** `maturity_score`, weighted rollups, CMMI levels, or leaderboard-as-maturity.
- **Future-test rule:** One trial row does not prove methodology effectiveness; cohort claims need explicit pairing, baseline, and proof boundaries.
