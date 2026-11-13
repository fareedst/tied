# [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] [ARCH-TIED_HARNESS_MODEL_EVAL_PLATFORM] [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] — harness-eval M1 store, adapters, import CLI.

Grammar-Version: v2

## RESOLVE_HARNESS_EVAL_STORE_ROOT

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] [ARCH-TIED_HARNESS_MODEL_EVAL_PLATFORM] [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] D-STORE-ROOT.
- Contract:
  - INPUT: cli --store?, env HARNESS_EVAL_STORE, env TIED_STORE_ROOT
  - PRE: none
  - OUTPUT: absolute store_root
  - POST: raw/ subdirectory creatable under store_root
  - DATA: default `{TIED_STORE_ROOT}/tied-bundle/reports/harness-eval`
  - CONTROL: cli flag beats env beats default
  - EFFECTS: mkdir -p store_root/raw
  - FAILURE_MODES: unwritable path → throw

## PARSE_CURSOR_STREAM_JSON_FILE

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-01; D-PARSER-DUP.
- Contract:
  - INPUT: NDJSON file path
  - PRE: readable file
  - OUTPUT: token_observation[] (empty when no usage)
  - POST: never fabricate token counts; origin_id from uuid/request_id
  - DATA: type=result lines with usage object only
  - CONTROL: skip missing usage and truncated JSON lines
  - EFFECTS: none
  - FAILURE_MODES: truncated final line → skip partial line

## PARSE_CLAUDE_STREAM_JSON_FILE

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-02.
- Contract:
  - INPUT: NDJSON file path
  - PRE: readable file
  - OUTPUT: single cumulative snapshot observation per file
  - POST: max-merge usage across result events (resume cumulative)
  - DATA: Claude result.usage cumulative fields
  - CONTROL: last result event wins per-field max
  - EFFECTS: none
  - FAILURE_MODES: no result with usage → empty output

## ACCOUNT_TOKEN_OBSERVATIONS

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-04.
- Contract:
  - INPUT: observations[] or cumulative snapshots[]
  - PRE: trial_id known
  - OUTPUT: trial_token_summary
  - POST: reasoning_tokens ⊄ output_tokens → completeness incomplete, totals null
  - DATA: nullable per-category token fields
  - CONTROL: cursor sums observations; claude maxes snapshots
  - EFFECTS: none
  - FAILURE_MODES: overlapping categories → incomplete flag

## INGEST_TRIAL_EVENTS

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-03.
- Contract:
  - INPUT: trial_id, observations[], open EvalDatabase
  - PRE: schema v1 migrated
  - OUTPUT: rows_inserted count
  - POST: duplicate origin_id inserts ignored
  - DATA: token_observations.origin_id UNIQUE
  - CONTROL: INSERT OR IGNORE
  - EFFECTS: append imports.jsonl receipt line
  - FAILURE_MODES: sqlite locked → throw

## IMPORT_WF_CLIENT_MANIFEST

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-06; D-WF-MANIFEST-ONLY.
- Contract:
  - INPUT: client_root, trial_id, optional jsonl paths[]
  - PRE: wf-trial-orchestrator-run.v1.json under client tied-project/working path
  - OUTPUT: trial row + optional observations
  - POST: manifest-only leaves token columns null; fingerprint stored
  - DATA: manifest harness, model_slug, wall_clock_ms
  - CONTROL: jsonl optional via repeated --jsonl
  - DATA_TRANSITION: manifest → trials row; jsonl → observations
  - EFFECTS: writes eval.sqlite and imports.jsonl
  - FAILURE_MODES: missing manifest → throw

## VALIDATE_SUITE_INTEGRITY

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-05.
- Contract:
  - INPUT: suite YAML document
  - PRE: schema_version harness-eval-suite-v1
  - OUTPUT: ok boolean / CLI exit code
  - POST: content_integrity_sha256 matches body hash
  - DATA: scenarios array in integrity body
  - CONTROL: exclude content_integrity_sha256 from hash input
  - EFFECTS: none
  - FAILURE_MODES: mismatch → exit 1

## QUERY_CROSS_HARNESS_SUMMARY

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-08.
- Contract:
  - INPUT: store_root
  - PRE: eval.sqlite exists
  - OUTPUT: JSON summary by harness
  - POST: aggregates trials without requiring raw jsonl
  - DATA: trials table harness + token columns
  - CONTROL: read-only query
  - EFFECTS: none

## DIAGNOSTICS_FIXTURE_COVERAGE

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-07.
- Contract:
  - INPUT: fixtures/stream-json directory
  - PRE: package fixtures shipped
  - OUTPUT: harness label → fixture id list
  - POST: covers F-19 matrix ids
  - DATA: fixture filename stems
  - CONTROL: static harness map per fixture id
  - EFFECTS: readdir fixtures dir
  - FAILURE_MODES: missing dir → empty report

## LOAD_LIST_PRICE_CATALOG

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M2-01; F-11.
- Contract:
  - INPUT: catalog YAML path (default docs/demos/harness-eval/pricing/list-price-v1.yaml)
  - PRE: schema_version harness-eval-pricing-v1
  - OUTPUT: PricingCatalog { catalog_revision, rates by model_slug }
  - POST: missing model entry → lookup returns null rates (not zero)
  - DATA: input_usd_per_mtok, output_usd_per_mtok per model_slug
  - CONTROL: explicit catalog_revision in fingerprint pricing_mode
  - FAILURE_MODES: invalid schema → throw

## ESTIMATE_HARNESS_LIST_PRICE

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M2-03; F-09.
- Contract:
  - INPUT: trial token summary + catalog rates
  - PRE: completeness === complete and input/output token counts non-null
  - OUTPUT: harness_estimated_cost USD number or null
  - POST: never fabricate cost when tokens or rates missing
  - DATA: nullable cost columns on trials row
  - CONTROL: normalized_list_price_cost mirrors harness_estimated_cost in M2
  - EFFECTS: UPDATE trials cost fields on import

## MIGRATE_EVAL_SCHEMA_V2

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M2-02.
- Contract:
  - INPUT: open EvalDatabase
  - PRE: schema_version 1 or fresh
  - OUTPUT: schema_version 2
  - POST: ALTER trials ADD model_slug, pricing_catalog_revision, harness_estimated_cost, normalized_list_price_cost
  - DATA: existing M1 trial rows unchanged except new null columns
  - FAILURE_MODES: version > supported → throw

## RUN_TRIAL_VERIFIERS

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M2-04; F-12.
- Contract:
  - INPUT: suite doc, trial_id, store database
  - PRE: scenario acceptance_checks defined
  - OUTPUT: verifier results[] with pass/fail
  - POST: token_present fails when observation_count=0 even if exit_code=0
  - DATA: acceptance check types token_present | exit_success | manual
  - CONTROL: manual checks skipped in M2 machine pass
  - FAILURE_MODES: unknown trial → fail closed

## REPORT_COHORT_BY_WF_ID

- [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M2-05; F-14.
- Contract:
  - INPUT: store database
  - PRE: eval.sqlite schema v2
  - OUTPUT: JSON cohort rows grouped by wf_id and harness
  - POST: no facilitator grades; proof boundary D-PROOF-BOUNDARY
  - DATA: tokens, wall_clock_ms, harness_estimated_cost nullable
  - CONTROL: read-only
