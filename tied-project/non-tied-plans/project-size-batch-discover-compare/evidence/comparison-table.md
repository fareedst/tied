# Project size comparison (facilitator)

**Generated:** 2026-11-11T15:30:40.433Z
**Discover parent:** `/Users/fareed/Documents/dev/test`
**Pattern (substring):** `wf-agentstream`

Descriptive cohort evidence only — not grades or REQ status.

## Column definitions

Three layers: **atoms** (agreement footprint), **operational intent** (IMPL pseudo-code mass), **proof facets** (tests and evidence files). See [catalog-tied-size-and-trial-statistics.md](../../../docs/demos/catalog-tied-size-and-trial-statistics.md).

| Column | Layer | Definition |
| --- | --- | --- |
| **label** | — | Display label: `wf-NN-…` suffix when basename matches `/(wf-\d{2}-.+)$/i`; else full basename. Full discover name remains in `manifest.v1.json` and `receipts/*.json`. Summary applies an epoch floor (`summary_epoch_min` in manifest), then dedupes by display label (max discover epoch wins), then sorts. |
| **REQ** | atoms | Count of REQ tokens in `tied-project/requirements.yaml` index. |
| **ARCH** | atoms | Count of ARCH tokens in `tied-project/architecture-decisions.yaml` index. |
| **IMPL** | atoms | Count of IMPL tokens in `tied-project/implementation-decisions.yaml` index. |
| **Vocab** | atoms | Rows in client vocab preferred-term tables under `tied-project/vocab/`. |
| **applied_utf8** | operational intent | `applied_utf8_bytes`: UTF-8 byte length of trimmed non-empty lines minus template overlap bytes. |
| **applied_lines** | operational intent | Non-template pseudo-code lines across merged `IMPL-*-pseudocode.md` sidecars (gross minus template overlap). |
| **procedures** | operational intent | Analyzer procedure count in pseudo-code (`procedure_count`). |
| **unit** | proof facets | Unit test **cases** (`node:test` `it`/`test` per file) under subject `src/`. Receipt `validator_version` ≥ 1.1.0. |
| **comp** | proof facets | Path-declared composition test **cases** (suffixes per [proof path semantics](../../tied-project/requirements/REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS.yaml)). |
| **comp_inferred** | proof facets | `composition_inferred_cases` (validator_version ≥ 1.2.0): binding heuristic on path-unit files; does not change **comp**. |
| **lbl:*** | proof facets | `label_case_counts` subtypes (`composition.wiring`, etc.) when `--fine-labels` (1.2.0 receipts). |
| **e2e** | proof facets | E2E test **cases** per classified file (same counting rule). |
| **oi/atom** | cross-layer | `operational_intent_per_atom`: applied_lines ÷ (Vocab + REQ + ARCH + IMPL + optional corpus nodes). Rounded to nearest integer in table; receipt JSON keeps full precision. |
| **utf8/atom** | cross-layer | `operational_intent_utf8_per_atom`: applied_utf8_bytes ÷ same atom denominator. Rounded to nearest integer in table. |
| **pf/atom** | cross-layer | `proof_facets_per_atom`: (unit + comp + e2e + binding-inventory **cases**) ÷ same atom denominator. Pre-1.1.0 receipts counted **files**. Rounded to nearest integer in table. |
| **wall_clock** | — | Orchestrator wall duration in **minutes** (nearest integer from `trial_factors.orchestrator_wall_time_seconds` or render-time hydration). Receipt JSON keeps full-second precision; `—` when missing. |

Expanded table (`--verbose-table`): **repo (tail)**, **oi_hash**, **verify_ev** (`*consistency*.json` under `tied-project/working/**/evidence/`), **corpus_nodes** / **corpus_edges**, **gross_lines** / **parse_nodes** / **sidecars**, **binding_inv**. Row set matches Summary (`prepareComparisonSummaryRows`); display **label** uses the same trim rule.

## Summary

Rows after epoch floor (when `summary_epoch_min` > 0), dedupe by display **label** (latest discover epoch), sorted by display label then full basename.

| label | REQ | ARCH | IMPL | Vocab | applied_utf8 | applied_lines | procedures | unit | comp | e2e | oi/atom | utf8/atom | pf/atom | wall_clock |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| wf-01-claude-claudehaiku55medium | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 7 | 6 |
| wf-01-cursor-composer25high | 1 | 1 | 1 | 0 | 2126 | 50 | 4 | 12 | 0 | 0 | 8 | 354 | 2 | 11 |
| wf-01-cursor-grok47medmedium | 1 | 1 | 1 | 8 | 6235 | 131 | 5 | 9 | 0 | 0 | 9 | 445 | 1 | 34 |
| wf-01-cursor-lunalow | 1 | 1 | 1 | 0 | 879 | 12 | 1 | 4 | 0 | 0 | 2 | 147 | 1 | 18 |
| wf-01-cursor-lunalowmedium | 1 | 1 | 1 | 0 | 4076 | 74 | 5 | 4 | 0 | 0 | 12 | 679 | 1 | 22 |
| wf-02-claude-claudehaiku55medium | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 5 | 6 |
| wf-02-cursor-composer25high | 1 | 1 | 2 | 0 | 2576 | 50 | 4 | 9 | 0 | 0 | 6 | 322 | 1 | 15 |
| wf-02-cursor-grok47medmedium | 1 | 1 | 1 | 9 | 2283 | 49 | 3 | 9 | 0 | 0 | 3 | 152 | 1 | 29 |
| wf-03-claude-claudehaiku55medium | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 2 | 4 |
| wf-03-cursor-composer25high | 1 | 1 | 1 | 0 | 2450 | 47 | 5 | 4 | 0 | 0 | 8 | 408 | 1 | 16 |
| wf-03-cursor-composer25medium | 1 | 1 | 1 | 0 | 4811 | 93 | 7 | 8 | 0 | 0 | 16 | 802 | 1 | 12 |
| wf-03-cursor-grok47medmedium | 1 | 1 | 1 | 7 | 3882 | 65 | 5 | 9 | 0 | 0 | 5 | 299 | 1 | 35 |
| wf-04-claude-claudehaiku55medium | 1 | 1 | 1 | 0 | 2332 | 39 | 0 | 15 | 0 | 0 | 7 | 389 | 3 | 9 |
| wf-04-cursor-composer25high | 1 | 1 | 1 | 0 | 2664 | 39 | 4 | 8 | 0 | 0 | 7 | 444 | 1 | 13 |
| wf-04-cursor-grok47medmedium | 1 | 1 | 1 | 6 | 6859 | 91 | 5 | 14 | 0 | 0 | 8 | 572 | 1 | 32 |
| wf-05-claude-claudehaiku55medium | 1 | 1 | 1 | 0 | 2237 | 29 | 0 | 25 | 0 | 0 | 5 | 373 | 4 | 6 |
| wf-05-cursor-composer25high | 1 | 1 | 1 | 12 | 4205 | 73 | 5 | 11 | 0 | 0 | 4 | 234 | 1 | 14 |
| wf-05-cursor-grok47medmedium | 1 | 1 | 1 | 15 | 5234 | 122 | 4 | 11 | 0 | 0 | 6 | 249 | 1 | 37 |
| wf-06-claude-claudehaiku55medium | 1 | 1 | 1 | 0 | 2510 | 39 | 4 | 0 | 0 | 0 | 7 | 418 | 0 | 5 |
| wf-06-cursor-composer25high | 1 | 1 | 1 | 0 | 3527 | 69 | 5 | 11 | 0 | 0 | 12 | 588 | 2 | 17 |
| wf-06-cursor-grok47medmedium | 1 | 1 | 1 | 7 | 5100 | 84 | 5 | 15 | 0 | 0 | 6 | 392 | 1 | 32 |
| wf-07-claude-claudehaiku55medium | 1 | 1 | 1 | 0 | 2307 | 44 | 2 | 12 | 0 | 0 | 7 | 385 | 2 | 8 |
| wf-07-cursor-grok47medmedium | 1 | 1 | 1 | 0 | 1969 | 31 | 1 | 8 | 0 | 0 | 5 | 328 | 1 | 31 |
| wf-08-claude-claudehaiku55medium | 1 | 1 | 1 | 0 | 4772 | 86 | 6 | 3 | 0 | 0 | 14 | 795 | 1 | 7 |
| wf-08-cursor-grok47medmedium | 1 | 1 | 1 | 6 | 1861 | 34 | 2 | 3 | 0 | 0 | 3 | 155 | 0 | 31 |
| wf-09-claude-claudehaiku55high | 1 | 1 | 1 | 0 | 4437 | 75 | 0 | 14 | 0 | 0 | 13 | 740 | 2 | 14 |
| wf-09-claude-claudehaiku55low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | — | — | — | 3 |
| wf-09-claude-claudehaiku55medium | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 7 | 5 |
| wf-09-claude-claudesonnet55high | 1 | 1 | 3 | 0 | 11102 | 158 | 6 | 26 | 0 | 0 | 16 | 1110 | 3 | 13 |
| wf-09-claude-claudesonnet55low | 1 | 1 | 1 | 0 | 430 | 4 | 0 | 9 | 0 | 0 | 1 | 72 | 2 | 2 |
| wf-09-claude-claudesonnet55medium | 1 | 1 | 1 | 0 | 1458 | 23 | 1 | 11 | 0 | 0 | 4 | 243 | 2 | 5 |
| wf-10-claude-claudehaiku55high | 1 | 1 | 2 | 0 | 6710 | 176 | 5 | 50 | 0 | 0 | 22 | 839 | 6 | 14 |
| wf-10-claude-claudehaiku55low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 16 | 7 | 0 | — | — | — | 5 |
| wf-10-claude-claudehaiku55medium | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 21 | 0 | 0 | 0 | 0 | 11 | 7 |
| wf-10-claude-claudesonnet55low | 1 | 1 | 1 | 0 | 541 | 4 | 0 | 8 | 0 | 0 | 1 | 90 | 1 | 3 |
| wf-10-claude-claudesonnet55medium | 1 | 1 | 4 | 0 | 1462 | 27 | 0 | 28 | 0 | 0 | 2 | 122 | 2 | 5 |

## Failed / skipped

- **discover:** SKIP_INELIGIBLE: 1794050603-wf-agentstream-wf-01-cursor-gpt56lunamedmediumfast: missing tied-project/requirements.yaml
- **discover:** SKIP_INELIGIBLE: 1794343547-wf-agentstream-wf-07-claude-claudehaiku55medium: missing tied-project/requirements.yaml

---

**Proof boundary:** Read-only size evidence from subject repo; counts and hashes do not prove REQ satisfaction, test passage, checklist gates, or trial grade.
