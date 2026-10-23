# IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE essence pseudocode

<!-- [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [ARCH-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE] -->

```
// [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [ARCH-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
// How: Map EXPANDED_LOCAL_WORKING_GITIGNORE_GLOBS tied-bundle/working/* → tied-project/working/* for store committed root.
PROCEDURE BUILD_COMMITTED_WORKING_REGENERABLE_GLOBS() -> globs
  PRE: EXPANDED_LOCAL_WORKING_GITIGNORE_GLOBS loaded
  POST: every tied-bundle/working/ glob has tied-project/working/ mirror; existing tied-project entries preserved
  EFFECTS: none (pure)
END PROCEDURE

// [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [ARCH-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
// How: Idempotent managed block GITIGNORE_COMMITTED_WORKING_REGENERABLE in store .gitignore; preserve EDPC negations.
PROCEDURE APPLY_COMMITTED_WORKING_HYGIENE_PROFILE(content) -> nextContent
  PRE: content is store .gitignore text
  POST: managed COMMITTED WORKING REGENERABLE block present with buildCommittedWorkingRegenerableGlobs()
  POST: applyStoreGitignoreProfile still applied
  EFFECTS: none (pure string transform)
END PROCEDURE

// [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [ARCH-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
// How: evidence/gate-*, pre_implementation-*, verification-*, close_out-* and /gate- segments → local working root.
PROCEDURE CLASSIFY_WORKING_RELATIVE_PATH(relativePath) -> kind
  PRE: relativePath is posix path under REQ working folder
  POST: evidence gate JSON artifacts return local; facet *-evidence.md remain committed
  EFFECTS: none (pure)
END PROCEDURE

// [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [ARCH-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
// How: Read-only git ls-files classification → migration-inventory.v1.json buckets keep|untrack|relocate_fixture.
PROCEDURE INVENTORY_COMMITTED_WORKING_REGENERABLE(repoRoot) -> inventory
  PRE: repoRoot is store checkout
  POST: inventory lists every tracked tied-project/working path with bucket and reason
  EFFECTS: writes JSON under REQ working evidence
END PROCEDURE

// [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [ARCH-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
// How: git rm --cached untrack bucket; git mv relocate_fixture; on-disk files retained for untrack.
PROCEDURE MIGRATE_TRACKED_COMMITTED_WORKING_REGENERABLE(repoRoot, inventory) -> report
  PRE: sponsor approved wave migration
  POST: git index matches keep bucket + allowlist; fixtures at mcp-server/test/fixtures/committed-working/
  EFFECTS: git index updates; optional git mv for fixtures
  FAILURE_MODES: CONSUMER_REF_UNRESOLVED when test still expects old tracked path
END PROCEDURE
```
