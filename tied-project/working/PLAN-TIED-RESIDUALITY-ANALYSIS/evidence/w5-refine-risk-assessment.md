# W5 refine-plan — Risk assessment

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**depth_tier:** `minimal`  
**gate_policy:** `advisory`  
**Date:** 2026-09-27

## Eligibility

- **Batch type:** Documentation and working-folder promotion proposals only — no runtime, auth, network, or persistence behavior change in refine-plan W5.
- **Assurance profiles triggered:** None at minimal depth (pilot execution already completed at integrated depth in prior waves).

## Risks

| ID | Description | Likelihood | Impact | Mitigation (refine) |
|----|-------------|------------|--------|---------------------|
| RISK-W5-001 | Promotion copy treats pilot partials (P1, S-T13, V-H01) as universal proof | Medium | High | DoD checklist marks partials; recommendation **Adopt (revise)** with explicit proof boundaries |
| RISK-W5-002 | Checklist hook becomes mandatory gate without sponsor opt-in | Low | Medium | Scaffold marks `optional_risk_triggered`; build-plan requires SD-W5-CHECKLIST |
| RISK-W5-003 | CITDP field implies runtime resilience from discovery refs alone | Medium | High | `proof_boundary` string in proposed snippet; attach-as-evidence pattern first |
| RISK-W5-004 | Premature schema lint burdens agents without field use | Medium | Low | **Defer** lint until ≥10 records or sponsor mandate (`stressor-residue-v1-field-use.md`) |
| RISK-W5-005 | Accidental edit to `tied/methodology/` | Low | High | Guardrail: working/w5-promotion only in refine; build-plan copies to project paths |
| RISK-W5-006 | Comparison doc gitignored — provenance drift | Medium | Low | Caveat in DoD item 11; SD-W5-COMPARISON-GIT for build-plan |

## Adversarial inquiry

**Not applicable** at minimal depth for W5 refine batch. Integrated inquiry artifacts from W1–W4 pilot remain historical evidence only.

## Residuality-specific falsification

- **Question:** Does completing W1–W4 pilot prove residuality should be mandatory for all REQs?  
  **Answer:** No — optional risk-triggered pass; pilot scope was two stateful-reliability REQs only.

- **Question:** Does W5 refine authorize mutating canonical checklist without build-plan?  
  **Answer:** No — NON-CANONICAL scaffolds under `working/w5-promotion/`.
