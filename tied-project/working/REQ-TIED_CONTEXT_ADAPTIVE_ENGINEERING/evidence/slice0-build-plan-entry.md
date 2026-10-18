# Slice 0 — build-plan entry checklist

**REQ:** `REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING`  
**Gate tracker:** [../gate-tracker-pre-implementation.yaml](../gate-tracker-pre-implementation.yaml)  
**Planned inquiry `run_id`:** `cae-structural-pre-impl-20261018`

## Ordered steps (do not skip)

1. **`tied_config_get_base_path`** → `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project`.
2. Copy refine Tracker hygiene: clear `execution_evidence.completed` on [checklist-tracker.yaml](../checklist-tracker.yaml) only if starting a **new** build run (otherwise resume).
3. Mint REQ/ARCH/IMPL via TIED MCP (`author-requirement` … `persist-implementation-records`).
4. **`sub-adversarial-inquiry-pass` (structural)** — scope: new IMPL blocks + MCP registration surface; persist four artifacts under `tied-bundle/working/REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING/adversarial-inquiry/phase-pre_implementation/`.
5. Complete **`gate-pseudocode-validation`** (Layer C `gate_mode: true`) on all new pseudo-code sidecars.
6. Hydrate [gate-tracker-pre-implementation.yaml](../gate-tracker-pre-implementation.yaml) step dispositions + `evidence_refs`; set `execution_evidence.completed` to match.
7. **`tied_checklist_gate_validate`** with `phase: pre_implementation`, `tracker_path`, unwrapped CITDP body, activation pairing → receipt in `working/.../gates/`.
8. Proceed to **`unit-test-red`** only when gate returns **`allowed: true`**.

## Dogfood inputs (Slice 4 preview)

Reuse committed EASAR evidence (do not rebuild recovery runtime):

| Input | Path |
| --- | --- |
| Inventory | `tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/inventory.v1.json` |
| Code graph receipt | `tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/code-graph-matrix-receipt.v1.json` |
| Claim matrix map | `tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/claim-matrix-map.v1.json` |

Context profile for dogfood should mark **brownfield**, **high uncertainty**, and **integrated** checklist depth; selector must not downgrade UNKNOWN criticality.

## BBCE (advisory)

Declared behavioral slice: `mcp-server/src/context-adaptive/**` + four `context_adaptive_*` MCP bindings. No changes to checklist-validator disposition rules in v1.
