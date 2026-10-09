# PLAN — REQ-TIED_VOCABULARY_OWNERSHIP bundle promotion (A4a)

| Phase | Linked plan |
| --- | --- |
| Build | [`vocabulary_bundle_publish_ca6c5a62.plan.md`](/Users/fareed/.cursor/plans/vocabulary_bundle_publish_ca6c5a62.plan.md) |
| Close-out (refined) | [`vocabulary_bundle_close-out_6da0f655.plan.md`](/Users/fareed/.cursor/plans/vocabulary_bundle_close-out_6da0f655.plan.md) |

**Summary:** Promote vocabulary-ownership REQ/ARCH/IMPL + sidecar from `tied-project/` into store `tied-bundle/`, gate in `tools/bootstrap/manifest.json`, extend bootstrap E2E. Do not mirror into client `tied-project/requirements/`.

**profile_depth:** minimal

**Build:** `@build-plan` against the build plan (implementation expected staged).

**Close-out:** `@plan-close-out` against the close-out plan (verification replay → verification gate → evidence sync → close_out gate → CHANGELOG/handoff).

**Last refine-plan:** 2026-10-09 — pre_implementation gate allowed; added Tracker slug sync table, `git add -f` store hygiene, and gitignored-bundle detail risk. Linked plan: [`vocabulary_bundle_close-out_6da0f655.plan.md`](/Users/fareed/.cursor/plans/vocabulary_bundle_close-out_6da0f655.plan.md).

**Close-out (2026-10-09):** `@plan-close-out` completed — `run_id=vocab-a4a-close-20261009`, machine close-out pass (envelope blocking_gaps=0). Handoff: [plan-close-out-handoff.md](./plan-close-out-handoff.md).
