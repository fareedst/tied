# Traceable commit — PLAN-EDPC-VERIFY-STATUS-BOUNDARY

**Gap:** G7 `comprehension:req_implementation_status_requires_tied_verify`  
**Prompt:** `@non-tied-plan` G7  
**Commit:** _(record after commit)_

## Staged scope

- `mcp-server/src/edpc/publish-build.ts` — `COMPREHENSION_REQ_STATUS_GAP` on every publish manifest
- `mcp-server/src/edpc/publish-build.test.ts`
- `mcp-server/src/edpc/client-assessment-render.ts` — Implementation status boundary section
- `mcp-server/src/edpc/client-assessment-render.test.ts`
- `docs/stdd-workflows.md` — Verification gaps (implementation status first)
- `tied-bundle/docs/EDPC_Methodology_and_Workflows.md`
- `tied-project/vocab/edpc-comprehension.md` — `[PROC-EDPC_COMPREHENSION]` status table
- `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/tied-project-corpus-map.md`
- `tied-project/working/PLAN-EDPC-VERIFY-STATUS-BOUNDARY/**`
- `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md` (G7 row only)

## Excluded

- Unrelated working-tree noise (fixtures, envelope-gap-report regen, meta-hub handoff, workspace-clear)
