# sub-close-out-evidence-sync

**REQ:** `REQ-TIED_EASAR_RECOVERY`  
**Runner:** `tools/bootstrap/templates/run-close-out-gates.mjs` with `--envelope-blocking --sync-dispositions --reconcile`

Sync dispositions via authoritative [gate-tracker-close-out.yaml](../gate-tracker-close-out.yaml); manifest [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json). Summary JSON: [closeout-run-close-out-gates.json](./closeout-run-close-out-gates.json) (written by runner).
