# Program charter — PLAN-TIED-LANGGRAPH-ORCHESTRATION

**Signed (P0 enrollment):** 2026-10-12  
**Linked plan:** [tied-langgraph-orchestration-plan.md](../../../docs/langgraph/tied-langgraph-orchestration-plan.md)

## Costly choices (§5)

| Decision | Resolution |
| --- | --- |
| Runtime spine | Python LangGraph pilot at `tools/langgraph-pilot/` (P1+); agentstream remains default |
| HITL | Autonomous obligation cycles; post-hoc sponsor audit through P7; MCP gates mandatory at verification-bearing close-out |
| Fixture | PROMPT-GF-09 · client `1791767366` · `REQ-BOUNDED_WORKER_POOL` on **fixture** |
| Stdd BOUNDED_WORKER_POOL | **Retained** for future completion (sponsor build-plan 2026-10-12) — not LangGraph fixture substitute |
| P0 vs P1 authority | `p0_enrollment_complete_at` set; `p1_implement_authorized_at` null until sponsor P1 artifact |
| Program CITDP | Required (this enrollment) |

## Fixture three-part contract

1. **Catalog:** PROMPT-GF-09 / TIED-DEMO-09 / CON-01  
2. **Client root:** `/Users/fareed/Documents/dev/test/1791767366`  
3. **Implement REQ (fixture):** `REQ-BOUNDED_WORKER_POOL` with `TIED_BASE_PATH` `/Users/fareed/Documents/dev/test/1791767366/tied-project`

## MCP base-path policy

One Cursor window per target repo. Record `tied_config_get_base_path` before any MCP write. Stdd program edits use stdd `tied-project/`; pilot fixture phases use fixture base path.

## P1 default

`depth_tier: integrated` for scaffold (MCP subprocess I/O + SQLite checkpoints per orchestration plan §7).
