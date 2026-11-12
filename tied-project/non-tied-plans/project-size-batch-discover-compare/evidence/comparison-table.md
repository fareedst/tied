# Project size comparison (facilitator)

**Generated:** 2026-11-12T23:50:26.846Z
**Discover parent:** `/Users/fareed/Documents/dev/test`
**Pattern (substring):** `wf-agentstream`

Descriptive cohort evidence only — not grades or REQ status.

## Column definitions

Three layers: **atoms** (agreement footprint), **operational intent** (IMPL pseudo-code mass), **proof facets** (tests and evidence files). See [catalog-tied-size-and-trial-statistics.md](../../../docs/demos/catalog-tied-size-and-trial-statistics.md).

| Column | Layer | Definition |
| --- | --- | --- |
| **label** | — | Display label: `wf-NN-…` suffix when basename matches `/(wf-\d{2}-.+)$/i`; else full basename. Full discover name remains in `manifest.v1.json` and `receipts/*.json`. Summary applies an epoch floor (`summary_epoch_min` in manifest), then dedupes by display label (max discover epoch wins), then sorts. |
| **Vocab** | atoms | Rows in client vocab preferred-term tables under `tied-project/vocab/`. |
| **REQ** | atoms | Count of REQ tokens in `tied-project/requirements.yaml` index. |
| **ARCH** | atoms | Count of ARCH tokens in `tied-project/architecture-decisions.yaml` index. |
| **IMPL** | atoms | Count of IMPL tokens in `tied-project/implementation-decisions.yaml` index. |
| **applied_utf8** | operational intent | `applied_utf8_bytes`: UTF-8 byte length of trimmed non-empty lines minus template overlap bytes. |
| **applied_lines** | operational intent | Non-template pseudo-code lines across merged `IMPL-*-pseudocode.md` sidecars (gross minus template overlap). |
| **procedures** | operational intent | Analyzer procedure count in pseudo-code (`procedure_count`). |
| **unit** | proof facets | Unit test **cases** (`node:test` `it`/`test` per file) under subject `src/`. Receipt `validator_version` ≥ 1.1.0. |
| **comp** | proof facets | Path-declared composition test **cases** (suffixes per [proof path semantics](../../tied-project/requirements/REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS.yaml)). |
| **comp_inferred** | proof facets | `composition_inferred_cases` (validator_version ≥ 1.2.0): binding heuristic on path-unit files; does not change **comp**. |
| **lbl:*** | proof facets | `label_case_counts` subtypes (`composition.wiring`, etc.) when `--fine-labels` (1.2.0 receipts). |
| **e2e** | proof facets | E2E test **cases** per classified file (same counting rule). |
| **utf8/atom** | cross-layer | `operational_intent_utf8_per_atom`: applied_utf8_bytes ÷ (Vocab + REQ + ARCH + IMPL + optional corpus nodes). Rounded to nearest integer in table. |
| **oi/atom** | cross-layer | `operational_intent_per_atom`: applied_lines ÷ same atom denominator. Rounded to nearest integer in table; receipt JSON keeps full precision. |
| **pf/atom** | cross-layer | `proof_facets_per_atom`: (unit + comp + e2e + binding-inventory **cases**) ÷ same atom denominator. Pre-1.1.0 receipts counted **files**. Rounded to nearest integer in table. |
| **wall_clock** | — | Orchestrator wall duration in **minutes** (nearest integer from `trial_factors.orchestrator_wall_time_seconds` or render-time hydration). Receipt JSON keeps full-second precision; `—` when missing. |

Expanded table (`--verbose-table`): **repo (tail)**, **oi_hash**, **verify_ev** (`*consistency*.json` under `tied-project/working/**/evidence/`), **corpus_nodes** / **corpus_edges**, **gross_lines** / **parse_nodes** / **sidecars**, **binding_inv**. Row set matches Summary (`prepareComparisonSummaryRows`); display **label** uses the same trim rule.

## Summary

Rows after epoch floor (when `summary_epoch_min` > 0), dedupe by display **label** (latest discover epoch), sorted by display label then full basename.

| label | Vocab | REQ | ARCH | IMPL | applied_utf8 | applied_lines | procedures | unit | comp | e2e | utf8/atom | oi/atom | pf/atom | wall_clock |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| wf-01-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 7 | 6 |
| wf-01-cursor-grok47medmedium | 8 | 1 | 1 | 1 | 6235 | 131 | 5 | 9 | 0 | 0 | 445 | 9 | 1 | 34 |
| wf-02-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 5 | 6 |
| wf-02-cursor-grok47medmedium | 9 | 1 | 1 | 1 | 2283 | 49 | 3 | 9 | 0 | 0 | 152 | 3 | 1 | 29 |
| wf-03-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 2 | 4 |
| wf-03-cursor-grok47medmedium | 7 | 1 | 1 | 1 | 3882 | 65 | 5 | 9 | 0 | 0 | 299 | 5 | 1 | 35 |
| wf-04-claude-claudehaiku55medium | 0 | 1 | 1 | 1 | 2332 | 39 | 0 | 15 | 0 | 0 | 389 | 7 | 3 | 9 |
| wf-04-cursor-composer25high | 0 | 1 | 1 | 1 | 2664 | 39 | 4 | 8 | 0 | 0 | 444 | 7 | 1 | 13 |
| wf-04-cursor-grok47medmedium | 6 | 1 | 1 | 1 | 6859 | 91 | 5 | 14 | 0 | 0 | 572 | 8 | 1 | 32 |
| wf-05-claude-claudehaiku55medium | 0 | 1 | 1 | 1 | 2237 | 29 | 0 | 25 | 0 | 0 | 373 | 5 | 4 | 6 |
| wf-05-cursor-composer25high | 12 | 1 | 1 | 1 | 4205 | 73 | 5 | 11 | 0 | 0 | 234 | 4 | 1 | 14 |
| wf-05-cursor-grok47medmedium | 15 | 1 | 1 | 1 | 5234 | 122 | 4 | 11 | 0 | 0 | 249 | 6 | 1 | 37 |
| wf-06-claude-claudehaiku55medium | 0 | 1 | 1 | 1 | 2510 | 39 | 4 | 0 | 0 | 0 | 418 | 7 | 0 | 5 |
| wf-06-cursor-composer25high | 0 | 1 | 1 | 1 | 3527 | 69 | 5 | 11 | 0 | 0 | 588 | 12 | 2 | 17 |
| wf-06-cursor-grok47medmedium | 7 | 1 | 1 | 1 | 5100 | 84 | 5 | 15 | 0 | 0 | 392 | 6 | 1 | 32 |
| wf-07-claude-claudehaiku55medium | 0 | 1 | 1 | 1 | 2307 | 44 | 2 | 12 | 0 | 0 | 385 | 7 | 2 | 8 |
| wf-07-cursor-grok47medmedium | 0 | 1 | 1 | 1 | 1969 | 31 | 1 | 8 | 0 | 0 | 328 | 5 | 1 | 31 |
| wf-08-claude-claudehaiku55medium | 0 | 1 | 1 | 1 | 4772 | 86 | 6 | 3 | 0 | 0 | 795 | 14 | 1 | 7 |
| wf-08-cursor-grok47medmedium | 6 | 1 | 1 | 1 | 1861 | 34 | 2 | 3 | 0 | 0 | 155 | 3 | 0 | 31 |
| wf-09-claude-claudehaiku55high | 0 | 1 | 1 | 1 | 4437 | 75 | 0 | 14 | 0 | 0 | 740 | 13 | 2 | 14 |
| wf-09-claude-claudehaiku55low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | — | — | — | 3 |
| wf-09-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 7 | 5 |
| wf-09-claude-claudesonnet55high | 0 | 1 | 1 | 3 | 11102 | 158 | 6 | 26 | 0 | 0 | 1110 | 16 | 3 | 13 |
| wf-09-claude-claudesonnet55low | 0 | 1 | 1 | 1 | 430 | 4 | 0 | 9 | 0 | 0 | 72 | 1 | 2 | 2 |
| wf-09-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 1458 | 23 | 1 | 11 | 0 | 0 | 243 | 4 | 2 | 5 |
| wf-10-claude-claudefable52low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0 |
| wf-10-claude-claudehaiku55high | 0 | 1 | 1 | 2 | 6710 | 176 | 5 | 50 | 0 | 0 | 839 | 22 | 6 | 14 |
| wf-10-claude-claudehaiku55low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 16 | 7 | 0 | — | — | — | 5 |
| wf-10-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 21 | 0 | 0 | 0 | 0 | 11 | 7 |
| wf-10-claude-claudesonnet46low | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 6 | 4 | 0 | 0 | 0 | 5 | 13 |
| wf-10-claude-claudesonnet46medium | 0 | 1 | 1 | 1 | 1762 | 43 | 2 | 3 | 4 | 0 | 294 | 7 | 1 | 17 |
| wf-10-claude-claudesonnet55high | 0 | 1 | 1 | 3 | 8833 | 136 | 0 | 49 | 9 | 0 | 883 | 14 | 6 | 12 |
| wf-10-claude-claudesonnet55low | 0 | 1 | 1 | 1 | 541 | 4 | 0 | 8 | 0 | 0 | 90 | 1 | 1 | 3 |
| wf-10-claude-claudesonnet55medium | 0 | 1 | 1 | 4 | 1462 | 27 | 0 | 28 | 0 | 0 | 122 | 2 | 2 | 5 |
| wf-10-cursor-composer25medmedium | 0 | 1 | 1 | 5 | 2691 | 63 | 7 | 27 | 3 | 6 | 192 | 5 | 3 | 15 |
| wf-10-cursor-grok46highhigh | 26 | 1 | 1 | 1 | 13139 | 284 | 7 | 52 | 5 | 0 | 411 | 9 | 2 | 24 |
| wf-10-cursor-grok46lowlow | 13 | 1 | 1 | 5 | 8471 | 180 | 9 | 23 | 2 | 4 | 314 | 7 | 1 | 13 |
| wf-10-cursor-grok46medmedium | 21 | 1 | 1 | 1 | 11986 | 261 | 6 | 44 | 5 | 0 | 444 | 10 | 2 | 18 |
| wf-10-cursor-grok47low | 0 | 1 | 1 | 1 | 2646 | 41 | 0 | 8 | 0 | 0 | 441 | 7 | 1 | 14 |
| wf-10-cursor-grok47med | 10 | 1 | 1 | 1 | 7026 | 136 | 5 | 31 | 3 | 0 | 439 | 9 | 2 | 30 |

## Failed / skipped

- **discover:** SKIP_INELIGIBLE: 1794050603-wf-agentstream-wf-01-cursor-gpt56lunamedmediumfast: missing tied-project/requirements.yaml
- **discover:** SKIP_INELIGIBLE: 1794343547-wf-agentstream-wf-07-claude-claudehaiku55medium: missing tied-project/requirements.yaml

## Fine label counts (1.2.0)

| label | lbl:wiring | lbl:integration | lbl:contract | comp_inferred |
| --- | --- | --- | --- | --- |
| wf-01-claude-claudehaiku55medium | — | — | — | 0 |
| wf-01-cursor-grok47medmedium | — | — | — | 0 |
| wf-02-claude-claudehaiku55medium | — | — | — | 0 |
| wf-02-cursor-grok47medmedium | — | — | — | 0 |
| wf-03-claude-claudehaiku55medium | — | — | — | 4 |
| wf-03-cursor-grok47medmedium | — | — | — | 3 |
| wf-04-claude-claudehaiku55medium | — | — | — | 0 |
| wf-04-cursor-composer25high | — | — | — | 5 |
| wf-04-cursor-grok47medmedium | — | — | — | 1 |
| wf-05-claude-claudehaiku55medium | — | — | — | 0 |
| wf-05-cursor-composer25high | — | — | — | 0 |
| wf-05-cursor-grok47medmedium | — | — | — | 0 |
| wf-06-claude-claudehaiku55medium | — | — | — | 0 |
| wf-06-cursor-composer25high | — | — | — | 0 |
| wf-06-cursor-grok47medmedium | — | — | — | 0 |
| wf-07-claude-claudehaiku55medium | — | — | — | 0 |
| wf-07-cursor-grok47medmedium | — | — | — | 0 |
| wf-08-claude-claudehaiku55medium | — | — | — | 0 |
| wf-08-cursor-grok47medmedium | — | — | — | 0 |
| wf-09-claude-claudehaiku55high | — | — | — | 0 |
| wf-09-claude-claudehaiku55low | — | — | — | 0 |
| wf-09-claude-claudehaiku55medium | — | — | — | 0 |
| wf-09-claude-claudesonnet55high | — | — | — | 0 |
| wf-09-claude-claudesonnet55low | — | — | — | 0 |
| wf-09-claude-claudesonnet55medium | — | — | — | 0 |
| wf-10-claude-claudefable52low | — | — | — | 0 |
| wf-10-claude-claudehaiku55high | — | — | — | 0 |
| wf-10-claude-claudehaiku55low | 7 | — | — | 0 |
| wf-10-claude-claudehaiku55medium | — | — | — | 0 |
| wf-10-claude-claudesonnet46low | 4 | — | — | 0 |
| wf-10-claude-claudesonnet46medium | 4 | — | — | 0 |
| wf-10-claude-claudesonnet55high | 9 | — | — | 0 |
| wf-10-claude-claudesonnet55low | — | — | — | 4 |
| wf-10-claude-claudesonnet55medium | — | — | — | 0 |
| wf-10-cursor-composer25medmedium | 3 | — | — | 2 |
| wf-10-cursor-grok46highhigh | 5 | — | — | 6 |
| wf-10-cursor-grok46lowlow | 2 | — | — | 0 |
| wf-10-cursor-grok46medmedium | 5 | — | — | 0 |
| wf-10-cursor-grok47low | — | — | — | 0 |
| wf-10-cursor-grok47med | 3 | — | — | 0 |

---

**Proof boundary:** Read-only size evidence from subject repo; counts and hashes do not prove REQ satisfaction, test passage, checklist gates, or trial grade.
