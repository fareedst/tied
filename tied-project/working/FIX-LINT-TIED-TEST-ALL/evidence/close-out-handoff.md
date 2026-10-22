# Close-out handoff — FIX-LINT-TIED-TEST-ALL

### Completion signals

- **Machine close-out:** not_run — ad-hoc fix; no REQ-scoped `close_out` gate or envelope.
- **Process contract:** partial — `bash -n`, `lint_tied` from linked client cwd, scoped staging map; no Tracker dual-write.
- **Adherence ledger:** not_run — no per-REQ reconcile.

### Remaining risks

- Detail YAML under symlinked `tied-bundle/requirements/` dirs is still not descended by default `find` (methodology detail lint remains store-root responsibility).

### Commit

**Commit:** see SHA recorded after traceable commit for this wave.
