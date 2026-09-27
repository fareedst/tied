# W1 refine-plan — risk assessment (integrated depth)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Batch:** W1 bounded discovery pilot — refine/plan only (no workshop execution)  
**Date:** 2026-09-27

## depth_tier selection

- **Selected:** `integrated` (default for W1 pilot batch)
- **gate_policy:** `advisory`
- **prior_depth_tier:** `minimal` (Batch A plan-doc / close-out)
- **Assurance profiles (pilot):** `stateful-reliability`, `data-integrity-migration`
- **Eligibility triggers matched:** persistence / stateful execution recovery; idempotent creation with store serialization and no partial publish

## Integrated waiver

Not used. Pilot REQs explicitly involve durable task identity, evidence history, and idempotency store behavior.

## Primary falsification surfaces (W1 planning)

1. Incidence matrix or worksheet treated as competing REQ/ARCH/IMPL authority.
2. Unreviewed residues promoted into project YAML without W2 classification / W3 LEAP.
3. Design stressors reused as validation stressors while claiming holdout proof.
4. Discovery artifacts cited as runtime resilience evidence without W4 executable proof.

## Residual risks (planning batch)

- **RISK-RES-001** vocabulary conflation — mitigated via `tied/vocab/residuality.md` contrasts.
- **RISK-RES-W1-001** workshop scope creep into stack mutation — mitigated by read-only pilot target policy and separate W3 CITDP.
- **RISK-RES-W1-002** under-specified participant scope — mitigated by `pilot/participant-scope.md` template (build-plan fills).

## Adversarial inquiry

Structural `pre_implementation` pass at integrated depth with `gate_policy: advisory`; artifacts under `working/PLAN-TIED-RESIDUALITY-ANALYSIS/adversarial-inquiry/phase-pre_implementation/`.
