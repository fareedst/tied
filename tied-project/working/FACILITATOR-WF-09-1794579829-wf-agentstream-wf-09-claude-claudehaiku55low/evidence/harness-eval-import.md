# harness-eval import — `1794579829-wf-agentstream-wf-09-claude-claudehaiku55low`

**date:** 2026-11-13  
**request_token:** REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM (operator smoke)  
**proof boundary:** HMEP metrics are independent of `@record-wf-trial` grades.

## Preconditions

| Field | Value |
| --- | --- |
| Client root | `/Users/fareed/Documents/dev/test/1794579829-wf-agentstream-wf-09-claude-claudehaiku55low` |
| Trial ID | `1794579829-wf-agentstream-wf-09-claude-claudehaiku55low` |
| Store | `$TIED_STORE_ROOT/tied-bundle/reports/harness-eval` |
| Stream-json capture | **None** — no `stream-json/` or post-trial `.jsonl` on client (only checklist `gates/ledger.jsonl`, not usage) |
| `--jsonl` | **Not used** |

## Commands

```bash
export TIED_STORE_ROOT="/Users/fareed/Documents/dev/chatgpt/stdd"
export HARNESS_EVAL_STORE="$TIED_STORE_ROOT/tied-bundle/reports/harness-eval"
CLIENT="/Users/fareed/Documents/dev/test/1794579829-wf-agentstream-wf-09-claude-claudehaiku55low"
TRIAL="1794579829-wf-agentstream-wf-09-claude-claudehaiku55low"

harness-eval events import --wf-client "$CLIENT" --trial-id "$TRIAL" --store "$HARNESS_EVAL_STORE"
harness-eval report cohort --store "$HARNESS_EVAL_STORE"
```

## Import trace

```
TRACE: import wf-client trial_id=1794579829-wf-agentstream-wf-09-claude-claudehaiku55low observations_inserted=0
```

## Trial row (utilization + estimates)

| Field | Value |
| --- | --- |
| `harness` | `claude` |
| `wf_id` | `WF-09` |
| `model_slug` | `claude-haiku-5-5` |
| `wall_clock_ms` | **229000** (~229s; matches orchestrator manifest) |
| `exit_code` | **0** |
| `config_fingerprint` | `28be7a606051d9192d86d530cf5de229ee9b858a30082899df8672fa91b96f93` |
| `input_tokens` | **null** (manifest-only; no JSONL) |
| `output_tokens` | **null** |
| `reasoning_tokens` | **null** |
| `completeness` | **absent** |
| `harness_estimated_cost` | **null** (no complete token usage) |
| `normalized_list_price_cost` | **null** |
| `provider_reported_cost` | **null** |
| `actual_charged_cost` | **null** |

## Next operator step (tokens + list-price estimate)

Capture Claude stream-json after a turn (see [HMEP stream-json evidence](../../../../working/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/evidence/stream-json-capture-import.md)), then re-import:

```bash
harness-eval events import --wf-client "$CLIENT" --trial-id "$TRIAL" \
  --jsonl /path/to/claude-post-trial-capture.jsonl \
  --store "$HARNESS_EVAL_STORE"
```

Re-run is idempotent per `origin_id` for unchanged JSONL lines.
