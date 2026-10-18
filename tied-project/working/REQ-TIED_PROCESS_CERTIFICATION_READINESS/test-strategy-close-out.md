# Test strategy — plan-close-out wave (REQ-TIED_PROCESS_CERTIFICATION_READINESS)

**Scope:** Documentation, canonical evidence, CHANGELOG, and gate replay only — **no new RED tests or product code** unless LEAP drift is found.

**Depth:** `integrated` · **gate_policy:** `advisory` · **Refine pass:** 3 (plan-close-out)

## Replay commands (must pass before `close_out` gate replay)

| Id | Command | Expected |
| --- | --- | --- |
| pcr-co-build | `npm run build --prefix mcp-server` | exit 0 |
| pcr-co-unit | `node --import tsx --test mcp-server/src/process-certification-readiness/*.test.ts` | 15/15 |
| pcr-co-lint | `npm run lint:ts --prefix mcp-server` (or `npx tsc -b` in mcp-server) | exit 0 |
| pcr-co-tied | `tied_validate_consistency` with `TIED_BASE_PATH` → `tied-project/` | ok |
| pcr-co-pseudo | `pseudocode_validate` on six `IMPL-TIED_PROCESS_CERTIFICATION_*` sidecars | gate receipt for `gate-pseudocode-validation-evidence.md` |

## Evidence artifacts produced by this wave

- Six canonical filenames in `evidence/` (band **A** target for reconcile)
- `verification-evidence-manifest.v1.json` populated from replay exit codes (mirror EASAR manifest schema)
- `closeout-run-close-out-gates-plan-close-out.json` (or updated final receipt) via unified runner
- `CHANGELOG.md` [Unreleased] bullet
- `plan-close-out-handoff.md` + refreshed `session-handoff.md`

## Non-goals

- Re-running full MCP composition test matrix unless a replay command fails
- Methodology-learning experiment upsert (optional per CITDP)
- `git commit`
