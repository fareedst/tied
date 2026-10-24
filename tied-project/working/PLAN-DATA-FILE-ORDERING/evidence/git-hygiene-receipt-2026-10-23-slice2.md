# Git hygiene preview — PLAN-DATA-FILE-ORDERING (post slice 2)

- **Tool:** `tied_git_hygiene` [REQ-TIED_GIT_HYGIENE]
- **context_mode:** `agent_preview`
- **apply:** false
- **project_root:** `/Users/fareed/Documents/dev/chatgpt/stdd`
- **branch:** `main` ahead of `origin/main` by **38** commits (includes slice 1 `d293bba1`, slice 2 `9fcaf3ef`, SHA evidence `625f2db3`)

## Committed plan arc (clean relative to slice 2 scope)

Slice 2 implementation + evidence commits are on `main`; do not restage unrelated `tracked_dirty` paths when pushing this arc.

## Untracked (31 paths) — disposition

| Bucket | Paths | Recommendation |
| --- | --- | --- |
| **Build emit (delete)** | `mcp-server/src/*.js`, `mcp-server/src/*.d.ts` (8 files) | Safe to remove locally; regenerate via `npm run build`. Candidate for `tied_git_hygiene` **apply** with `allowed_paths` = exact set. |
| **Slice 2 codemod leftovers (optional commit or delete)** | `migrate-json-slice2.mjs`, `fix-import-in-comment.mjs`, `fix-safe-stringify-templates.mjs` | Keep `migrate-json-slice2-safe.py` (committed); drop or commit siblings intentionally. |
| **Local / private docs** | `docs/visuals/2026-10-20.md` | Keep local; add gitignore if persistent. |
| **Comparison drafts (gitignore-eligible)** | Heimsbakk comparison pair under `docs/comparisons/` | Already covered by suggested `docs/comparisons/*` + negated allowlist; untrack or commit when wave is ready. |
| **In-flight REQ (commit separately)** | `REQ-TIED_OPEN_ONTOLOGIES_WAVE3` tokens + `tied-project/working/REQ-TIED_*` / `DOC-HEIMSBBAKK-*` | Not part of DATA-FILE-ORDERING; own traceable commits. |
| **Misc** | `.bkpdir.yml`, `tied-bundle/docs/external-service-three-wave-comparison-template.md` | Sponsor: commit, ignore, or delete. |

## Tracked dirty (~170 paths) — disposition

| Bucket | Examples | Recommendation |
| --- | --- | --- |
| **Accidental YAML/JSON canonicalization churn** | `tied-bundle/resources/process-certification/*.yaml` (except committed `edse-process-spec` hash line), `tied-bundle/templates/*`, `tied-bundle/reports/source-graph/*` | **Revert** unless tied to an active REQ (`git checkout -- <paths>`). |
| **Multi-REQ working tree noise** | `tied-project/working/**` trackers, gate JSON, claims-evidence JSONL | Revert or commit per REQ; do not mix into plan push. |
| **Unrelated product edits** | `mcp-server/README.md`, `dogfood-chartviewer-cam.mjs` | Revert or separate commit. |
| **Plan folder drift** | `PLAN-DATA-FILE-ORDERING/checklist-tracker-refine.yaml`, handoff md files showing dirty | Diff and either commit intentional tracker updates or restore. |

## Push hygiene

1. Push only when ready: `git push origin main` (38 commits).
2. Before push, consider reverting broad `tied-bundle/` / `tied-project/working/` dirty paths not belonging to commits you intend to publish.
3. Run `tied_git_hygiene` with `apply: true` only after confirming `allowed_paths` matches **exactly** the untracked delete set (typically build emit under `mcp-server/src/`).

## gitignore

- **write_gitignore:** not applied (preview only).
- Sample from tool includes Heimsbakk comparison allowlist entries; no change required for slice 2.

## Apply (2026-10-23 follow-up)

**Note:** `tied_git_hygiene` `apply: true` requires `allowed_paths` to match the **entire** untracked set exactly (deletes all untracked or rejects). That would remove in-flight REQ work (e.g. `REQ-TIED_OPEN_ONTOLOGIES_WAVE3`), so **targeted manual delete** was used instead.

**Removed (11 paths):**

- `mcp-server/src/storage-dump.{js,d.ts}`
- `mcp-server/src/tied-project-config.{js,d.ts}`
- `mcp-server/src/yaml-canonicalizer.{js,d.ts}`
- `mcp-server/src/yaml-dump.{js,d.ts}`
- `mcp-server/src/yaml-style-config.{js,d.ts}`
- `mcp-server/scripts/migrate-json-slice2.mjs`
- `mcp-server/scripts/fix-import-in-comment.mjs`
- `mcp-server/scripts/fix-safe-stringify-templates.mjs`

**Retained:** all other untracked paths (comparisons, Wave 3 tokens, local docs, `.bkpdir.yml`, etc.).
