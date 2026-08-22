# Process and prologue (plan-close-out / leap-diff-promote / ammend-commit)

## Process

1. Vocab: `./tied/vocab/routing.md` -> dispatch to `./tied/methodology/vocab/routing.md` -> PRELOAD only the matched client or methodology glossary -> RECORD new terms in the owning layer.
2. TIED: Update related IMPL pseudocode (block token comments); mirror reasoning in staged code and tests. Guides: `pseudocode-writing-and-validation.md`, `pseudocode-validation-checklist.yaml`.
3. LEAP: Propagate IMPL -> ARCH -> REQ -> Vocab for any drift (`LEAP.md`). Changes to IMPL, ARCH, REQ must be accounted for in an existing CITDP plan or one is created and executed.
4. Tests: Confirm unit, composition, and E2E coverage for the staged work.

## Prologue (standard close-out / diff-promote)

5. `./CHANGELOG.md`: brief summary.
6. Propose a commit message per `commit-guidelines.md`. **Do not commit.**

## Prologue (ammend-commit)

5. `./CHANGELOG.md`: brief summary.
6. Propose a commit message per `commit-guidelines.md` for the ammended commit. **Do not commit.**
