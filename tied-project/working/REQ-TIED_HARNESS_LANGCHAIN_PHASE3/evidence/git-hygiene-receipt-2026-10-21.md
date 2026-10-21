# Git hygiene receipt — REQ-TIED_HARNESS_LANGCHAIN_PHASE3

**Date:** 2026-10-21  
**Tool:** `tied_git_hygiene` · `context_mode: plan_close_out` · `apply: false`

## Phase 3 scoped untracked (stage for traceable commit)

- `tied-project/architecture-decisions/ARCH-TIED_HARNESS_LANGCHAIN_PHASE3.yaml`
- `tied-project/citdp/CITDP-REQ-TIED_HARNESS_LANGCHAIN_PHASE3.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_HARNESS_LANGCHAIN_PHASE3.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_HARNESS_LANGCHAIN_PHASE3-pseudocode.md`
- `tied-project/requirements/REQ-TIED_HARNESS_LANGCHAIN_PHASE3.yaml`
- `tied-project/working/REQ-TIED_HARNESS_LANGCHAIN_PHASE3/` (PLAN, tracker, gates, committed evidence prose)
- `tools/bootstrap/lib/harness-trace-analyzer-skill.test.mjs`
- `tools/bootstrap/lib/methodology-composition-matrix-langchain-row.test.mjs`
- `tools/bundled-prompt-type-skills/harness-trace-analyzer/`

## Phase 3 scoped dirty (include with wave)

- `docs/comparisons/methodology-composition-matrix.md`
- `docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md`
- `tied-bundle/docs/client-development-index.md`
- `tied-bundle/docs/harness-trace-observation-loop.md`
- `tied-bundle/docs/prompt-type-skills.md`
- `mcp-server/src/methodology-production-system-enrollment/constants.ts`
- `mcp-server/src/methodology-production-system-enrollment/methodology-production-system-enrollment.test.ts`
- `mcp-server/src/e2e/prompt-type-skills.test.ts`
- `tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs`
- `tools/bootstrap/manifest.json`
- `tools/bundled-prompt-type-skills/README.md`
- `tied-project/requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml`
- `tied-project/requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml`

## Exclude from Phase 3 commit (other program noise)

- Untracked comparison/docs under `docs/comparisons/cursor-*`, `docs/tools/*`, `docs/visuals/*`
- `tied-bundle/docs/external-service-three-wave-comparison-template.md` unless sponsor expands scope
- EDPC, dogfood, facilitator, unrelated working folders in dirty list

## Regenerable / gitignored close-out artifacts

- `tied-project/working/REQ-TIED_HARNESS_LANGCHAIN_PHASE3/evidence/not-applicable-receipt.v1.json`
- `tied-project/working/REQ-TIED_HARNESS_LANGCHAIN_PHASE3/evidence/request-evidence-envelope.v1.json`
