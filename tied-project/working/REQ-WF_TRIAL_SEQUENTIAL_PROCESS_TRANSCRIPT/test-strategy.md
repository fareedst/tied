# Test strategy — REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT

**profile_depth:** minimal · **gate_policy:** advisory  
**Tracker slugs (build):** `unit-test-red` → `unit-test-green` → `composition-integration` → `verification-gate`

## Unit — agentstream `emitTurnOperatorLine`

| Case | Setup | Expected | SC | Artifact |
| --- | --- | --- | --- | --- |
| Stdout mirror | Spy `fs.writeSync(1, …)` and `stdoutAcc` | Banner + `session_id=` in accumulator and fd 1 before `runTurn` | SC-WF-SPT-01 | `live-executor-turn-operator.test.ts` |
| Stderr flush | Spy `fs.writeSync(2, …)` call order | fd 2 write completes before turn driver mock proceeds | SC-WF-SPT-02 | same |
| Exit de-dup | EMIT wiring without `stderrAcc +=` for operator lines | Returned `stderr` has zero `^--- turn ` / `^session_id=` operator lines | SC-WF-SPT-03 | same + `assertNoOperatorLinesInStderr` |

Package test glob includes `src/**/*.test.ts` (`package.json`); **130 tests** pass.

## Composition — orchestrator tee

| Case | Action | Expected | SC |
| --- | --- | --- | --- |
| Bootstrap SPT | `workflow-trial-agentstream-sh.test.mjs` source/dist contract | Operator emission API present; ABS+SPT regression | SC-WF-SPT-04 |
| ABS regression | Existing SC-WF-ABS-* cases | Unchanged pass | — |

## Optional — abort classifier stdout (deferred)

Wave 1 keeps SC-WF-ABS-02 on `process.stderr.log` only; live fd 2 EMIT satisfies timing. Add stdout scanner + fixture only if post-SPT disposable runs show a stderr-only gap.

## Commands

```bash
cd mcp-server/packages/agentstream && npm test
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

**Last verified:** 2026-11-12 (refine-plan post-build sync).
