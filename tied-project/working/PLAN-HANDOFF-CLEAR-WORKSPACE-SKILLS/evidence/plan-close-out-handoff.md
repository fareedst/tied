# plan-close-out handoff — handoff + clear-workspace program

**Run:** 2026-10-18 · **prompt-type:** plan-close-out · **depth:** minimal · **gate_policy:** advisory

## Deliverables

| Artifact | Path |
| --- | --- |
| CHANGELOG | [CHANGELOG.md](../../../CHANGELOG.md) (Unreleased ### Added) |
| Proposed commit | [proposed-commit-message.txt](proposed-commit-message.txt) |
| Git hygiene | [git-hygiene-receipt-2026-10-18.md](git-hygiene-receipt-2026-10-18.md) |
| Gate — handoff REQ | [closeout-run-close-out-gates.json](../../REQ-TIED_SESSION_HANDOFF_SKILL/evidence/closeout-run-close-out-gates.json) |
| Gate — clear-workspace REQ | [closeout-run-close-out-gates.json](../../REQ-TIED_CLEAR_WORKSPACE_SKILL/evidence/closeout-run-close-out-gates.json) |
| Traceable-commit prep | [traceable-commit-evidence.md](traceable-commit-evidence.md) |

## Verification (this pass)

- `node --test tools/bootstrap/lib/client-skills-catalog.test.mjs` — 4/4 pass ([stdout](client-skills-catalog.stdout.txt))
- `node --test tools/bootstrap/lib/install-layers-core.test.mjs` — 1/1 pass ([stdout](install-layers-core.stdout.txt))
- `npm test -- client-bootstrap-skills` — exit 0 ([stdout](client-bootstrap-skills.stdout.txt))
- `npm test -- prompt-type-skills` — exit 0 ([stdout](prompt-type-skills.stdout.txt))
- `tied_validate_consistency` — ok
- `run-close-out-gates.mjs` ×2 — `merged_decision.allowed=true`, envelope `blocking_gap_count=0`

## Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT])

**N/A (already covered)** — Regenerable envelopes and close-out JSON remain under `.gitignore` lines 89+ (`tied-project/working/**/evidence/request-evidence-envelope.v1.json`); committed process evidence is PLAN, CITDP, handoff markdown, and `tied-project/citdp/` copies. No new patterns required for this tranche.

## Completion signals

- **Machine close-out:** pass — gate `close_out` allowed=true (both REQs); envelope validate fail_on_error_gaps=true blocking_gaps=0; paths under each REQ `evidence/request-evidence-envelope.v1.json` (gitignored regenerable)
- **Process contract:** pass — dual-write via `--sync-dispositions`; verification manifests present; PSA Layer C n/a (no impl inventory tests); profile=minimal
- **Adherence ledger:** pass — reconcile process_grade band **A** (both REQs); thin_ledger=clear

## Remaining risks

- **traceable-commit** slug pending until sponsor requests commit
- Linked clients: run `./tied-install.sh --refresh` to materialize `.cursor/skills/handoff` and `clear-workspace`

## Sponsor next step

Review [proposed-commit-message.txt](proposed-commit-message.txt) and [traceable-commit-evidence.md](traceable-commit-evidence.md); ask for **commit** to run checklist `traceable-commit`.
