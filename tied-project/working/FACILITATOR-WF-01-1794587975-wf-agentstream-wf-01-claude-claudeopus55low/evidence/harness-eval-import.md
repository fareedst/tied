# HMEP import — stream-json

**Client:** `1794587975-wf-agentstream-wf-01-claude-claudeopus55low`  
**Run:** 2026-11-13 sponsor-requested batch import (four-turn `--jsonl`)

## Commands

```bash
export TIED_STORE_ROOT="/Users/fareed/Documents/dev/chatgpt/stdd"
export HARNESS_EVAL_STORE="$TIED_STORE_ROOT/tied-bundle/reports/harness-eval"
CLIENT="/Users/fareed/Documents/dev/test/1794587975-wf-agentstream-wf-01-claude-claudeopus55low"
TRIAL="1794587975-wf-agentstream-wf-01-claude-claudeopus55low"
STREAM="$CLIENT/tied-project/working/wf-trial-orchestrator-run/evidence/stream-json"

node mcp-server/packages/harness-eval/dist/cli/main.js events import --wf-client "$CLIENT" --trial-id "$TRIAL" --store "$HARNESS_EVAL_STORE" \
  --jsonl "$STREAM/turn-001.jsonl" \
  --jsonl "$STREAM/turn-002.jsonl" \
  --jsonl "$STREAM/turn-003.jsonl" \
  --jsonl "$STREAM/turn-004.jsonl"
```

## Import trace

```
TRACE: import wf-client trial_id=1794587975-wf-agentstream-wf-01-claude-claudeopus55low observations_inserted=0
```

## Trial row (`harness-eval report cohort`)

| Field | Value |
| --- | --- |
| `wall_clock_ms` | **391000** |
| `input_tokens` | **52** |
| `output_tokens` | **13574** |
| `reasoning_tokens` | **882** |
| `completeness` | **complete** |
| `harness_estimated_cost` | null (no list-price row for `claude-opus-5-5`) |

**Store:** `tied-bundle/reports/harness-eval/eval.sqlite` (gitignored).
