# Wave 5 unit tests — REQ-TIED_ISOLATED_VERIFICATION_RUNNER

**Date:** 2026-10-30

| Command | Result |
| --- | --- |
| `npx tsx --test mcp-server/src/isolated-verification-runner.test.ts` | green (3 cases) |
| `npm test --prefix mcp-server` | green (full battery) |

**Scope:** `runDeclaredQualityCommandsWithRunnerPolicy`, CLI `isolated-verification-runner`, manifest `execution_runner`, config `verification.isolated_runner`.
