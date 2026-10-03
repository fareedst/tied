# W1 test strategy — change locality pilot

**depth_tier:** integrated · **gate_policy:** advisory

## Unit tests (RED → GREEN)

- **File:** `mcp-server/src/analysis/change-locality-pilot.test.ts`
- **Covers:** glob match, synthetic changed-path classification (locality, unexpected, shared mechanism, slice crossings), live-repo git range helper (`fbe65e1..d5ea688` prefix filter).

## Compile note

`tsconfig.json` excludes `*.test.ts` from default `npm run build`. Compile pilot tests before CI-style run:

```bash
cd mcp-server
npm run build
npx tsc src/analysis/change-locality-pilot.test.ts --outDir dist/analysis --rootDir src/analysis --module NodeNext --moduleResolution NodeNext --target ES2022 --declaration false
node --test dist/analysis/change-locality-pilot.test.js
```

(W2 may add a shared test-compile script; plumb preview tests use the same pattern today.)

## Integration / replay

- **Runner:** `working/PLAN-TIED-BBCE-ALIGNMENT/pilot/run-locality-pilot.mjs`
- **Output:** `locality-run.json` (regenerable; read-only git)

## Composition / E2E

Not applicable — pilot does not change agentstream runtime bindings.

## Proof boundary

Tests prove deterministic metric computation and git name-only extraction — not that historical commits satisfied REQ-TIED_CLAUDE_LIVE_DRIVER.

## Verification

- `tied_validate_consistency` after any project TIED YAML edits (none required for W1 tooling-only path).
- `tied_checklist_gate_validate` at pre_implementation and verification with integrated depth.
