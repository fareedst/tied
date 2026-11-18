# Test strategy — REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`  
**Primary proof:** Doc contract tests + receipt validator tests + `tied_validate_consistency` after R+A+I.

## refine-plan

| Check | Status |
| --- | --- |
| PLAN slices A–J + staging map | pass 2 complete (2026-11-17) |
| Enrollment schema shape | `implement-complete-receipt-enrollment.v1.json` draft in PLAN §Slice G |
| `pseudocode_validate` gate_mode | See [refine-pass2-gate-note.md](evidence/refine-pass2-gate-note.md) |
| `pre_implementation` gate | deferred to build-plan (RED tests + R+A+I first) |

## build-plan — Slice F (intent CI)

**File:** `tools/bootstrap/lib/hackernoon-observability-contract-compose-doc.test.mjs`

**Required markers (minimum):**

- `REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3`
- `## Proof boundary`
- `## Scope slice`
- `## Intent vs verify table`
- `## Observably dead catalog`
- `## Receipt contract schema`
- `## Pair-read`
- `hackernoon-observability-contract-ci-vs-tied-agent-management.md`
- `governance-sensing-proof-boundary-compose.md`
- `pre-handoff-verification-charter.md`
- `implement-complete-receipt-contract`
- `not_measured`
- `tied_checklist_gate_validate`

## build-plan — Slice G (verify CI)

**Files:**

- `tools/bootstrap/lib/implement-complete-receipt-contract.mjs`
- `tools/bootstrap/lib/implement-complete-receipt-contract.test.mjs`
- `tied-bundle/docs/schemas/implement-complete-receipt-enrollment.v1.json`

**Fixtures:** `tools/bootstrap/fixtures/receipt-contract/pass-closed/` and `fail-missing-manifest/` (minimal tree copies).

**Assertions:**

| Case | Expected |
| --- | --- |
| Enrolled REQ, `plan_phase: closed`, manifest + handoff ok | `ok: true` |
| Enrolled REQ, closed, missing manifest | `ok: false` |
| Non-enrolled REQ, closed, no manifest | `ok: true` (skipped) |
| Open plan_phase | `ok: true` regardless of manifest |

## build-plan — Slice H

- Workflow file exists; runs both test modules; path filters include receipt lib + compose guide.

## build-plan — Slices A–E

| Slice | Assertion |
| --- | --- |
| A | Guide H2 sections per PLAN |
| B | client-development-index quick-read row |
| C | `intent-verify-operator-checklist.md` + HPS link |
| D | citdp-policy intent-vs-verify bullet |
| E | Comparison Phase 1 Implemented + REQ metadata |

## Close

- `tied_validate_consistency`
- `pseudocode_validate` IMPL gate_mode before pre_implementation gate retry