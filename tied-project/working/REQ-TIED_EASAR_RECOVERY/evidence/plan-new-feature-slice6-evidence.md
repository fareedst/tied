# plan-new-feature — Slice 6 portable export

**Date:** 2026-10-18  
**REQ:** [REQ-TIED_EASAR_RECOVERY]  
**Depth:** integrated · **gate_policy:** advisory  
**Invocation:** `/plan-new-feature slice 6`

## Refine

- Scope resolved in [slice6-e2e-plan.md](./slice6-e2e-plan.md) (refine-plan 2026-10-19); no new ambiguities.
- Program `pre_implementation` remains [pre_implementation-2026-10-18T02-15-41-747Z.json](../gates/pre_implementation-2026-10-18T02-15-41-747Z.json) (`allowed: true`).

## Plan (CITDP)

| Artifact | Path |
| --- | --- |
| Risk | [risk-assessment-slice6.md](./risk-assessment-slice6.md) |
| Tests | [../test-strategy-slice6.md](../test-strategy-slice6.md) |
| Build tracker | [../checklist-tracker-slice6-build.yaml](../checklist-tracker-slice6-build.yaml) |
| Verification tracker (partial) | [../gate-tracker-slice6-verification.yaml](../gate-tracker-slice6-verification.yaml) |

**LEAP:** [SC-EASAR-EXPORT] added to [REQ-TIED_EASAR_RECOVERY.yaml](../../../requirements/REQ-TIED_EASAR_RECOVERY.yaml).

## Implement (this session)

| Deliverable | Status |
| --- | --- |
| `recovery-export-v1.ts` / MCP / tests | Done |
| `tied_easar_recovery_export_build` | Registered |
| IMPL Stage 9 pseudo-code blocks | Done |
| [recovery-portable-map.v1.yaml](./recovery-portable-map.v1.yaml) | Committed working evidence |
| [recovery-export-manifest.v1.json](./recovery-export-manifest.v1.json) | Dogfood (7 entries, 6 gaps, 0 errors) |

## Not complete (hand off to `@build-plan`)

1. `tied_adversarial_inquiry_run` — `run_id=easar-slice6-verify-20261019`
2. `tied_checklist_gate_validate` — verification phase with full tracker
3. Persist CITDP non_goal update (remove slice 6 deferral) at traceable-commit
4. Program **close_out** unchanged unless sponsor opts into LEAP re-close

## Commands

```bash
npm test --prefix mcp-server -- recovery-export easar-receipts
npx tsc -b --prefix mcp-server
```
