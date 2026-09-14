# New TIED client adherence — operator runbook

**REQ:** [REQ-TIED_NEW_CLIENT_ADHERENCE](../tied/requirements/REQ-TIED_NEW_CLIENT_ADHERENCE.yaml) · **Plan:** [pseudocode-new-client-tied-adherence-plan.md](pseudocode-new-client-tied-adherence-plan.md) · **Fleet program:** [pseudocode-constraint-v2-fleet-program.md](pseudocode-constraint-v2-fleet-program.md)

## Purpose

Assert **Layer A bootstrap** for a **new** TIED client after `copy_files.sh`: G4 constraint-enforced grammar audit at the client root. This is **onboarding-adherent** evidence — it does **not** prove **fleet-migrated-client** or full IMPL constraint migration.

## When to run

- Immediately after `./copy_files.sh "$CLIENT_ROOT"` on a new repo
- Automatically after **`test-new-tied-client`** / **`new-tied-client`** via [`scripts/build-commands.sh`](../scripts/build-commands.sh) (report at `working/tied-new-client-audit.v1.json` in the client tree)
- Before the first behavior-changing product REQ in that client
- When template or bootstrap policy changes (compare with stdd G4 maintenance cadence)

Skip in bootstrap smoke only when necessary: `TIED_SKIP_NEW_CLIENT_AUDIT=1` or `new-tied-client.mjs --skip-onboarding-audit`.

## Commands

Audit an existing bootstrapped client:

```bash
node scripts/run-tied-new-client-audit.mjs --client-root /path/to/client \
  --json-out /path/to/client/working/tied-new-client-audit.v1.json
```

Optional full TIED consistency (may fail on large tooling clients — default off):

```bash
node scripts/run-tied-new-client-audit.mjs --client-root /path/to/client --with-consistency
```

Disposable smoke (copy_files + audit, temp dir removed after):

```bash
node scripts/run-tied-new-client-audit.mjs --disposable
```

## Success criteria

- Exit code **0**
- Report `schema_version`: `tied-new-client-audit.v1`, `ok: true`, `gate_stage: G4`
- Report `proof_boundary` documents non-equivalence to fleet-migrated-client

## Failure behavior

- Exit **non-zero**
- Report still written when `--json-out` is set, with `ok: false` and embedded `grammar_audit` diagnostics

## Proof boundaries

| Claim | Valid evidence | Does **not** prove |
|-------|------------------|-------------------|
| Bootstrap Layer A | This audit + `copy_files.sh` exit 0 | All IMPLs constraint-enforced-v2 |
| stdd template healthy | [G4 maintenance runbook](pseudocode-constraint-v2-fleet-g4-maintenance-runbook.md) | Specific external client |
| Process complete for a REQ | Checklist gates + envelope under `working/{REQ}/` | Client-root audit alone |

## Layer C (per REQ)

For behavior-changing work, follow P5-G: `tied_checklist_gate_validate` at verification and close_out before `tied_verify --update`. See [p5-g-feat-spawned-req-envelope-policy.v1.md](../working/fleet-constraint-v2/p5-g-feat-spawned-req-envelope-policy.v1.md).

## Related

- WS-NC-1 bootstrap hardening: [methodology-detail-files-bootstrap-fix-plan.md](methodology-detail-files-bootstrap-fix-plan.md) (separate LEAP; not required for audit CLI pass)
- Grammar audit library: `scripts/lib/audit-grammar-v2-default.mjs`
