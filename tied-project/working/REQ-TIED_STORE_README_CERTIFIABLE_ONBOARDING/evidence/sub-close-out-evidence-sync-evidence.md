# sub-close-out-evidence-sync

**REQ:** `REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING`  
**Runner:** `tools/bootstrap/templates/run-close-out-gates.mjs` with `--envelope-blocking --sync-dispositions --reconcile`

Sync dispositions via [gate-tracker-close-out.yaml](../gate-tracker-close-out.yaml); manifest [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json). Receipt: [closeout-run-close-out-gates-final.json](./closeout-run-close-out-gates-final.json).
