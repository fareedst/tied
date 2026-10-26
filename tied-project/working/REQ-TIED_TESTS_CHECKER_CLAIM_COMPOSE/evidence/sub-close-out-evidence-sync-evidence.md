# sub-close-out-evidence-sync — REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE

**Run ID:** `close-out-2026-10-26-checker-claim-p23`  
**Date:** 2026-10-26

## Runner

`node tools/bootstrap/templates/run-close-out-gates.mjs` with:

- `--sync-dispositions`
- `--reconcile`
- `--envelope-blocking`
- `--request-token REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE`
- `--tracker-path tied-project/working/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE/checklist-tracker-phase3.yaml`
- `--citdp-path tied-project/working/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE/CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE-phase3-draft.yaml`

## Outputs

| Artifact | Path |
| --- | --- |
| Verification manifest | [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json) |
| Envelope (local regenerable) | `evidence/request-evidence-envelope.v1.json` |
| Close-out summary | [close-out-gates-2026-10-26.json](./close-out-gates-2026-10-26.json) |
| NA receipt (adversarial) | `evidence/not-applicable-receipt.v1.json` (gitignored regenerable) |

## Reconcile

- **band:** B  
- **gap_codes:** `thin_ledger` (legacy_no_adherence_chain until sync append)
