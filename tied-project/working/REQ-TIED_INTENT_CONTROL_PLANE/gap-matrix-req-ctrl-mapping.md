# Gap matrix: REQ-CTRL / INV → TIED (REQ-TIED_INTENT_CONTROL_PLANE)

Reference: [docs/anonymized-mcp-architecture-handoff.md](../../../docs/anonymized-mcp-architecture-handoff.md) §12–13.

| Handoff | Status | TIED / code |
| --- | --- | --- |
| REQ-CTRL-001 project identity binding | **Wave 1 new** | REQ/ARCH/IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING |
| REQ-CTRL-002 atomic batch writes | **Wave 2** | REQ-TIED_YAML_UPDATES_ATOMIC_BATCH (+ FEAT revision-safe pattern) |
| REQ-CTRL-003 consistency | Exists | tied_validate_consistency |
| REQ-CTRL-004 gates | Exists | tied_checklist_gate_validate |
| REQ-CTRL-005 evidence freshness | **Wave 3** | REQ-TIED_VERIFICATION_EVIDENCE_PROVENANCE + tied_verify manifest binding |
| REQ-CTRL-007 checklist controller | **Wave 4** | REQ-TIED_DURABLE_CHECKLIST_CONTROLLER + agentstream `--resume-from-tracker` + MCP `tied_checklist_controller_resume_plan` |
| REQ-CTRL-008 agent driver | Partial | REQ-TIED_BOUNDED_COMPOSITION |
| REQ-CTRL-009 verification runner | Deferred W5 | — |
| REQ-CTRL-013 usage metrics | Partial | REQ-MCP_USAGE_METRICS |
| INV-004 traceability | Exists | Traceability tools |
| INV-005 independent completion | Exists | REQ-TIED_CHECKLIST_GATE_ENFORCEMENT |
| INV-011 methodology read-only | Exists | Project index write isolation |
| Umbrella three authorities | **Wave 0 new** | REQ/ARCH/IMPL-TIED_INTENT_CONTROL_PLANE |
