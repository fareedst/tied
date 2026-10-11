# IMPL-TIED_STORE_BUNDLE_GIT_POLICY essence pseudocode

<!-- [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [ARCH-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_WORKING_ARTIFACT_PLACEMENT] -->

```
// [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [ARCH-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
// How: Idempotent store .gitignore merge — STORE LOCAL WORKING block, strip UNDIVIDED MIRROR, remove tied-bundle/ from INSTALL MANAGED only on store profile.
PROCEDURE APPLY_STORE_GITIGNORE_PROFILE(content) -> nextContent
  PRE: content is full .gitignore text
  POST: nextContent contains GITIGNORE_STORE_LOCAL_WORKING_BEGIN..END with tied-bundle/working/ and tied-bundle/install.json
  POST: nextContent has no GITIGNORE_UNDIVIDED_MIRROR_BEGIN block
  POST: INSTALL MANAGED block retains harness paths but no standalone tied-bundle/ line
  POST: unrelated lines and repo-root working/evaluation policy preserved
  EFFECTS: none (pure string transform)
  FAILURE_MODES: none
END PROCEDURE

// [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [ARCH-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
// How: After legacy line collapse, merge store profile without undivided root mirror.
PROCEDURE COLLAPSE_LEGACY_WORKING_GITIGNORE_PATTERNS(content) -> nextContent
  PRE: content is store repo .gitignore
  POST: calls mergeLocalWorkingGitignoreBlock with profile store and undividedMirror false OR delegates to APPLY_STORE_GITIGNORE_PROFILE
  EFFECTS: none (pure)
END PROCEDURE

// [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [ARCH-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
// How: git mv tracked tied-bundle/working pins to fixtures or tied-project/working evidence; record inventory.
PROCEDURE MIGRATE_TRACKED_LOCAL_WORKING(repoRoot, inventoryPath) -> inventory
  PRE: repoRoot is store checkout
  POST: git ls-files tied-bundle/working empty after migration commits
  POST: inventory lists from, to, reason, consumer_refs per moved path
  EFFECTS: git index updates; filesystem moves
  FAILURE_MODES: CONSUMER_REF_UNRESOLVED when pin still referenced at old path
END PROCEDURE

// [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [ARCH-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
// How: CI invariant — index not working tree presence.
PROCEDURE ASSERT_NO_TRACKED_LOCAL_WORKING(repoRoot)
  PRE: repoRoot is store checkout
  POST: returns when git ls-files tied-bundle/working length is 0
  FAILURE_MODES: TRACKED_LOCAL_WORKING_REMAINS with file list
END PROCEDURE
```
