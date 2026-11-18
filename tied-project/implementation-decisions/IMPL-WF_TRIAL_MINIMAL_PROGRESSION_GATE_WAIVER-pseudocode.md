# [IMPL-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] [ARCH-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] [REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] — Progression gate adversarial list waiver parity with open-record.

Grammar-Version: v2

## validateAdversarialContract tracker waiver

- [IMPL-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] [ARCH-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] [REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] — Extend adversarial contract validation to honor minimal-depth-no-inquiry tracker stub at all gate phases.
- Contract:
  - INPUT: citdp document, gate phase, optional tracker document
  - OUTPUT: validation result with diagnostics array
  - PRE: adversarial_inquiry section parseable; depth_tier minimal or integrated
  - POST: when depth minimal AND trackerWaivesMinimalAdversarialOpenRecord, no missing_* list diagnostics from four-field loop
  - EFFECTS: same predicate as validateCitdpOpenRecord list waiver
  - FAILURE_MODES: integrated depth never waives via tracker stub; missing tracker at minimal depth retains list requirements

```
PROCEDURE validateAdversarialContract(input):
  depth := resolve_depth(input.citdp)
  waiveLists := depth IS minimal AND trackerWaivesMinimalAdversarialOpenRecord(input.tracker)
  IF requiresMinimalOpenRecordFields(depth) AND NOT waiveLists:
    FOR each required adversarial list field:
      IF list empty: EMIT missing_* diagnostic
  RETURN aggregate diagnostics
```

## validateChecklistGate pass-through

- [IMPL-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] [ARCH-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] [REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — Pass tracker into every validateAdversarialContract invocation from validateChecklistGate.
- Contract:
  - INPUT: tracker document, citdp document, gate phase, optional evidence bundle
  - PRE: validateChecklistGate caller supplies tracker when validating progression gates
  - OUTPUT: allowed boolean plus diagnostics aggregate
  - POST: every validateAdversarialContract call receives the same tracker reference
  - EFFECTS: MCP tied_checklist_gate_validate unchanged at API boundary

```
PROCEDURE validateChecklistGate(input):
  ...
  adversarialResult := validateAdversarialContract({
    citdp: input.citdp,
    phase: input.phase,
    depth,
    tracker: input.tracker,
    ...
  })
```