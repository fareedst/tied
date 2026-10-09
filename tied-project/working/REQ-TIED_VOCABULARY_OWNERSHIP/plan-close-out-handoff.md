# plan-close-out — REQ-TIED_VOCABULARY_OWNERSHIP (A4a)

**Date:** 2026-10-09

## Completion signals

| Signal | Result |
| --- | --- |
| **Machine close-out** | **pass** — gate `close_out` `allowed=true`; envelope validate `fail_on_error_gaps` blocking_gaps=**0**; path=`tied-project/working/REQ-TIED_VOCABULARY_OWNERSHIP/evidence/request-evidence-envelope.v1.json` |
| **Process contract** | **partial** — dual-write clear after sync; manifest present (`verification-evidence-manifest.v1.json`); PSA Layer C **n/a** at minimal depth; **gap:** full `node --test tools/bootstrap/lib/*.test.mjs` reported **6 failures** (claude reroot / parity LEAP.md / methodology boundary — unrelated to A4a); vocabulary slice `verify.test.mjs` and full `npm test --prefix mcp-server` passed |
| **Adherence ledger** | **pass** — reconcile `process_grade` band **A** (score 94); thin_ledger clear for close_out gate; prior reconcile noted missing CITDP/adversarial artifact paths — remediated with working CITDP copy and `sub-adversarial-inquiry-pass-evidence.md` |

**Run id:** `vocab-a4a-close-20261009`  
**Proof:** [closeout-run-close-out-gates-final.json](evidence/closeout-run-close-out-gates-final.json)

## Verification replay

| Check | Result |
| --- | --- |
| `npm run build --prefix mcp-server` | pass |
| `node --test tools/bootstrap/lib/verify.test.mjs` | pass |
| `node --test tools/bootstrap/lib/*.test.mjs` | **6 fail / 92 pass** (see [bootstrap-unit-test.stdout.txt](evidence/bootstrap-unit-test.stdout.txt)) |
| `npm test --prefix mcp-server` | pass (vocabulary E2E in bootstrap-and-load) |
| `scripts/yaml_tool.sh --check` (bundle YAML) | pass (CITDP note: not in canonical style — non-blocking) |
| `tied_validate_consistency` | `ok: true` ([summary](evidence/tied-validate-consistency-summary.json)) |
| Parity A (four promoted paths) | all **matched** ([parity-a-report.json](evidence/parity-a-report.json)) |
| `pseudocode_validate` `IMPL-TIED_FILES` | **not_run** (tied-cli args wiring failed this pass; gate-pseudocode-validation satisfied at build-plan) |

## Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT])

- **Track:** `tied-project/working/REQ-TIED_VOCABULARY_OWNERSHIP/**`
- **Force-add at traceable-commit:** gitignored `tied-bundle/` detail files (four promoted paths) — see refined plan §5
- **Exclude unstaged:** adversarial fixtures, JEV pruning benchmark, checklist gate regression manifest, unrelated methodology checklist churn

## Remaining risks

- **traceable-commit** intentionally **pending** (plan-close-out forbids `git commit` / `git add` here).
- Omitting **`git add -f`** for bundle detail files would ship index rows without on-disk details in git (**costly choice**).
- **Bootstrap lib suite:** sponsor may want a follow-up to fix or waive the six unrelated failures before treating “full bootstrap unit matrix” as green.
- Fleet clients: `tied-install --refresh` after store release.

## Proposed commit message (traceable-commit — not executed here)

```
fix(tied): publish vocabulary ownership into methodology bundle

Promote REQ/ARCH/IMPL vocabulary stack and sidecar into tied-bundle/,
sync REQ-TIED_SETUP cross-refs, and fail closed when manifest-listed
artifacts are missing during bootstrap [REQ-TIED_VOCABULARY_OWNERSHIP].
```

Scoped paths: see [vocabulary_bundle_close-out plan](/Users/fareed/.cursor/plans/vocabulary_bundle_close-out_6da0f655.plan.md) §7 (`git add -f` for four bundle detail files).
