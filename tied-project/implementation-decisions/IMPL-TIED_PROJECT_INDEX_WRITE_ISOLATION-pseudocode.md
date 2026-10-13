Grammar-Version: v2

# [IMPL-TIED_PROJECT_INDEX_WRITE_ISOLATION] [ARCH-TIED_PROJECT_INDEX_WRITE_ISOLATION] [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION]
# Project index mutations persist only touched project keys; merged view is read-only.

## MUTATE_PROJECT_INDEX

Contract:
  INPUT: index (IndexName), operation (insert|update|upsert), token (string), payload (record)
  PRE: TIED_BASE_PATH resolves to tied-project/
  OUTPUT: { ok: true } | { ok: false, error: string }
  POST:
    success => on-disk project index contains only prior project keys plus at most the touched token key
    error => project index file unchanged
  FAILURE_MODES: TokenAlreadyExists, TokenNotFound, WriteFailed
  EFFECTS: IO, State
  DATA: projectIndexMap (map), methodologyIndexMap (read-only)
  DATA_TRANSITION: on success, projectIndexMap[token] := merged or new row; no other methodology keys added
  TERMINATION: total

# How: clone loadProjectIndex; never assign loadIndex() map to disk.
CLONE_PROJECT_INDEX(index):
  RETURN shallow copy of loadProjectIndex(index) or {}

# How: insert rejects project duplicate and methodology name collision for new client tokens.
INSERT_PROJECT_INDEX_TOKEN(index, token, record):
  project := CLONE_PROJECT_INDEX(index)
  IF project has token: RETURN TokenAlreadyExists
  IF isTokenInMethodology(index, token): RETURN TokenAlreadyExists
  project[token] := record
  RETURN writeProjectIndexMap(index, project)

# How: update/upsert promote one override row from methodology snapshot when token is methodology-only.
UPDATE_PROJECT_INDEX_TOKEN(index, token, updates):
  existing := mergedRecordForToken(index, token)
  IF NOT existing: RETURN TokenNotFound
  project := CLONE_PROJECT_INDEX(index)
  project[token] := mergeRecordUpdate(existing, updates)
  RETURN writeProjectIndexMap(index, project)

## DETECT_METHODOLOGY_INDEX_DUPLICATION

Contract:
  INPUT: project and methodology indexes per IndexName
  PRE: true
  OUTPUT: ref_issues[] with kind methodology_index_duplicated_in_project
  POST: identical project row vs methodology row => issue emitted; differing row => no issue
  EFFECTS: pure
  TERMINATION: total

# How: advisory consistency scan; override rows that differ are kept.
SCAN_DUPLICATE_ROWS(index):
  FOR token IN project keys:
    IF token in methodology AND JSON payloads equal: EMIT duplication issue

## PRUNE_METHODOLOGY_DUPLICATES

Contract:
  INPUT: dryRun (boolean), four standard indexes
  PRE: dryRun default true
  OUTPUT: report of removable tokens
  POST: --write removes only identical duplicates; override rows preserved
  EFFECTS: IO when write
  TERMINATION: total

# How: delete project keys whose payload equals methodology payload.
PRUNE_INDEX(name, dryRun):
  FOR each duplicate token: DELETE from project map when not dryRun

## CHECK_DOCS_VOCAB_LINKS_EXPAND

Contract:
  INPUT: repoRoot (absolute path)
  PRE: repoRoot is client or store project root
  OUTPUT: { ok: boolean, broken: { file, target, resolved }[] }
  POST: ok true iff every relative markdown link in live agent doc surfaces resolves on disk
  EFFECTS: read-only IO
  TERMINATION: total

# [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION] [IMPL-TIED_PROJECT_INDEX_WRITE_ISOLATION] [REQ-TIED_TWO_FOLDER_LAYOUT]
# How: walk DOC_LINK_SCAN_ROOTS (.md trees + AGENTS.md); reuse remapStoreBundleDocLink for bundle-doc relative targets.
COLLECT_DOC_LINK_SCAN_FILES(repoRoot):
  FOR rel IN DOC_LINK_SCAN_ROOTS:
    IF rel is file AND ends with .md: INCLUDE
    ELSE: walk directory for *.md under rel
  RETURN sorted unique relative paths

VERIFY_DOC_LINKS(repoRoot):
  broken := []
  FOR each markdown file from COLLECT_DOC_LINK_SCAN_FILES:
    FOR each ](target) link:
      IF resolveMarkdownLink fails: APPEND broken entry
  RETURN { ok: broken empty, broken }

## LINT_AGENT_DOC_CORPUS

Contract:
  INPUT: repoRoot, optional roots override
  PRE: Tier B agent markdown uses tied-project/ writable boundary prose where yaml_index_* is taught
  OUTPUT: lintStaleLayoutReferences result on LIVE_SURFACE_ROOTS including tied-bundle/docs
  POST: ok true when no non-allowlisted stale path patterns (e.g. tied/docs/) remain on live surfaces
  EFFECTS: read-only IO
  TERMINATION: total

# [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION] [IMPL-TIED_PROJECT_INDEX_WRITE_ISOLATION] [REQ-TIED_TWO_FOLDER_LAYOUT]
# How: extend LIVE_SURFACE_ROOTS with tied-bundle/docs after Tier B path rewrites; allowlist only intentional migration history.
LINT_AGENT_DOC_CORPUS(repoRoot):
  roots := LIVE_SURFACE_ROOTS including tied-bundle/docs
  RETURN lintStaleLayoutReferences(repoRoot, { roots })
