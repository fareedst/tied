---
name: Close out store policy
overview: "Prepare REQ-TIED_STORE_BUNDLE_GIT_POLICY for TIED close-out without committing: repair evidence/gates, finish documentation and validation, update CHANGELOG, and produce a proposed commit message."
todos:
  - id: repair-closeout-evidence
    content: Hydrate tracker/CITDP evidence and clear the pre-implementation/close-out evidence blockers for REQ-TIED_STORE_BUNDLE_GIT_POLICY.
    status: pending
  - id: finish-docs-and-validation
    content: Add the store git row, run tests/lint/consistency checks, and verify fixture parity plus zero tracked tied-bundle/working paths.
    status: pending
  - id: run-unified-closeout
    content: Synchronize and validate the request envelope, run the close_out checklist gate, and reconcile the adherence ledger.
    status: pending
  - id: changelog-and-handoff
    content: Update CHANGELOG only after passing gates and hand off three completion signals with a proposed commit message; do not commit.
    status: pending
isProject: false
---

# Close Out Store Bundle Git Policy

1. Repair the close-out prerequisites in `tied-project/working/REQ-TIED_STORE_BUNDLE_GIT_POLICY/`: hydrate the CITDP/tracker evidence for `sub-adversarial-inquiry-pass`, complete remaining tracker dispositions, and add the missing install-resource-matrix store-git row.
2. Run the required verification surface: bootstrap and `mcp-server` tests, YAML lint/format checks, `tied_validate_consistency`, and the store invariant that `git ls-files tied-bundle/working` is empty. Preserve runtime `tied-bundle/working/` paths while validating fixture-backed regression consumers.
3. Execute unified close-out evidence synchronization using the request envelope, then validate the envelope with blocking gaps enabled and call `tied_checklist_gate_validate` for `close_out`. Reconcile the adherence ledger with process grade and record the exact three completion signals.
4. Review gitignore hygiene under `[PROC-GITIGNORE_CLOSE_OUT]` using the existing change context; document one hygiene disposition without staging or committing. Update `CHANGELOG.md` with a concise entry only after the close-out gate and envelope pass.
5. Hand off the result as complete only if machine close-out, process contract, and adherence ledger all pass; otherwise label it incomplete with remaining blockers. Include a proposed commit message and do not run `git add` or `git commit`.

Key artifacts:
- [working-gitignore.mjs](tools/bootstrap/lib/working-gitignore.mjs) — store profile implementation.
- [store-gitignore-policy.test.mjs](tools/bootstrap/lib/store-gitignore-policy.test.mjs) — git policy and tracked-tree assertions.
- [REQ-TIED_STORE_BUNDLE_GIT_POLICY handoff](tied-project/working/REQ-TIED_STORE_BUNDLE_GIT_POLICY/evidence/session-handoff.md) — current blockers and evidence state.
- [install-resource-matrix.md](tied-project/working/REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md) — remaining documentation update.