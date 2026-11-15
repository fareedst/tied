# Project size comparison (facilitator)

**Generated:** 2026-11-15T15:43:09.313Z
**Discover parent:** `/Users/fareed/Documents/dev/test`
**Pattern (substring):** `wf-agentstream`

Descriptive cohort size evidence; optional **grades** join from trial readouts (facilitator bands only — not REQ status, not a leaderboard).

## Column definitions

Three layers: **atoms** (agreement footprint), **operational intent** (IMPL pseudo-code mass), **proof facets** (tests and evidence files). See [catalog-tied-size-and-trial-statistics.md](../catalogs/catalog-tied-size-and-trial-statistics.md).

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
| **grades** | — | Facilitator session bands from linked trial readout (`mean · Req/Tr/Ts/Al/Pr/Ch/Ml` via `meanCompactGrades`); keyed by **full discover basename** in `manifest.v1.json`. Not REQ status; not a leaderboard. `—` when readout missing. |

Expanded table (`--verbose-table`): **repo (tail)**, **oi_hash**, **verify_ev** (`*consistency*.json` under `tied-project/working/**/evidence/`), **corpus_nodes** / **corpus_edges**, **gross_lines** / **parse_nodes** / **sidecars**, **binding_inv**. Row set matches Summary (`prepareComparisonSummaryRows`); display **label** uses the same trim rule.

## Summary

Rows after epoch floor (when `summary_epoch_min` > 0), dedupe by display **label** (latest discover epoch), sorted by display label then full basename.

| label | Vocab | REQ | ARCH | IMPL | applied_utf8 | applied_lines | procedures | unit | comp | e2e | utf8/atom | oi/atom | pf/atom | wall_clock | grades |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1794543744-wf-agentstream-wf-meter-99-cursor-composer25 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0 | — |
| 1794545712-wf-agentstream-wf-meter-01-claude-claudesonnet46low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0 | — |
| 1794545758-wf-agentstream-wf-meter-01-claude-claudesonnet46low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0 | — |
| 1794545802-wf-agentstream-wf-meter-01-claude-claudesonnet46low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0 | — |
| 1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | — | — | — | 9 | — |
| wf-01-claude-claudeopus55low | 0 | 1 | 1 | 1 | 505 | 9 | 3 | 8 | 0 | 0 | 84 | 2 | 1 | 7 | 3.80 · A/A/A/A/B+/A/B+ |
| wf-01-claude-claudesonnet55high | 0 | 1 | 1 | 1 | 8544 | 143 | 6 | 23 | 0 | 0 | 1424 | 24 | 4 | 14 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-01-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 845 | 11 | 0 | 7 | 0 | 0 | 141 | 2 | 1 | 4 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-01-cursor-grok47low | 0 | 1 | 1 | 1 | 1490 | 30 | 0 | 7 | 0 | 0 | 248 | 5 | 1 | 13 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-02-claude-claudehaiku55low | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 13 | 1 | 0 | 0 | 0 | 7 | 6 | 3.53 · A-/B+/A/A-/B+/A-/B |
| wf-02-claude-claudeopus55low | 0 | 1 | 1 | 1 | 432 | 5 | 0 | 6 | 1 | 0 | 72 | 1 | 1 | 5 | 3.81 · A/A/A-/A/A-/A/B+ |
| wf-02-claude-claudesonnet55high | 0 | 1 | 1 | 1 | 7272 | 138 | 7 | 55 | 11 | 10 | 1212 | 23 | 13 | 15 | 3.87 · A/A/A/A-/A-/A/A- |
| wf-02-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 361 | 4 | 0 | 10 | 5 | 0 | 60 | 1 | 3 | 5 | 3.87 · A/A/A/A-/A-/A/A- |
| wf-02-cursor-grok47low | 0 | 1 | 1 | 1 | 1373 | 21 | 0 | 0 | 5 | 0 | 229 | 4 | 1 | 15 | 3.81 · A/A/B+/A/A-/A/A- |
| wf-03-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 4 | 8 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-03-claude-claudeopus55low | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 2 | 5 | 3.76 · A/A/B+/A/B+/A/A- |
| wf-03-claude-claudesonnet55high | 0 | 1 | 1 | 4 | 5083 | 101 | 0 | 27 | 16 | 0 | 424 | 8 | 4 | 12 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-03-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 361 | 4 | 0 | 8 | 0 | 0 | 60 | 1 | 1 | 5 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-03-cursor-grok47low | 6 | 1 | 1 | 1 | 841 | 24 | 3 | 1 | 0 | 0 | 70 | 2 | 0 | 10 | 2.51 · B+/D+/B-/B+/C/B-/C+ |
| wf-04-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 12 | 4 | 0 | 0 | 0 | 8 | 9 | 3.87 · A/A/A/A-/A-/A/A- |
| wf-04-claude-claudeopus55low | 0 | 1 | 1 | 1 | 484 | 9 | 1 | 10 | 0 | 0 | 81 | 2 | 2 | 6 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-04-claude-claudesonnet55high | 0 | 1 | 1 | 1 | 11211 | 181 | 7 | 49 | 11 | 0 | 1869 | 30 | 10 | 15 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-04-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 789 | 7 | 0 | 5 | 3 | 0 | 132 | 1 | 1 | 5 | 3.51 · A/A-/B+/A/B+/B/B+ |
| wf-04-cursor-grok47low | 0 | 1 | 1 | 1 | 905 | 14 | 0 | 1 | 0 | 0 | 151 | 2 | 0 | 12 | 3.59 · A-/A/B-/A-/A-/A/B+ |
| wf-05-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 13 | 8 | 3.39 · A-/B+/A/A-/C+/A-/B |
| wf-05-claude-claudeopus55low | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 1 | 7 | 3.91 · A/A/A/A/A-/A/A- |
| wf-05-claude-claudesonnet55high | 0 | 1 | 1 | 3 | 7721 | 123 | 0 | 32 | 14 | 0 | 772 | 12 | 5 | 52 | 3.96 · A/A/A/A/A/A-/A |
| wf-05-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 617 | 8 | 0 | 11 | 0 | 0 | 103 | 1 | 2 | 5 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-05-cursor-grok47low | 0 | 1 | 1 | 1 | 1510 | 19 | 0 | 7 | 0 | 0 | 252 | 3 | 1 | 13 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-06-claude-claudehaiku55medium | 0 | 1 | 1 | 1 | 6068 | 115 | 5 | 17 | 0 | 0 | 1011 | 19 | 3 | 11 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-06-claude-claudeopus55low | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 1 | 6 | 3.91 · A/A/A-/A/A/A/A- |
| wf-06-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 1 | 4 | 3.71 · A/A-/A/A/B+/B+/A- |
| wf-06-cursor-grok47low | 0 | 1 | 1 | 1 | 1642 | 21 | 0 | 3 | 0 | 0 | 274 | 4 | 1 | 16 | 3.77 · A/A/B+/A-/A-/A/A- |
| wf-07-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 7 | 9 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-07-claude-claudeopus55low | 0 | 1 | 1 | 1 | 724 | 14 | 3 | 7 | 0 | 0 | 121 | 2 | 1 | 5 | 3.91 · A/A/A/A/A-/A/A- |
| wf-07-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 805 | 17 | 0 | 13 | 0 | 0 | 134 | 3 | 2 | 4 | 3.71 · A/A-/A/A/B+/B+/A- |
| wf-07-cursor-grok47low | 0 | 1 | 1 | 1 | 1099 | 20 | 0 | 6 | 0 | 0 | 183 | 3 | 1 | 14 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-08-claude-claudehaiku55medium | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 1.14 · C/F/F/F/C+/D/B- |
| wf-08-claude-claudeopus55low | 0 | 1 | 1 | 1 | 244 | 7 | 0 | 5 | 0 | 0 | 41 | 1 | 1 | 4 | 3.33 · A/B+/A-/A/C+/B/B |
| wf-08-claude-claudesonnet55medium | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 1 | 4 | 3.77 · A/A/B+/A-/A-/A/A- |
| wf-08-cursor-grok47low | 0 | 1 | 1 | 1 | 843 | 16 | 0 | 2 | 0 | 0 | 141 | 3 | 0 | 12 | 3.59 · A-/A/B-/A-/A-/A/B+ |
| wf-09-claude-claudehaiku55low | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 5 | 3 | 2.56 · B+/D+/B/B+/C/B-/C+ |
| wf-09-claude-claudeopus55low | 0 | 1 | 1 | 1 | 546 | 8 | 0 | 8 | 0 | 0 | 91 | 1 | 1 | 5 | 3.61 · A-/A/B+/A-/B+/A/B+ |
| wf-09-claude-claudesonnet55low | 0 | 1 | 1 | 1 | 586 | 8 | 0 | 7 | 0 | 0 | 98 | 1 | 1 | 4 | 3.33 · A-/B+/B/B+/B/A-/B+ |
| wf-09-cursor-composer25med | 0 | 1 | 1 | 1 | 665 | 9 | 0 | 8 | 0 | 0 | 111 | 2 | 1 | 12 | 3.87 · A/A/A-/A/A-/A/A- |
| wf-09-cursor-grok47low | 0 | 1 | 1 | 1 | 1090 | 11 | 0 | 4 | 0 | 0 | 182 | 2 | 1 | 12 | 2.56 · B+/D+/B/B+/C/B-/C+ |
| wf-10-cursor-composer25med | 0 | 1 | 1 | 2 | 2014 | 38 | 4 | 18 | 0 | 0 | 252 | 5 | 2 | 12 | 3.83 · A/A-/A-/A-/A-/A/A |

## Failed / skipped

- **discover:** SKIP_INELIGIBLE: 1794050603-wf-agentstream-wf-01-cursor-gpt56lunamedmediumfast: missing tied-project/requirements.yaml
- **discover:** SKIP_INELIGIBLE: 1794343547-wf-agentstream-wf-07-claude-claudehaiku55medium: missing tied-project/requirements.yaml

---

**Proof boundary:** Read-only size evidence from subject repo; counts and hashes do not prove REQ satisfaction, test passage, checklist gates, or trial grade.
