# Process and prologue (plan-close-out / leap-diff-promote / ammend-commit)

## Process

1. Vocab: `./tied/vocab/routing.md` -> dispatch to `./tied/methodology/vocab/routing.md` -> PRELOAD only the matched client or methodology glossary -> RECORD new terms in the owning layer.
2. TIED: Update related IMPL pseudocode (block token comments); mirror reasoning in staged code and tests. Guides: `pseudocode-writing-and-validation.md`, `pseudocode-validation-checklist.yaml`.
3. LEAP: Propagate IMPL -> ARCH -> REQ -> Vocab for any drift (`LEAP.md`). Changes to IMPL, ARCH, REQ must be accounted for in an existing CITDP plan or one is created and executed.
4. Tests: Confirm unit, composition, and E2E coverage for the staged work.
5. Gitignore close-out hygiene — [gitignore-close-out-hygiene.md](gitignore-close-out-hygiene.md) ([PROC-GITIGNORE_CLOSE_OUT]): from caller git context only (no agent-initiated git), review ephemeral untracked artifacts; apply unstaged `.gitignore` additions or propose patterns; record N/A when clean.
6. **CALL `sub-close-out-evidence-sync`** (Wave 5): sync dispositions from
   `execution_evidence.completed`, collect verification manifest when tests ran,
   reconcile with `include_process_grade: true`, then rebuild/validate envelope.
   Do not write naked `execution_evidence.completed` updates without matching
   `steps[].tracking.status` dispositions in the same pass.
7. Before writing CHANGELOG or claiming completion, call
   `tied_checklist_gate_validate` with `phase: close_out`, the final Tracker,
   CITDP, and identity-bound activation evidence when `depth_tier` is
   `integrated` or `strict_candidate` (prefer `tied_checklist_activation_collect`
   when phase artifact dirs exist). **Unified close-out (Wave 1):** also run
   `request_evidence_envelope_validate` with `fail_on_error_gaps: true` on
   `working/{REQ-TOKEN}/evidence/request-evidence-envelope.v1.json`, or use
   `tools/bootstrap/templates/run-close-out-gates.mjs --envelope-blocking`.
   At integrated depth, `--envelope-blocking` also applies process-strict validate
   (Wave 6). Completion requires gate `allowed: true` **and** zero blocking
   envelope gaps (structural errors always; process warn gaps at integrated
   close-out). Return the three completion signals per
   [completion-signals-handoff.md](completion-signals-handoff.md). If either
   check fails, label the work **incomplete** — do not claim completion.

## Prologue (standard close-out / diff-promote)

7. `./CHANGELOG.md`: brief summary.
8. Propose a commit message per `commit-guidelines.md`. **Do not commit.**

## Prologue (ammend-commit)

7. `./CHANGELOG.md`: brief summary.
8. Propose a commit message per `commit-guidelines.md` for the ammended commit. **Do not commit.**
