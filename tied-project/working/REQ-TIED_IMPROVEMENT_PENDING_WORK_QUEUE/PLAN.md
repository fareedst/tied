# PLAN — Primary TIED improvement and maintenance queue

**REQ:** `REQ-TIED_IMPROVEMENT_PENDING_WORK_QUEUE`  
**Source plan:** `tied_improvement_pending_queue_e64493b6.plan.md` (2026-10-21)

## Intent

Define the **primary global TIED improvement and maintenance queue** as private gitignored local data (`tied-bundle/working/TIED-IMPROVEMENT-PENDING-WORK-QUEUE.md`) plus a committed methodology guide refreshed via `tied-install`. Distinct from `tied next`, MCP `tied_backlog`, and LEAP proposal queue.

## Deliverables

- REQ/ARCH/IMPL stack (doc-only; no MCP read/write)
- `tied-bundle/docs/tied-improvement-pending-work-queue.md`
- `tied-bundle/templates/tied-improvement-pending-work-queue.v1.example.md`
- Index, placement, pre-handoff Related docs, working/README, RESUMPTION registration
- Bootstrap test `tied-improvement-pending-work-queue-doc.test.mjs`
- Local queue seed `TIQ-20261021-LANGCHAIN-HARNESS-ARC` (not committed)

## Out of scope

MCP queue tools, mandatory PROC slug, cross-machine sync.
