# Test strategy — git worktree × TIED (manual / analysis)

**Slug:** `git-worktree-parallel-tied`  
**Mode:** Manual verification and document QA only—no product RED tests in plan/refine track.

---

## QA checklist (document)

- [x] PLAN.md states **conflict domain** discriminant (not file count).
- [x] All three parallelism modes (human worktree, P6, disposable client) have pick-one guidance.
- [x] Pre-flight and post-merge checklists are copy-paste usable.
- [x] RISK-010 / wrong MCP base path is cited with in-repo anchors.
- [x] Non-goals explicitly exclude REQ minting and feature-orchestration git automation.

---

## Manual scenario A — disjoint REQ merge (low conflict domain)

**Setup:** Two worktrees from same store clone; branches `feature/req-a` and `feature/req-b`.

**Steps:**

1. In tree A, add only `REQ-A` artifacts + code under module A (sponsor-simulated or dry-run file list).
2. In tree B, add only `REQ-B` artifacts + module B.
3. Merge B into A (or PR to integration branch).
4. Run `tied_validate_consistency` and targeted tests once on integrated tree.

**Expected:** Index conflicts absent or trivial; consistency passes if cross-refs are disjoint.

**Fail if:** Duplicate token keys in indexes or consistency reports broken references.

---

## Manual scenario B — same REQ parallel agents (high conflict domain)

**Setup:** Two worktrees on branches both editing `tied-project/working/REQ-FOO/` and `requirements.yaml` for same token.

**Steps:**

1. Make conflicting index edits in both trees without coordination.
2. Attempt merge.

**Expected:** Git conflicts on index files and/or logical inconsistency after forced merge.

**Pass criteria for doc:** PLAN correctly warns **against** this pattern; recommends single stream or orchestrated barriers.

---

## Manual scenario C — wrong MCP base path across worktrees

**Setup:** Primary window MCP points at primary `tied-project/`; second worktree opened **without** fixing `.cursor/mcp.json`.

**Steps:**

1. Call `tied_config_get_base_path` in each window.
2. Attempt MCP index write from second window while cwd is sibling worktree.

**Expected:** Second window either shows wrong path (must fix before write) or writes primary tree (demonstrates RISK-010).

**Pass criteria for doc:** Pre-flight checklist includes MCP verification step.

---

## Manual scenario D — P6 reference (optional, pilot tree)

**Setup:** `cd tools/langgraph-pilot && .venv/bin/pytest -q` (read-only regression that pilot behavior exists).

**Expected:** P6 tests green in CI configuration; no requirement to run multi-task CLI for this plan.

---

## Security / safety

- No automatic `git worktree` in scripts from this plan.
- No credentials or absolute sponsor paths committed beyond illustrative stdd examples in PLAN.