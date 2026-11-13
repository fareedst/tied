# Metering smoke — manifest-only import (operator verified)

**request_token:** REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM  
**sibling:** REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW (`wf-meter-01`)  
**date:** 2026-11-12  
**criterion:** SC-HMEP-M1-06 compose / D-WF-MANIFEST-ONLY

## Disposable client

`/Users/fareed/Documents/dev/test/1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low`

## Commands (stdd repo root)

```bash
export TIED_STORE_ROOT="$PWD"
export HARNESS_EVAL_STORE="$PWD/tied-bundle/reports/harness-eval"
node mcp-server/packages/harness-eval/dist/cli/main.js events import \
  --wf-client "/Users/fareed/Documents/dev/test/1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low" \
  --trial-id "1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low"
```

**Result:** exit 0; `observations_inserted=0` (no `--jsonl`).

## Query summary (excerpt)

- `trial_id`: `1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low`
- `harness`: `claude`
- `wall_clock_ms`: `542000`
- `input_tokens` / `output_tokens`: **null**
- `config_fingerprint`: `c2416fa7a87c3800f99a26244aa8018e6910b7c085ccf8f8813d997b67dc827b`

## Store paths

- `tied-bundle/reports/harness-eval/eval.sqlite`
- `tied-bundle/reports/harness-eval/imports.jsonl`
