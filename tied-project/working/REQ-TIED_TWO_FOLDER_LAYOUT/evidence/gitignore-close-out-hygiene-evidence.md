# gitignore-close-out-hygiene

Store `.gitignore` managed block: single `tied-bundle/` line (plus harness entries); no `tied-project/` ignore entries. Local-only roots: `tied-bundle/working/`, `tied-bundle/install.json`.

Verified via bootstrap `gitignore-block` tests and G4 audit invariant checks in Phase 7–8.

**Post-close-out (2026-10-03):** Restored four gate-run mutants; untracked `tied-project/working/jev-decide-trace/` (see [gitignore-post-closeout-hygiene.v1.json](gitignore-post-closeout-hygiene.v1.json)).
