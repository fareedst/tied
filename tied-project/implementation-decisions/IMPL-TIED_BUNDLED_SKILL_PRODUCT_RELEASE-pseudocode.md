# [IMPL-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [ARCH-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] — Bundled skill product release harness (slices A–F).

Grammar-Version: v2

## SLICE_A_MANIFEST_AND_GUIDE

- [IMPL-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [ARCH-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] Define BUNDLED_SKILL_RELEASE_CATALOG and operator methodology doc.
- Contract:
  - INPUT: manifest PROMPT_TYPE_SKILL_DIRS, BUNDLED_STANDALONE_CLIENT_SKILLS, STORE_FACILITATOR_SKILLS; tied-yaml storeDir
  - PRE: pre_implementation gate allowed
  - OUTPUT: manifest.json catalog key + tied-bundle/docs/bundled-skill-product-release.md
  - POST: Doc states proof boundary (eval stub ≠ Q1); semver quoted-string rule
  - EFFECTS: New skills must register in catalog before merge

## SLICE_B_VALIDATE_RELEASE_CONTRACT

- [IMPL-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [ARCH-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] RED then GREEN shared validator and e2e enforcing semver, atomic eval suite, report staleness.
- Contract:
  - INPUT: catalog paths; behavioral file hash algorithm
  - PRE: RED tests committed and failing
  - OUTPUT: skill-product-release-validate.mjs | { error: semver_invalid | suite_compound | report_stale }
  - POST: Validator importable from bootstrap tests and mcp-server e2e
  - FAILURE_MODES: missing_catalog_entry → fail closed; unquoted semver coerced to number in YAML → reject
  - EFFECTS: No MCP or checklist slug changes

## SLICE_C_BASELINE_SKILL_TREES

- [IMPL-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [ARCH-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] Seed metadata.version 1.0.0 and minimal evals/ per catalog entry.
- Contract:
  - INPUT: ALL bundled SKILL.md paths from catalog
  - PRE: Slice B validator defines required tree shape
  - OUTPUT: Frontmatter metadata.version + evals/suite.v1.yaml + evals/reports/latest.json
  - POST: latest.json content_hash matches behavioral files at HEAD; skill_version matches frontmatter
  - EFFECTS: prompt-type-skills frontmatter parse still passes

## SLICE_D_CI_STAGED_EVALS

- [IMPL-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [ARCH-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] Wire fast validators on PR; optional heavy /run-evals workflow non-blocking.
- Contract:
  - INPUT: BASE_SHA..HEAD diff; behavioral path globs from test-strategy
  - PRE: Slice C baselines exist
  - OUTPUT: check script for version bump; bundled-skill-run-evals.yml
  - POST: Default CI runs static validators only; heavy path SKIPPED_NO_FIXTURE allowed
  - TERMINATION: Workflow exits 0 with skip reason when no fixtures
  - EFFECTS: Does not add required status check without sponsor promotion

## SLICE_E_COMPOSE_DOCS

- [IMPL-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [ARCH-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] Update Google Wave 2 phased recommendations table; cross-link methodology doc from prompt-type-skills.md.
- Contract:
  - INPUT: docs/comparisons/google-agent-skills-vs-tied-agent-management.md phased table
  - PRE: No REQ/ARCH/IMPL tokens minted in comparison prose
  - OUTPUT: Phase 3–5 marked in-progress/done with REQ link
  - POST: Operator-local comparisons unchanged for gitignore policy

## SLICE_F_VERIFY_AND_SYNC

- [IMPL-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [ARCH-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] [REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE] Run tied_validate_consistency, verification gate, vocab RECORD for bundled skill product release terms.
- Contract:
  - INPUT: Green test battery from test-strategy.md
  - PRE: All slices A–E complete
  - OUTPUT: gates/verification receipt; CITDP record_status complete
  - POST: REQ satisfaction criteria met per SC-* ids
