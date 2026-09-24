# PLAN — REQ-TIED_CLAUDE_SKILLS_REROOT (R3)

**Slice:** Optional repo-root `skills/` re-root (CONFIG_SKILLS_REROOT / deferred B3)  
**Authority:** `working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md` R3 row

## Acceptance

- `TIED_SKILLS_REROOT` env flag, default off
- Both Cursor and Claude honor `repo_root/skills/` when enabled + gates pass
- `REROOT_WITHOUT_WINDOWS_PROOF` / `REROOT_WITHOUT_ARCH` when flag on without prerequisites
- Tests in `claude-harness.test.mjs`; Windows assert reroot-aware
- Docs + CHANGELOG + R3 complete in DOC_REMAINDER plan
