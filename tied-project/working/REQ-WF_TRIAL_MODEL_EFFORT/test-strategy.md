# Test strategy — REQ-WF_TRIAL_MODEL_EFFORT

**Phase:** refine-plan phase 2 (design only). Phase 1 tests remain green baseline.

## TDD order (build-plan phase 2)

1. LEAP IMPL pseudo-code + REQ/ARCH satisfaction criteria  
2. **RED** cursor bracket + `cursor-agent-argv` tests  
3. **GREEN** implementation  
4. Oracle update if default cursor dry-run argv changes  
5. `tied_validate_consistency` + verification manifest append  

## Unit (CI — required, phase 2)

| Case | Location | Pass threshold |
| --- | --- | --- |
| Bracket append | `model-effort.test.ts` | `composer-2.5-fast` + `medium` → `…[effort=medium]` |
| Bracket merge | Same | `gpt-5[context=1m]` + `high` → `effort=high` preserved with `context=1m` |
| Bracket opt-out | Same | `AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT=0` → unchanged base slug |
| Auto unchanged | Same | `Auto` + effort → still `Auto` |
| Overrides env | Same | `AGENTSTREAM_CURSOR_MODEL_OVERRIDES=fast=false` merges into bracket |
| Cursor argv effort | `cursor-agent-argv.test.ts` or executor test | `agentArgv` cursor harness: `--model` contains `effort=`; no `--effort` flag |
| approve-mcps default | `cursor-agent-argv.test.ts` | argv contains `--approve-mcps`; absent when `AGENTSTREAM_CURSOR_KEEP_MCPS=1` |
| add-dir store | `cursor-agent-argv.test.ts` | temp client layout → `--add-dir` store root |
| auto-review off | Same | no `--auto-review` unless env `=1` |
| Claude regression | `claude-agent-argv.test.ts` | `--effort` unchanged |

## Composition (CI)

| Case | Pass threshold |
| --- | --- |
| Shell bootstrap | `workflow-trial-agentstream-sh.test.mjs` unchanged green |
| Four-phase shell | `run-traditional-four-phase-agentstream-sh.test.mjs` green |
| Agentstream package | `npm test -w @tied/agentstream` green |
| Parity oracles | `parity.test.ts` — update frozen oracle text if default cursor `command:` lines change |

## Manual (deferred)

| Case | Notes |
| --- | --- |
| Dry-run spot-check | `workflow_trial_range cursor … medium … --dry-run` — command line shows bracket model + `--approve-mcps` |
| Live cursor cell | Optional: single wf-NN with `MODEL_EFFORT=medium`; confirm DEBUG bracket + live behavior |

## Out of scope (phase 2)

- Full WF-01…08 matrix rerun  
- Live `--auto-review` A/B performance study  
- Gold client path renames  

## Verification manifest

**Phase 1 (complete):**

```text
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
cd mcp-server/packages/agentstream && npx tsc && npm test
```

**Phase 2 (build-plan close-out):**

```text
cd mcp-server/packages/agentstream && npx tsc && npm test
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
node --test tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs
```
