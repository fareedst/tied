# [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY]
# How: classify sponsor decisions into charter vs selection lanes; batch charter backlog; validate selection evidence; warn-only mid-lane audit — composing SAR consequence ladder.

Grammar-Version: v2

procedure CLASSIFY_SPONSOR_DECISION_LANE(decision):
# [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: map decision inputs to charter, selection, or mid_lane_defer using requires_product_evidence and CLASSIFY_DECISION_CONSEQUENCE.
  Contract:
  INPUT: decision with description, requires_product_evidence, reversible_default_documented, reversibility_evidence, affects_clients, affects_status
  PRE: decision.description is non-empty
  OUTPUT: lane in {charter, selection, mid_lane_defer}
  POST: selection when requires_product_evidence; mid_lane_defer when reversible default documented and rung <= 2; else charter for pre-code scope
  FAILURE_MODES: UNCLASSIFIABLE_DECISION
  EFFECTS: pure
  TERMINATION: total
  CALL CLASSIFY_DECISION_CONSEQUENCE(decision) when ladder rung needed

procedure CLASSIFY_DECISION_CONSEQUENCE(decision):
# [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] — How: external ladder authority implemented in consequence-ladder.ts; referenced by lane classifier only.
  Contract:
  INPUT: decision with description, reversibility_evidence, affects_clients, affects_status
  OUTPUT: rung in {1, 2, 3, 4}
  EFFECTS: pure
  TERMINATION: total

procedure BATCH_CHARTER_COSTLY_CHOICES(citdp, pending_decisions):
# [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: at risk-assessment merge hinge gaps and rung>=3 decisions into sponsor_charter_backlog rows.
  Contract:
  INPUT: citdp map, pending_decisions list
  PRE: citdp is a map
  OUTPUT: sponsor_charter_backlog rows with decision_id, phase, lane charter, default_or_option, consequence_rung, disposition, evidence_refs
  POST: every row has lane charter; costly items not auto-approved
  EFFECTS: pure
  TERMINATION: total

procedure VALIDATE_SELECTION_EVIDENCE(option):
# [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: at verification-gate ensure each selection option cites selection_evidence; missing evidence yields warn diagnostic only.
  Contract:
  INPUT: selectable option with selection_evidence refs
  PRE: option is a map
  OUTPUT: ok flag and diagnostics list
  POST: missing selection_evidence adds warn code selection_evidence_missing; never throws
  FAILURE_MODES: selection_evidence_missing
  EFFECTS: pure
  TERMINATION: total

procedure AUDIT_MID_LANE_SPONSOR_DEFERRAL(citdp, gate_policy):
# [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: when charter or selection backlog non-empty under advisory gate_policy emit mid_lane_sponsor_deferral warn; never block allowed.
  Contract:
  INPUT: citdp map, gate_policy string
  PRE: citdp is a map
  OUTPUT: diagnostics list
  POST: under advisory only warn diagnostics; under strict blocking may include backlog codes per policy
  EFFECTS: pure
  TERMINATION: total
