# risk-assessment-evidence — REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING

**Date:** 2026-10-10

## depth_tier / gate_policy

- `depth_tier`: integrated (CITDP `risk_analysis.adversarial_inquiry`)
- `gate_policy`: per_citdp
- `async_in_scope`: false (no AWAIT/SEND in pairing module)

## Consequence ladder

| Decision | Class | Notes |
| --- | --- | --- |
| CITDP-scoped gate-blocking only | **Costly** | Sponsor hinge `pairing_enforcement: gate_blocking_verification_close_out_citdp_scoped` |
| Global methodology pairing hook | Costly / forbidden | Counterexample RISK-MCEP-001 |
| Generic prose conformance refs | Reversible at design | Pairing rejects via INVALID_INPUT |

## Risks (from CITDP)

- **RISK-MCEP-001** Global gate regression — mitigated by `methodology_surface_experiment_link` required on CITDP.
- Eligibility triggers matched: gate_behavior_change, mcp_write_surface, persistence.

## Assurance

- Profiles: baseline-functional, external-input-security
- Proof boundaries: pairing unit tests, MCP tool, composition trap in `pairing-gate.test.ts`
