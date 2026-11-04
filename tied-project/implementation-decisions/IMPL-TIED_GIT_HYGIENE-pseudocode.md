# [IMPL-TIED_GIT_HYGIENE] [ARCH-TIED_GIT_HYGIENE_SAFETY] [REQ-TIED_GIT_HYGIENE] — Preview-first git hygiene with guarded apply.

Grammar-Version: v2

## Git hygiene

procedure CLASSIFY_GIT_PORCELAIN:
  # [IMPL-TIED_GIT_HYGIENE] [ARCH-TIED_GIT_HYGIENE_SAFETY] [REQ-TIED_GIT_HYGIENE] How: parse git status --porcelain; split untracked vs tracked; reject tracked deletion targets.
  Contract:
    INPUT: project_root
    OUTPUT: { untracked: string[], tracked_dirty: string[] }
    PRE: project_root is git work tree
    POST: paths repository-relative
    EFFECTS: pure
  CALL git status --porcelain
  RETURN classification

procedure PREVIEW_GIT_HYGIENE:
  # [IMPL-TIED_GIT_HYGIENE] [ARCH-TIED_GIT_HYGIENE_SAFETY] [REQ-TIED_GIT_HYGIENE] How: default mode; suggest gitignore merge via bootstrap working-gitignore helper without writing.
  Contract:
    INPUT: { context_mode: checklist | plan_close_out | agent_preview }
    OUTPUT: { preview: object, would_write_gitignore: boolean }
    PRE: apply is false or absent
    POST: never mutates filesystem
    EFFECTS: pure
  CALL CLASSIFY_GIT_PORCELAIN
  CALL mergeLocalWorkingGitignoreBlock on in-memory gitignore sample
  RETURN preview bundle

procedure APPLY_GIT_HYGIENE:
  # [IMPL-TIED_GIT_HYGIENE] [ARCH-TIED_GIT_HYGIENE_SAFETY] [REQ-TIED_GIT_HYGIENE] How: require apply true and allowed_paths exact set; delete untracked only; optional gitignore write.
  Contract:
    INPUT: { apply: true, allowed_paths: string[], write_gitignore?: boolean }
    OUTPUT: { deleted: string[], skipped: string[] }
    PRE: allowed_paths equals candidate untracked set exactly
    POST: tracked paths never deleted
    FAILURE_MODES: tracked_deletion_rejected, allowlist_mismatch
    DATA: workspace untracked files and optional gitignore text
    DATA_TRANSITION: untracked files present to removed; gitignore optional update
    EFFECTS: IO
  IF any path tracked THEN RETURN error tracked_deletion_rejected
  DELETE only untracked paths in allowlist
  IF write_gitignore THEN persist merged block
  RETURN result

procedure REGISTER_TIED_GIT_HYGIENE_MCP:
  # [IMPL-TIED_GIT_HYGIENE] [ARCH-TIED_GIT_HYGIENE_SAFETY] [REQ-TIED_GIT_HYGIENE] How: tied_git_hygiene MCP tool; composition tests guard destructive apply args.
  Contract:
    INPUT: MCP args
    OUTPUT: JSON diagnostic
    PRE: true
    POST: preview unless explicit apply contract satisfied
    EFFECTS: pure
  IF apply THEN CALL APPLY_GIT_HYGIENE ELSE CALL PREVIEW_GIT_HYGIENE
  RETURN JSON

procedure RUN_STORE_TEST_ALL_HYGIENE:
  # [IMPL-TIED_GIT_HYGIENE] [ARCH-TIED_GIT_HYGIENE_SAFETY] [REQ-TIED_GIT_HYGIENE] How: scripts/build-commands.sh test-all-hygiene restores tracked test-all churn and deletes known gate-test CITDP litter; complements MCP, does not commit.
  Contract:
    INPUT: { dry_run?: boolean, project_root: store checkout root }
    OUTPUT: { restored: string[], deleted_untracked: string[], skipped: string[] }
    PRE: git work tree; allowlists frozen in build-commands.sh; tracked paths never rm -f
    POST: no git commit or push; dry_run makes no filesystem changes
    FAILURE_MODES: skip_delete_when_tracked
    DATA: restore_paths; delete_untracked basenames under tied-project/citdp/
    EFFECTS: IO
  FOR EACH tracked path IN restore_paths WHEN indexed THEN git restore
  FOR EACH litter path IN delete_untracked WHEN present AND untracked THEN rm -f
  RETURN summary diagnostics
