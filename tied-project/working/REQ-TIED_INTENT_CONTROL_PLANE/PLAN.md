# PLAN — REQ-TIED_INTENT_CONTROL_PLANE

Linked Cursor plan: `intent_control_plane_req_9e21803c.plan.md`

## Waves

| Wave | Deliverable |
| --- | --- |
| 0 | TIED tokens, gap matrix, tracker, CITDP draft |
| 1 | Path 2 startup + per-write + sidecar binding, tests |
| 2 | REQ-CTRL-002 — atomic `yaml_updates_apply` snapshot/rollback ([REQ-TIED_YAML_UPDATES_ATOMIC_BATCH]) |
| 3 | REQ-CTRL-005/011 — `tied_verify` manifest provenance + freshness ([REQ-TIED_VERIFICATION_EVIDENCE_PROVENANCE]) |
| 4 | REQ-CTRL-007 — durable checklist resume ([REQ-TIED_DURABLE_CHECKLIST_CONTROLLER]) |

## Sponsor decisions

[tied-project/working/REQ-TIED_INTENT_CONTROL_PLANE/evidence/sponsor-decisions-evidence.md](evidence/sponsor-decisions-evidence.md)

## Gates (run_ids TBD at close-out)

- pre_implementation — before RED
- verification — before tied_verify
- close_out — envelope when claiming complete
