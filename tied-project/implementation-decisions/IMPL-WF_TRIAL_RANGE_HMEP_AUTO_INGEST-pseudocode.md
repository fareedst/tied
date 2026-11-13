# IMPL-WF_TRIAL_RANGE_HMEP_AUTO_INGEST — essence pseudocode

## WF_TRIAL_HMEP_CAPTURE_ENABLED

- [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [ARCH-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [IMPL-WF_TRIAL_RANGE_HMEP_AUTO_INGEST]
- PRE: Node process.env readable
- POST: returns true when (WF_TRIAL_HMEP_CAPTURE or AGENTSTREAM_HMEP_STREAM_CAPTURE) is 1/true and WF_TRIAL_SKIP_HMEP_CAPTURE unset

## RESOLVE_HMEP_STREAM_JSON_PATH

- [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [IMPL-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG]
- INPUT: workspace absolute path, turnIndex integer >= 1
- OUTPUT: `{workspace}/tied-project/working/wf-trial-orchestrator-run/evidence/stream-json/turn-{turnIndex:03d}.jsonl`
- EFFECTS: parent mkdir on first append

## APPEND_HMEP_STREAM_JSON_LINE

- [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [REQ-GOAGENT-AGENT-EXECUTOR] [IMPL-GOAGENT-EXECUTOR]
- PRE: capture enabled; trimmed NDJSON line non-empty
- POST: line appended with newline to resolved path
- FAILURE_MODES: IO errors → DIAGNOSTIC stderr only (no throw)

## WF_TRIAL_RANGE_HMEP_IMPORT_CELL

// leakage-ok: block name references harness-eval events import (HMEP CLI), not host import syntax.

- [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] SC-HMEP-M1-06
- PRE: wf_id WF-NN; WF_TRIAL_HMEP_CAPTURE=1 unless skip
- DATA: disposable_tag from build_wf_trial_disposable_tag; client_root newest `${TIED_TEST_ROOT}/*-${tag}`
- POST: harness-eval events import with manifest + optional --jsonl glob; DIAGNOSTIC observations_inserted
- FAILURE_MODES: missing client/dist → DIAGNOSTIC skip; strict env propagates CLI exit
