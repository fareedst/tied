# Wave 4 unit tests — REQ-TIED_DURABLE_CHECKLIST_CONTROLLER

**Date:** 2026-10-30

| Command | Result |
| --- | --- |
| `npx tsx --test mcp-server/src/checklist-controller-resume.test.ts` | green (5 cases) |
| `npm test --prefix mcp-server/packages/agentstream` (includes `apply-resume-from-tracker.test.ts`) | green after DryRunConfig field parity fixes |

**Scope:** `deriveChecklistResumePlan`, `applyResumeFromTracker`, MCP `tied_checklist_controller_resume_plan` registration (tool count 93 core).
