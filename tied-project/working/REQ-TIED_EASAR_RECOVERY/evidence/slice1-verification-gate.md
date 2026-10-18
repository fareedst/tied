# Slice 1 — verification gate (inventory.v1)

**Date:** 2026-10-17  
**run_id:** `easar-slice1-verify-20261018`

| Check | Result |
| --- | --- |
| `tied_adversarial_inquiry_run` `verification` | **ok** (advisory `warn`; identity-bound artifacts under `phase-verification/`) |
| `tied_checklist_activation_collect` | **ok** — [gate-activation-slice1-verification.json](./gate-activation-slice1-verification.json) |
| `tied_checklist_gate_validate` `verification` | **`allowed: true`** |
| Gate receipt | [../gates/verification-2026-10-18T02-24-28-044Z.json](../gates/verification-2026-10-18T02-24-28-044Z.json) |
| Tracker | [../gate-tracker-slice1-verification.yaml](../gate-tracker-slice1-verification.yaml) |
| Manifest | [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json) |

## Envelope shell

| Check | Result |
| --- | --- |
| `request_evidence_envelope_build` | **ok** — [request-evidence-envelope.v1.json](./request-evidence-envelope.v1.json) |
| `request_evidence_envelope_validate` (`fail_on_error_gaps: false`) | **valid** (shell); `evidence_chain_profile` error gap expected until close-out |

Slice 2 (code_graph receipt linkage) may proceed; per-slice verification still required for slices 3–4 before program close-out.
