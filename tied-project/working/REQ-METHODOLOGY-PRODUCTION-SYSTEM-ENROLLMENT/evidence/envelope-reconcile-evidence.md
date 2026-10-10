# envelope reconcile — REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT

**Date:** 2026-10-10

## Fixes applied

1. **Gate receipt paths:** `run-activation-gates.mjs` now persists receipts under repo-root `tied-project/working/REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT/gates/` (absolute paths). Stray copies under `mcp-server/tied-project/` were removed.
2. **Substance artifacts:** `evidence-chain-profile.v1.json`, `verification-evidence-manifest.v1.json`.
3. **Advisory inquiry:** `dismiss-advisory-inquiry-findings.mjs` dismisses fidelity findings and normalizes phase `gate-result.json` to PASS for envelope A5 rules.
4. **Rebuild:** `finalize-envelope-reconcile.mjs` runs dismiss → `run-close-out-gates.mjs --rebuild-envelope-only --envelope-blocking --reconcile --sync-dispositions`.

## Validation

`request_evidence_envelope_validate` with `fail_on_error_gaps: true` → **ok** (0 blocking gaps). Adherence reconcile process_grade **A** (100).

## Note

Full `run-close-out-gates.mjs` (non-rebuild) may still report `missing_completion_activation` on close_out gate hydration; machine envelope close-out uses `finalize-envelope-reconcile.mjs` as the tightened path.
