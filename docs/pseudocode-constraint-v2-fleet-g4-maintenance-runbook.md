# Fleet G4 maintenance — operator runbook

**REQ:** [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE](../tied/requirements/REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE.yaml) · **Program:** [pseudocode-constraint-v2-fleet-program.md](pseudocode-constraint-v2-fleet-program.md)

## Purpose

Post–Track B **continuous G4 grading** (bootstrap enforcement, stale waivers, **enrolled five-repo regression**). This is **not** a migration batch and **does not** prove all 18 not_enrolled clients remain fleet-migrated.

## When to run

- After edits to `working/fleet-constraint-v2/` governance YAML, manifest, or waiver registry
- After bootstrap / template policy changes affecting G4 audit
- Weekly cadence while fleet program is active
- Before fleet-related doc or TIED commits (recommended)

## Commands (after `/build-plan`)

Primary (refined target):

```bash
node scripts/run-fleet-g4-maintenance.mjs
```

Check-only (skip unit tests):

```bash
node scripts/run-fleet-g4-maintenance.mjs --skip-tests
```

Underlying G4 report only (today):

```bash
node scripts/run-fleet-g4-ci-checks.mjs
```

Full qualification harness slice:

```bash
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh fleet-g4-ci
```

## Success criteria

- Exit code **0**
- [`program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml): `last_g4_ci_ok: true`, fresh `last_g4_ci_at`
- Receipt: `working/fleet-constraint-v2/g4-maintenance/last-run.v1.json` with `ok: true`

## Failure behavior (OD-G4M-1)

- Exit **non-zero**
- `last_g4_ci_ok: false` in program-status
- Receipt records `ok: false` with embedded `g4_report`

## Proof boundaries

| Claim | Valid evidence |
|-------|----------------|
| Last maintenance OK | program-status + last-run receipt |
| Enrolled cohort fleet-migrated | G4 `enrolled_track_regression` check |
| Full Track B inventory | Manifest + wave receipts (separate audit) |
| `tied-win-diff` | [fleet tied-win-diff bypass](../tied/vocab/pseudocode-and-citdp.md) — not enrolled regression |

## Non-goals

- GitHub Actions (sponsor decision: local runbook only)
- Reopen [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) close_out
- NB-5 or new migration tranches
