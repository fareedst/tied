# Project size comparison (facilitator)

**Generated:** 2026-11-10T17:00:25.579Z
**Discover parent:** `/Users/fareed/Documents/dev/test`
**Pattern (substring):** `wf-agentstream`

Descriptive cohort evidence only — not grades or REQ status.

## Column definitions

Three layers: **atoms** (agreement footprint), **operational intent** (IMPL pseudo-code mass), **proof facets** (tests and evidence files). See [catalog-tied-size-and-trial-statistics.md](../../../docs/demos/catalog-tied-size-and-trial-statistics.md).

| Column | Layer | Definition |
| --- | --- | --- |
| **label** | — | Discover basename (disposable client dirname, often `{epoch}-wf-agentstream-…`). |
| **ok** | — | Receipt `ok`: snapshot builder finished without fatal error (not workflow pass/fail). |
| **repo (tail)** | — | Last three path segments of absolute `repo_root`. |
| **REQ** | atoms | Count of REQ tokens in `tied-project/requirements.yaml` index. |
| **ARCH** | atoms | Count of ARCH tokens in `tied-project/architecture-decisions.yaml` index. |
| **IMPL** | atoms | Count of IMPL tokens in `tied-project/implementation-decisions.yaml` index. |
| **vocab** | atoms | Rows in client vocab preferred-term tables under `tied-project/vocab/`. |
| **applied_lines** | operational intent | Non-template pseudo-code lines across merged `IMPL-*-pseudocode.md` sidecars (gross minus template overlap). |
| **applied_utf8** | operational intent | `applied_utf8_bytes`: UTF-8 byte length of trimmed non-empty lines minus template overlap bytes. |
| **procedures** | operational intent | Analyzer procedure count in pseudo-code (`procedure_count`). |
| **oi_hash** | operational intent | First 8 hex chars of `hashes.operational_intent_hash` (full pseudo-code body hash; changes when sidecars change). |
| **unit** | proof facets | Unit test **cases** (`node:test` `it`/`test` per file) under subject `src/`. Receipt `validator_version` ≥ 1.1.0. |
| **comp** | proof facets | Composition test **cases** per classified file (same counting rule). |
| **e2e** | proof facets | E2E test **cases** per classified file (same counting rule). |
| **verify_ev** | proof facets | Count of `*consistency*.json` evidence files under `tied-project/working/**/evidence/`. |
| **oi/atom** | cross-layer | `operational_intent_per_atom`: applied_lines ÷ (vocab + REQ + ARCH + IMPL + optional corpus nodes). Descriptive ratio only. |
| **utf8/atom** | cross-layer | `operational_intent_utf8_per_atom`: applied_utf8_bytes ÷ same atom denominator. |
| **pf/atom** | cross-layer | `proof_facets_per_atom`: (unit + comp + e2e + binding-inventory **cases**) ÷ same atom denominator. Pre-1.1.0 receipts counted **files**. |

Expanded table (`--verbose-table`): **corpus_nodes** / **corpus_edges** (corpus graph), **gross_lines** / **parse_nodes** / **sidecars** (operational intent), **binding_inv** (binding-inventory-related tests).

## Summary

| label | ok | repo (tail) | REQ | ARCH | IMPL | vocab | applied_lines | applied_utf8 | procedures | oi_hash | unit | comp | e2e | verify_ev | oi/atom | utf8/atom | pf/atom |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1794289703-wf-agentstream-wf-06-cursor-composer25high | yes | dev/test/1794289703-wf-agentstream-wf-06-cursor-composer25high | 1 | 1 | 1 | 0 | 69 | 3527 | 5 | 86087f5c | 11 | 0 | 0 | 0 | 11.500 | 587.833 | 1.833 |
| 1794289303-wf-agentstream-wf-02-cursor-grok47medmedium | yes | dev/test/1794289303-wf-agentstream-wf-02-cursor-grok47medmedium | 1 | 1 | 1 | 8 | 65 | 2857 | 3 | d214effd | 9 | 0 | 0 | 0 | 4.643 | 204.071 | 0.643 |
| 1794288846-wf-agentstream-wf-05-cursor-composer25high | yes | dev/test/1794288846-wf-agentstream-wf-05-cursor-composer25high | 1 | 1 | 1 | 12 | 73 | 4205 | 5 | 706c3a57 | 11 | 0 | 0 | 0 | 4.056 | 233.611 | 0.611 |
| 1794288051-wf-agentstream-wf-04-cursor-composer25high | yes | dev/test/1794288051-wf-agentstream-wf-04-cursor-composer25high | 1 | 1 | 1 | 0 | 39 | 2664 | 4 | 3d22fb5c | 8 | 0 | 0 | 0 | 6.500 | 444.000 | 1.333 |
| 1794287344-wf-agentstream-wf-01-cursor-grok47medmedium | yes | dev/test/1794287344-wf-agentstream-wf-01-cursor-grok47medmedium | 1 | 1 | 1 | 0 | 105 | 4847 | 4 | 236bf3fe | 24 | 0 | 0 | 0 | 17.500 | 807.833 | 4.000 |
| 1794287063-wf-agentstream-wf-03-cursor-composer25high | yes | dev/test/1794287063-wf-agentstream-wf-03-cursor-composer25high | 1 | 1 | 1 | 0 | 47 | 2450 | 5 | 287aa2fb | 4 | 0 | 0 | 0 | 7.833 | 408.333 | 0.667 |
| 1794286175-wf-agentstream-wf-02-cursor-composer25high | yes | dev/test/1794286175-wf-agentstream-wf-02-cursor-composer25high | 1 | 1 | 2 | 0 | 50 | 2576 | 4 | 199aebfc | 9 | 0 | 0 | 0 | 6.250 | 322.000 | 1.125 |
| 1794285506-wf-agentstream-wf-01-cursor-composer25high | yes | dev/test/1794285506-wf-agentstream-wf-01-cursor-composer25high | 1 | 1 | 1 | 0 | 50 | 2126 | 4 | e1fa3466 | 12 | 0 | 0 | 0 | 8.333 | 354.333 | 2.000 |
| 1794264348-wf-agentstream-wf-03-cursor-composer25high | yes | dev/test/1794264348-wf-agentstream-wf-03-cursor-composer25high | 1 | 1 | 1 | 0 | 47 | 2450 | 5 | 287aa2fb | 5 | 0 | 0 | 0 | 7.833 | 408.333 | 0.833 |
| 1794263616-wf-agentstream-wf-03-cursor-composer25medium | yes | dev/test/1794263616-wf-agentstream-wf-03-cursor-composer25medium | 1 | 1 | 1 | 0 | 93 | 4811 | 7 | f33d5973 | 8 | 0 | 0 | 0 | 15.500 | 801.833 | 1.333 |
| 1794261371-wf-agentstream-wf-01-cursor-lunalow | yes | dev/test/1794261371-wf-agentstream-wf-01-cursor-lunalow | 1 | 1 | 1 | 0 | 12 | 879 | 1 | 7dce8f26 | 4 | 0 | 0 | 0 | 2.000 | 146.500 | 0.667 |
| 1794261316-wf-agentstream-wf-01-cursor-lunalow | yes | dev/test/1794261316-wf-agentstream-wf-01-cursor-lunalow | 1 | 0 | 0 | 0 | 0 | 0 | 0 | e3b0c442 | 3 | 0 | 0 | 0 | 0.000 | 0.000 | 1.500 |
| 1794261284-wf-agentstream-wf-01-cursor-lunalow | yes | dev/test/1794261284-wf-agentstream-wf-01-cursor-lunalow | 1 | 1 | 1 | 0 | 15 | 1329 | 1 | f6fdc2ae | 5 | 0 | 0 | 0 | 2.500 | 221.500 | 0.833 |
| 1794261164-wf-agentstream-wf-01-cursor-lunalow | yes | dev/test/1794261164-wf-agentstream-wf-01-cursor-lunalow | 1 | 0 | 0 | 0 | 0 | 0 | 0 | e3b0c442 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |
| 1794260880-wf-agentstream-wf-01-cursor-lunalow | yes | dev/test/1794260880-wf-agentstream-wf-01-cursor-lunalow | 0 | 0 | 0 | 0 | 0 | 0 | 0 | e3b0c442 | 4 | 0 | 0 | 0 | — | — | — |
| 1794259987-wf-agentstream-wf-01-cursor-lunalowmedium | yes | dev/test/1794259987-wf-agentstream-wf-01-cursor-lunalowmedium | 1 | 1 | 1 | 0 | 74 | 4076 | 5 | 19a8f7a5 | 4 | 0 | 0 | 0 | 12.333 | 679.333 | 0.667 |
| 1794259796-wf-agentstream-wf-01-cursor-lunalowmedium | yes | dev/test/1794259796-wf-agentstream-wf-01-cursor-lunalowmedium | 1 | 1 | 1 | 0 | 57 | 2762 | 0 | ce3274d7 | 6 | 0 | 0 | 0 | 9.500 | 460.333 | 1.000 |
| 1794259664-wf-agentstream-wf-01-cursor-lunalowmedium | yes | dev/test/1794259664-wf-agentstream-wf-01-cursor-lunalowmedium | 1 | 1 | 1 | 0 | 53 | 2715 | 0 | 31f42574 | 3 | 0 | 0 | 0 | 8.833 | 452.500 | 0.500 |
| 1794259573-wf-agentstream-wf-01-cursor-lunalowmedium | yes | dev/test/1794259573-wf-agentstream-wf-01-cursor-lunalowmedium | 1 | 1 | 1 | 0 | 1 | 1622 | 0 | ae1f835c | 5 | 0 | 0 | 0 | 0.167 | 270.333 | 0.833 |
| 1794259375-wf-agentstream-wf-01-cursor-lunalowmedium | yes | dev/test/1794259375-wf-agentstream-wf-01-cursor-lunalowmedium | 1 | 1 | 1 | 0 | 92 | 4913 | 5 | 23235406 | 6 | 0 | 0 | 0 | 15.333 | 818.833 | 1.000 |
| 1794256930-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794256930-wf-agentstream-wf-01-cursor-composer25medium | 1 | 1 | 1 | 0 | 43 | 1585 | 5 | a5c55fd7 | 10 | 0 | 0 | 0 | 7.167 | 264.167 | 1.667 |
| 1794256625-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794256625-wf-agentstream-wf-01-cursor-composer25medium | 1 | 1 | 1 | 0 | 70 | 3709 | 5 | 7d2ffce1 | 10 | 0 | 0 | 0 | 11.667 | 618.167 | 1.667 |
| 1794256511-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794256511-wf-agentstream-wf-01-cursor-composer25medium | 1 | 1 | 1 | 0 | 60 | 3251 | 4 | 245c3ab4 | 7 | 0 | 0 | 0 | 10.000 | 541.833 | 1.167 |
| 1794256441-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794256441-wf-agentstream-wf-01-cursor-composer25medium | 1 | 1 | 1 | 0 | 63 | 3351 | 4 | 551ea5a8 | 7 | 0 | 0 | 0 | 10.500 | 558.500 | 1.167 |
| 1794256180-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794256180-wf-agentstream-wf-01-cursor-composer25medium | 1 | 1 | 1 | 0 | 52 | 2522 | 4 | 0af25b80 | 10 | 0 | 0 | 0 | 8.667 | 420.333 | 1.667 |
| 1794255744-wf-agentstream-wf-02-claude-haiku55medium | yes | dev/test/1794255744-wf-agentstream-wf-02-claude-haiku55medium | 1 | 2 | 2 | 0 | 36 | 2156 | 2 | 09162aa4 | 11 | 0 | 0 | 0 | 3.600 | 215.600 | 1.100 |
| 1794255679-wf-agentstream-wf-02-cursor-lunalowmedium | yes | dev/test/1794255679-wf-agentstream-wf-02-cursor-lunalowmedium | 1 | 1 | 1 | 0 | 40 | 2741 | 3 | 25cd780f | 6 | 0 | 0 | 0 | 6.667 | 456.833 | 1.000 |
| 1794250240-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794250240-wf-agentstream-wf-01-cursor-composer25medium | 1 | 0 | 0 | 0 | 0 | 0 | 0 | e3b0c442 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |
| 1794250166-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794250166-wf-agentstream-wf-01-cursor-composer25medium | 1 | 0 | 0 | 0 | 0 | 0 | 0 | e3b0c442 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |
| 1794249984-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794249984-wf-agentstream-wf-01-cursor-composer25medium | 1 | 1 | 1 | 0 | 59 | 3179 | 5 | e48d5d73 | 0 | 0 | 0 | 0 | 9.833 | 529.833 | 0.000 |
| 1794249821-wf-agentstream-wf-01-cursor-composer25medium | yes | dev/test/1794249821-wf-agentstream-wf-01-cursor-composer25medium | 1 | 1 | 1 | 0 | 54 | 2739 | 4 | b9fc19e0 | 10 | 0 | 0 | 0 | 9.000 | 456.500 | 1.667 |
| 1794249088-wf-agentstream-wf-01-claude-haiku55medium | yes | dev/test/1794249088-wf-agentstream-wf-01-claude-haiku55medium | 1 | 1 | 1 | 0 | 101 | 5494 | 4 | 81d90ec0 | 23 | 0 | 0 | 1 | 16.833 | 915.667 | 3.833 |
| 1794246289-wf-agentstream-wf-01-cursor-composer25 | yes | dev/test/1794246289-wf-agentstream-wf-01-cursor-composer25 | 1 | 1 | 1 | 0 | 98 | 3689 | 4 | 1dfbad2f | 12 | 0 | 0 | 0 | 16.333 | 614.833 | 2.000 |
| 1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow | yes | dev/test/1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow | 1 | 0 | 0 | 0 | 0 | 0 | 0 | e3b0c442 | 2 | 0 | 0 | 0 | 0.000 | 0.000 | 1.000 |
| 1794211741-wf-agentstream-wf-08-cursor-composer25 | yes | dev/test/1794211741-wf-agentstream-wf-08-cursor-composer25 | 1 | 1 | 1 | 0 | 44 | 2496 | 2 | 26d99ad4 | 4 | 0 | 0 | 0 | 7.333 | 416.000 | 0.667 |
| 1794210943-wf-agentstream-wf-07-cursor-composer25 | yes | dev/test/1794210943-wf-agentstream-wf-07-cursor-composer25 | 1 | 1 | 1 | 0 | 28 | 1771 | 2 | 14a6f435 | 8 | 0 | 0 | 0 | 4.667 | 295.167 | 1.333 |
| 1794210060-wf-agentstream-wf-06-cursor-composer25 | yes | dev/test/1794210060-wf-agentstream-wf-06-cursor-composer25 | 1 | 1 | 1 | 0 | 78 | 3898 | 7 | 789d702a | 11 | 0 | 0 | 0 | 13.000 | 649.667 | 1.833 |
| 1794209213-wf-agentstream-wf-05-cursor-composer25 | yes | dev/test/1794209213-wf-agentstream-wf-05-cursor-composer25 | 1 | 1 | 1 | 12 | 69 | 4055 | 5 | d715ca36 | 9 | 0 | 0 | 0 | 3.833 | 225.278 | 0.500 |
| 1794208361-wf-agentstream-wf-04-cursor-composer25 | yes | dev/test/1794208361-wf-agentstream-wf-04-cursor-composer25 | 1 | 1 | 1 | 0 | 39 | 2645 | 4 | c2b9c4c2 | 8 | 0 | 0 | 0 | 6.500 | 440.833 | 1.333 |
| 1794207497-wf-agentstream-wf-03-cursor-composer25 | yes | dev/test/1794207497-wf-agentstream-wf-03-cursor-composer25 | 1 | 1 | 1 | 8 | 91 | 4692 | 7 | 7f5b7cf4 | 8 | 0 | 0 | 0 | 6.500 | 335.143 | 0.571 |
| 1794206410-wf-agentstream-wf-02-cursor-composer25 | yes | dev/test/1794206410-wf-agentstream-wf-02-cursor-composer25 | 1 | 1 | 1 | 0 | 46 | 2823 | 3 | 7f607e03 | 10 | 0 | 0 | 0 | 7.667 | 470.500 | 1.667 |
| 1794205559-wf-agentstream-wf-01-cursor-composer25 | yes | dev/test/1794205559-wf-agentstream-wf-01-cursor-composer25 | 1 | 1 | 1 | 0 | 98 | 3689 | 4 | 1dfbad2f | 12 | 0 | 0 | 0 | 16.333 | 614.833 | 2.000 |
| 1794202372-wf-agentstream-wf-08-cursor-grok47med | yes | dev/test/1794202372-wf-agentstream-wf-08-cursor-grok47med | 1 | 1 | 1 | 9 | 39 | 2265 | 2 | 54c7d74d | 5 | 0 | 0 | 0 | 2.600 | 151.000 | 0.333 |
| 1794200222-wf-agentstream-wf-07-cursor-grok47med | yes | dev/test/1794200222-wf-agentstream-wf-07-cursor-grok47med | 1 | 1 | 1 | 11 | 28 | 2092 | 1 | a6dddfe1 | 8 | 0 | 0 | 0 | 1.647 | 123.059 | 0.471 |
| 1794197658-wf-agentstream-wf-06-cursor-grok47med | yes | dev/test/1794197658-wf-agentstream-wf-06-cursor-grok47med | 1 | 1 | 1 | 10 | 46 | 2807 | 2 | db7d197f | 5 | 0 | 0 | 0 | 2.875 | 175.438 | 0.313 |
| 1794195336-wf-agentstream-wf-05-cursor-grok47med | yes | dev/test/1794195336-wf-agentstream-wf-05-cursor-grok47med | 1 | 1 | 1 | 16 | 95 | 3976 | 2 | 0df007db | 13 | 0 | 0 | 0 | 4.318 | 180.727 | 0.591 |
| 1794191005-wf-agentstream-wf-04-cursor-grok47med | yes | dev/test/1794191005-wf-agentstream-wf-04-cursor-grok47med | 1 | 1 | 1 | 6 | 87 | 6556 | 5 | eb94f77c | 11 | 0 | 0 | 1 | 7.250 | 546.333 | 0.917 |
| 1794188384-wf-agentstream-wf-03-cursor-grok47med | yes | dev/test/1794188384-wf-agentstream-wf-03-cursor-grok47med | 1 | 1 | 1 | 0 | 87 | 4287 | 7 | bae2ed53 | 9 | 0 | 0 | 0 | 14.500 | 714.500 | 1.500 |
| 1794185608-wf-agentstream-wf-03-cursor-grok47med | yes | dev/test/1794185608-wf-agentstream-wf-03-cursor-grok47med | 1 | 0 | 0 | 12 | 0 | 0 | 0 | e3b0c442 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |
| 1794183415-wf-agentstream-wf-02-cursor-grok47med | yes | dev/test/1794183415-wf-agentstream-wf-02-cursor-grok47med | 1 | 1 | 1 | 5 | 55 | 2411 | 2 | 0b83cad5 | 8 | 0 | 0 | 0 | 5.000 | 219.182 | 0.727 |

## Failed / skipped

- **discover:** SKIP_INELIGIBLE: 1794050603-wf-agentstream-wf-01-cursor-gpt56lunamedmediumfast: missing tied-project/requirements.yaml

---

**Proof boundary:** Read-only size evidence from subject repo; counts and hashes do not prove REQ satisfaction, test passage, checklist gates, or trial grade.
