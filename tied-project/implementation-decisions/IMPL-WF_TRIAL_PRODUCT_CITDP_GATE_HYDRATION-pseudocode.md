# [IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] — Hydrate minimal product citdp.v1 for path-based checklist gates.

Grammar-Version: v2

## hydrateCitdpForChecklistGate

- [IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] — Synthesize checklist-shaped adversarial_inquiry for gate validation only when product record is minimal or strict_candidate and lacks adversarial section.
- Contract:
  - INPUT: citdp document (loaded body), optional tracker document
  - OUTPUT: citdp document shallow clone for validator
  - PRE: citdp is plain object; hydration never mutates source reference
  - POST: when adversarialSection present OR depth not in {minimal, strict_candidate}, output equals structural clone without synthetic adversarial
  - POST: when depth minimal or strict_candidate and adversarial absent, output includes risk_analysis.adversarial_inquiry with depth_tier and gate_policy resolved from citdp, tracker execution_profile, defaults
  - EFFECTS: none on filesystem
  - FAILURE_MODES: integrated or missing profile_depth without adversarial → no synthesis (validator fails closed)

```
PROCEDURE hydrateCitdpForChecklistGate(citdp, tracker):
  IF adversarialSection(citdp) IS present:
    RETURN shallowClone(citdp)
  depth := resolveProfileDepth(citdp, tracker)
  IF depth NOT IN {minimal, strict_candidate}:
    RETURN shallowClone(citdp)
  gatePolicy := resolveGatePolicy(citdp, tracker)
  clone := shallowClone(citdp)
  ENSURE risk_analysis object on clone
  SET clone.risk_analysis.adversarial_inquiry := { depth_tier: depth, gate_policy: gatePolicy }
  RETURN clone
  TERMINATION: always returns shallow clone
```

## runGateCheckComposition hydrate pass-through

- [IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-TIED_DAE_INCORPORATION] — Apply hydration after file load and before injected gate validate call; propagate diagnostics into summary reasons.
- Contract:
  - INPUT: gate check input with citdpPath, trackerPath, callGateValidate
  - PRE: tracker and citdp load succeeded
  - OUTPUT: GateCheckSummary with reasons mirroring gate diagnostics when blocked
  - POST: callGateValidate receives hydrated citdp body
  - EFFECTS: receipt persistence hashes hydrated citdp when persistence enabled

```
PROCEDURE runGateCheckComposition(input):
  tracker := loadTrackerFromFile(...)
  citdpRaw := loadCitdpBodyFromFile(...)
  citdp := hydrateCitdpForChecklistGate(citdpRaw, tracker)
  gate := await callGateValidate({ citdp, tracker_path, ... })
  reasons := gate.reasons IF non-empty ELSE diagnosticsToReasons(gate) ELSE defaultBlockedReason
  RETURN summary with reasons
  TERMINATION: returns GateCheckSummary after gate and optional branch check
```

## tied_checklist_gate_validate citdp_path branch

- [IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — Optional file path loads product citdp and hydrates when inline citdp omitted.
- Contract:
  - INPUT: phase, tracker, optional citdp inline body, optional citdp_path
  - PRE: NOT (citdp AND citdp_path)
  - POST: when citdp_path only, validator input uses hydrateCitdpForChecklistGate(loadBody(citdp_path), tracker)

```
PROCEDURE tied_checklist_gate_validate_mcp(args):
  IF args.citdp AND args.citdp_path:
    RETURN error both_set
  IF args.citdp_path AND NOT args.citdp:
    body := loadCitdpBodyFromFile(args.citdp_path)
    args.citdp := hydrateCitdpForChecklistGate(body, args.tracker)
  RETURN validateChecklistGate(args)
  TERMINATION: returns gate validation result or both_set error
  FAILURE_MODES: both_set → explicit MCP input error; load failure propagates from loader
```