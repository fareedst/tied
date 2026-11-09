# Build-plan verification — REQ-WF_TRIAL_MODEL_EFFORT (phase 3)

**date:** 2026-11-09

## Commands

```bash
cd mcp-server/packages/agentstream && npx tsc -b
npx tsx --test src/model-effort.test.ts src/cursor-agent-argv.test.ts
```

**Result:** model-effort + cursor-agent-argv — all pass

```bash
export ECHO_EXEC=:
source scripts/build-commands.sh
workflow_trial_range   # usage lines + Cursor slug effort example
workflow_trial_range cursor composer-2.5-fast composer.2.5 medium 1 1  # DIAGNOSTIC once
```

## Touchpoints

| File | Change |
| --- | --- |
| `mcp-server/packages/agentstream/src/model-effort.ts` | Slug tier rewrite; composer blocklist |
| `live-executor.ts` | DEBUG `effort slug applied` |
| `scripts/build-commands.sh` | `workflow_trial_range` usage + composer DIAGNOSTIC |
| `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` | SC-RANGE-USAGE / SC-RANGE-WARN |
| REQ/ARCH/IMPL + vocab + README + CLI guide + help inc | LEAP phase 3 |

## Manual spot-check

```bash
workflow_trial_range cursor gpt-5.6-luna-low-fast luna-low medium 1 1 echo_exec --dry-run
# expect --model gpt-5.6-luna-medium-fast (not [effort=medium])
```
