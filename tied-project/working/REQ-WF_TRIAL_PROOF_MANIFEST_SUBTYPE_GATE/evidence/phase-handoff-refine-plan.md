# phase-handoff-refine-plan — REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE

request_token: REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE  
date: 2026-11-12

## Locked

- RESOLVE **R1–R9** in [PLAN.md](../PLAN.md) §1
- `proofSubtypeValidationError` contract §1.1
- IMPL sidecar: [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE-pseudocode.md](../../../implementation-decisions/IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE-pseudocode.md)
- CITDP hydrated (adversarial not_used + receipt)

## Gate (advisory)

`tied_checklist_gate_validate` **pre_implementation**: `allowed: false` — missing adversarial fields before receipt hydrate; **expected at minimal depth** until CITDP re-run post-receipt. Not a plan failure.

`pseudocode_validate`: **pending build-plan** — second procedure block linkage (rebuild MCP dist if stale); two-block sidecar on disk.

## Build alignment

Uncommitted `@debug` `.mjs` matches locked contracts; formalize in `@build-plan`.

## Next

**`@build-plan`**
