# Sponsor decisions (recorded)

**Request:** REQ-TIED_INTENT_CONTROL_PLANE  
**Sessions:** `/unblock` (2026-10-29); routing path recorded (2026-10-29)  
**Plan:** `.cursor/plans/intent_control_plane_req_9e21803c.plan.md`

Sponsor invoked `/unblock` to clear flagged plan choices using documented completion-biased defaults. Override any row by replying in-thread before build-plan lands code.

| Decision | Recorded choice | Ladder | Unblocks |
| --- | --- | --- | --- |
| Write guard placement | **`writeSerializedAtomic`** in `yaml-canonicalizer.ts` (not loader-only) | Costly (selection) | IMPL pseudo-code, RED tests, Wave 1 implementation |
| Marker path | `tied-project/project-identity.v1.yaml` | Reversible | Bootstrap + binding module design |
| Default enforce on writes | `true`; opt-out `identity.write_binding: false` in `tied-project/config.yaml` | Reversible | CITDP migration note + tests for opt-out |
| Bootstrap auto-create marker | **Yes** when missing (install and/or MCP startup before enforce) | Reversible | Wave 0 token mint without chicken-and-egg block |
| MCP path hygiene | **No change required** — `.cursor/mcp.json` already sets `TIED_CLIENT_PROJECT_PATH` to this repo’s `tied-project/` | Reversible | Wave 0 MCP mint in this workspace |
| **Routing policy (Path 2)** | **Wave 1 binding + startup fail-closed:** after marker bootstrap, first base-path resolve (MCP stdio startup or first mutating tool) **rejects** when env/cwd-resolved `getBasePath()` ≠ marker `writable_root` or live `project_id` ≠ marker; keep per-write **`writeSerializedAtomic`** guard; **do not** remove env dual-read ([REQ-TIED_CLIENT_PATH_ENV_MIGRATION](tied-project/requirements/REQ-TIED_CLIENT_PATH_ENV_MIGRATION.yaml)) in Wave 1 | Reversible toward Path 3 (marker-only routing) later | Fail fast before token mint/writes on misconfigured MCP; complements CASE-003 |

**Path 2 scope note:** Env remains valid at **spawn** (e.g. `.cursor/mcp.json`). Wave 1 does **not** ignore `TIED_CLIENT_PROJECT_PATH` at runtime; it **binds** resolved path to marker and fails startup/tools when they diverge. Opt-out `identity.write_binding: false` disables startup + per-write enforcement (brownfield migration).

**Deferred (not Path 2):** Path 3 — marker owns routing; ignore project path env at runtime (LEAP + bootstrap/tied-cli follow-on).

**Still blocked on execution (not sponsor choice):** Tracker copy, CITDP draft on disk, token mint, `pre_implementation` gate — **`/build-plan`** on the linked plan.
