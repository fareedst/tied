# Stream-json capture + `--jsonl` import (operator)

**request_token:** REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM  
**date:** 2026-11-12  
**criteria:** SC-HMEP-M1-01 (cursor), SC-HMEP-M1-02 (claude)

## Raw store layout

Captures live under:

`tied-bundle/reports/harness-eval/raw/{trial_id}/`

Copies also symlinked in each disposable client:

`tied-project/working/wf-trial-orchestrator-run/evidence/stream-json/`

## Claude (live usage)

| Field | Value |
| --- | --- |
| Disposable client | `/Users/fareed/Documents/dev/test/1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low` |
| Capture file | `raw/.../claude-post-trial-capture.jsonl` |
| Capture command | `claude --print --verbose --output-format stream-json ... --mcp-config .mcp.json -- "<prompt>"` |
| Notes | Claude `--mcp-config` is variadic — use `--` before the prompt positional |

```bash
export TIED_STORE_ROOT="$PWD" HARNESS_EVAL_STORE="$PWD/tied-bundle/reports/harness-eval"
node mcp-server/packages/harness-eval/dist/cli/main.js events import \
  --wf-client "/Users/fareed/Documents/dev/test/1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low" \
  --trial-id "1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low" \
  --jsonl tied-bundle/reports/harness-eval/raw/1794545843-wf-agentstream-wf-meter-01-claude-claudesonnet46low/claude-post-trial-capture.jsonl
```

**Result:** `observations_inserted=1`; summary `input_tokens=3`, `output_tokens=13` (live `type:result` usage).

## Cursor (live stream, no terminal `result` line)

| Field | Value |
| --- | --- |
| Disposable client | `/Users/fareed/Documents/dev/test/1794531738-wf-agentstream-wf-01-cursor-grok47low` |
| Capture file | `raw/.../cursor-post-trial-capture-v3.jsonl` (51 NDJSON lines) |
| CLI exit | `1` (`RetriableError: WritableIterable is closed` on stderr) |
| Import | `observations_inserted=0` — **null tokens preserved** (no `type:result` + `usage` in capture) |

Replay capture:

```bash
node mcp-server/packages/harness-eval/dist/cli/main.js events import \
  --wf-client "/Users/fareed/Documents/dev/test/1794531738-wf-agentstream-wf-01-cursor-grok47low" \
  --trial-id "1794531738-wf-agentstream-wf-01-cursor-grok47low" \
  --jsonl tied-bundle/reports/harness-eval/raw/1794531738-wf-agentstream-wf-01-cursor-grok47low/cursor-post-trial-capture-v3.jsonl
```

## Code fix (same session)

`importWfClient` now **upserts the trial row before** `token_observations` inserts so `--jsonl` import satisfies SQLite FK order.

## Query

```bash
node mcp-server/packages/harness-eval/dist/cli/main.js query summary --store "$HARNESS_EVAL_STORE"
```
