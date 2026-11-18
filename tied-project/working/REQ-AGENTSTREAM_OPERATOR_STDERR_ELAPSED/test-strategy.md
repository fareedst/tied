# Test strategy — REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED

**Phase:** refine-plan (design only; no RED files yet).

## TDD order (build-plan)

1. Land REQ/ARCH/IMPL + pseudo-code; `pseudocode_validate`
2. **RED** — `operator-stderr-line.test.ts` + extend shell/agentstream tests
3. **GREEN** — TS module, call-site migration, bash inc + wiring
4. Vocab RECORD + `tied_validate_consistency`

## Unit / composition

| Case | ID | Location | Pass threshold |
| --- | --- | --- | --- |
| Fixed epoch offset 0/1 | T-OSEL-01 | `operator-stderr-line.test.ts` | `0000`/`0001` plain; no double-prefix |
| NO_COLOR vs TTY | T-OSEL-02 | Same | ANSI absent/present on category + offset |
| Dry-run stderr pattern | T-OSEL-03 | Package test against `executeExecutorDryRun` or snapshot | Lines match `/^\d{4} (DEBUG|DIAGNOSTIC):/` |
| Four-phase launch lines | T-OSEL-04 | `run-traditional-four-phase-agentstream-sh.test.mjs` | `--plain` + dry-run: harness/batch lines prefixed |
| Interleaved monotonic offset | T-OSEL-05 | Shell test or controlled sleep between phases | Second phase offset > first (same epoch env) |
| Opt-out legacy | T-OSEL-06 | TS test | `AGENTSTREAM_OPERATOR_ELAPSED=0` → bare `DIAGNOSTIC:` |
| Regression | — | Existing agentstream tests | Pass with opt-out or relaxed assert |

## Out of scope

- Live WF matrix cells (facilitator spot-check post-build)
- Harness subprocess stderr content
- E2E UI

## Verification manifest (build-plan)

```text
cd mcp-server/packages/agentstream && npm run build  # if required by dist consumers
node --test mcp-server/packages/agentstream/src/operator-stderr-line.test.ts
node --test mcp-server/packages/agentstream
node --test tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs
npx tsc -b mcp-server/packages/agentstream  # or repo lint:ts policy
```