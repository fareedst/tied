# Test strategy — REQ-WF_TRIAL_MODEL_EFFORT

**Phase:** refine-plan **phase 3** (design only). Phases 1–2 tests remain green baseline until RED lands.

## TDD order (build-plan phase 3)

1. LEAP IMPL pseudo-code + REQ/ARCH **SC-CURSOR-SLUG**  
2. **RED** slug rewrite tests + optional `workflow_trial_range` usage/diagnostic tests  
3. **GREEN** `model-effort.ts` + `build-commands.sh`  
4. Oracle update if default cursor dry-run argv changes  
5. `tied_validate_consistency` + verification manifest append  

## Unit (CI — required, phase 3)

| Case | Location | Pass threshold |
| --- | --- | --- |
| Slug tier replace | `model-effort.test.ts` | `grok-4.7-low-fast` + `medium` → `grok-4.7-medium-fast` |
| Modifier preserve | Same | `claude-opus-5-thinking-high` + `max` → `claude-opus-5-thinking-max` |
| Idempotent tier | Same | `gpt-5.6-luna-low-fast` + `low` → unchanged |
| Composer blocklist | Same | `composer-2.5-fast` + `medium` → unchanged |
| xhigh alias | Same | `gpt-5.5-high-fast` + `xhigh` → `gpt-5.5-extra-high-fast` |
| Opt-out | Same | `AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT=0` → unchanged base slug |
| Auto unchanged | Same | `Auto` + effort → still `Auto` |
| Cursor argv effort | `cursor-agent-argv.test.ts` | `--model` is catalog slug; no `[effort=`; no `--effort` |
| approve-mcps / add-dir | `cursor-agent-argv.test.ts` | phase 2 cases unchanged |
| Claude regression | `claude-agent-argv.test.ts` | `--effort` unchanged |

## Composition (CI)

| Case | Pass threshold |
| --- | --- |
| Shell bootstrap | `workflow-trial-agentstream-sh.test.mjs` green (extend if usage/diagnostic contracted) |
| **Range usage** | Sourced `workflow_trial_range` no-args → stderr mentions Cursor slug + example (optional explicit test in bootstrap) |
| **Range warn** | `workflow_trial_range cursor composer-2.5-fast cfg medium 1 1 true` (or echo_exec) → one composer DIAGNOSTIC (optional) |
| Four-phase shell | `run-traditional-four-phase-agentstream-sh.test.mjs` green |
| Agentstream package | `npm test -w @tied/agentstream` green |
| Parity oracles | Update if cursor `command:` lines change |

## Manual (deferred)

| Case | Notes |
| --- | --- |
| Dry-run spot-check | `workflow_trial_range cursor gpt-5.6-luna-low-fast luna-low medium 1 1 echo_exec --dry-run` — `--model` shows `…-medium-fast` |
| Live cursor cell | Non-composer slug + `MODEL_EFFORT`; confirm DEBUG slug applied |

## Out of scope (phase 3)

- Full WF-01…08 matrix rerun  
- Changing range positional signature  

## Verification manifest

**Phase 3 (build-plan close-out):**

```text
cd mcp-server/packages/agentstream && npx tsc && npm test
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
node --test tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs
```
