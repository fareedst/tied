# HMEP import — stream-json (re-import)

**Client:** `1794582335-wf-agentstream-wf-09-claude-claudehaiku55low`  
**Run:** 2026-11-13 facilitator `@record-wf-trial` (manifest-only) · **2026-11-13** store re-import with `--jsonl`

## Commands

```bash
export TIED_STORE_ROOT="/Users/fareed/Documents/dev/chatgpt/stdd"
export HARNESS_EVAL_STORE="$TIED_STORE_ROOT/tied-bundle/reports/harness-eval"
CLIENT="/Users/fareed/Documents/dev/test/1794582335-wf-agentstream-wf-09-claude-claudehaiku55low"
TRIAL="1794582335-wf-agentstream-wf-09-claude-claudehaiku55low"
STREAM="$CLIENT/tied-project/working/wf-trial-orchestrator-run/evidence/stream-json"

harness-eval events import --wf-client "$CLIENT" --trial-id "$TRIAL" --store "$HARNESS_EVAL_STORE" \
  --jsonl "$STREAM/turn-001.jsonl" \
  --jsonl "$STREAM/turn-002.jsonl" \
  --jsonl "$STREAM/turn-003.jsonl" \
  --jsonl "$STREAM/turn-004.jsonl"
```

## Import trace

```
TRACE: import wf-client trial_id=1794582335-wf-agentstream-wf-09-claude-claudehaiku55low observations_inserted=0
```

(`observations_inserted=0` on repeat — idempotent `origin_id`; trial row updated from JSONL.)

## Trial row (`harness-eval report cohort`)

| Field | Value |
| --- | --- |
| `harness` | `claude` |
| `wf_id` | `WF-09` |
| `model_slug` | `claude-haiku-5-5` |
| `wall_clock_ms` | **206000** |
| `exit_code` | **0** |
| `input_tokens` | **32** |
| `output_tokens` | **14424** |
| `reasoning_tokens` | **3731** |
| `completeness` | **complete** |
| `harness_estimated_cost` | **0.057722** (list-price catalog) |
| `normalized_list_price_cost` | **0.057722** |
| `provider_reported_cost` | null |
| `actual_charged_cost` | null |

**Store:** `tied-bundle/reports/harness-eval/eval.sqlite` (local; gitignored).
