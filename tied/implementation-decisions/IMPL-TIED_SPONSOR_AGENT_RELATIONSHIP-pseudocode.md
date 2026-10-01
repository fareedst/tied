# [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]
# How: articulate sponsor/agent/reviewer roles and the agency boundary condition in vocab + principles; enforce hinge-field hygiene and checklist parity through existing gates.

Grammar-Version: v2

procedure CLASSIFY_DECISION_CONSEQUENCE(decision):
# [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] — How: map open decisions to consequence ladder rungs.
  Contract:
  INPUT: decision with description, reversibility_evidence, affects_clients, affects_status
  PRE: decision is non-empty
  OUTPUT: rung in {1 default, 2 default+evidence, 3 reviewer, 4 sponsor}
  POST: rung is deterministic from inputs
  FAILURE_MODES: UNCLASSIFIABLE_DECISION
  EFFECTS: pure
  TERMINATION: total

procedure VALIDATE_HINGE_FIELD(citdp):
# [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] — How: require owner, approval or review_status, and evidence on present hinge maps.
  Contract:
  INPUT: citdp parsed map
  PRE: citdp is a map
  OUTPUT: ok flag and diagnostics list of hinge_field_incomplete paths
  POST: absent or null hinge maps yield no diagnostic
  EFFECTS: pure
  TERMINATION: total

procedure ROUTE_SPONSOR_TIED_DISAGREEMENT(disagreement):
# [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] — How: route sponsor-vs-TIED conflict to LEAP or sponsor question, never IMPL contradiction.
  Contract:
  INPUT: disagreement with sponsor_statement, conflicting_tokens, rung
  PRE: rung from CLASSIFY_DECISION_CONSEQUENCE
  OUTPUT: route in {LEAP, SPONSOR_QUESTION}
  POST: route is never CONTRADICTION_FINDING
  EFFECTS: pure
  TERMINATION: total

procedure AUDIT_RELATIONSHIP_LAYER_CONTRACT(repo_root):
# [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] — How: static audit of glossary, checklist parity, manifest, and templates promotion markers.
  Contract:
  INPUT: repo_root path
  PRE: required files are readable
  OUTPUT: ok flag and failures list
  POST: every SC-SAR marker is checked
  EFFECTS: read-only IO
  TERMINATION: total
