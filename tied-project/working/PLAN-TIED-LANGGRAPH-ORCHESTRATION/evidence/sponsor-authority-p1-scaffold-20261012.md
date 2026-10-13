# Sponsor authority — P1 scaffold

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-12 |
| **Program** | `PLAN-TIED-LANGGRAPH-ORCHESTRATION` |
| **Wave / phase** | **P1 implement** — scaffold and MCP adapter (`tools/langgraph-pilot/`) |
| **Child folder** | [`tied-project/working/PLAN-TIED-LG-P1-SCAFFOLD/`](../PLAN-TIED-LG-P1-SCAFFOLD/) (created by `@plan-new-feature` or linked plan if absent) |
| **Phased spec** | [`docs/langgraph/tied-langgraph-orchestration-plan.md`](../../../../docs/langgraph/tied-langgraph-orchestration-plan.md) § Phase 1 |
| **Orchestrator** | [`../langgraph-program-execution-checklist.yaml`](../langgraph-program-execution-checklist.yaml) |
| **P0 enrollment** | [`charter.md`](./charter.md) · `p0_enrollment_complete_at: 2026-10-12` |
| **Supersedes for implement** | P0 plan-only gate receipt ([`pre_implementation-gate-summary.md`](./pre_implementation-gate-summary.md)) proves enrollment discipline only; **P1 implement** requires this signed record + P1-scoped **`pre_implementation`** on the child CITDP/Tracker. |

## Sponsor statement

The sponsor authorizes **Phase 1 scaffold** implement work in **stdd** (`/Users/fareed/Documents/dev/chatgpt/stdd`):

1. **`@build-plan`** on the P1 linked plan / child folder **`PLAN-TIED-LG-P1-SCAFFOLD/`** per orchestrator `waves.P1.entry_requires`.
2. Create and evolve **`tools/langgraph-pilot/`** as specified in the phased spec §6–§7 Phase 1: `pyproject.toml`, `tied_langgraph/` (`state.py`, `mcp_client.py`, minimal `graphs/`, policy stubs as scoped in child CITDP), **`tests/`** with **mocked MCP JSON-RPC** (no live MCP server required in CI for scaffold exit).
3. **MCP smoke tools (read-only first):** `tied_config_get_base_path`, `yaml_index_read`, `tied_validate_consistency` — invoked via subprocess wrapper (`mcp_client.py`), not ad-hoc project YAML file edits for mutations.
4. **RunState v0** and a minimal **ping → MCP → SQLite checkpoint** graph per phased spec; local run artifacts under regenerable paths only (`tied-bundle/working/…/langgraph/{run_id}/` when applicable).
5. **Depth / gates:** Child implement CITDP uses **`depth_tier: integrated`** (default per [charter](./charter.md)) and **`gate_policy: per_citdp`**. Run **`tied_checklist_gate_validate`** **`pre_implementation`** on **P1 scope** before RED/production pilot behavior beyond scaffold tests.

**Explicit proceed phrase (required):** Proceed Phase 1 scaffold in stdd per PLAN-TIED-LG-P1-SCAFFOLD.

**Sponsor signature / role:** Program sponsor · Cursor chat session (2026-10-12)

## Boundaries (still forbidden)

| Boundary | Rationale |
| --- | --- |
| **Fixture implement** (`REQ-BOUNDED_WORKER_POOL` on client `1791767366`) | Phases **3–6** on fixture; P1 is stdd pilot scaffold only |
| **Completing stdd `REQ-BOUNDED_WORKER_POOL` product code** | Retained for future completion ([`scope-hygiene-evidence.md`](./scope-hygiene-evidence.md)); not a substitute for fixture proof |
| **Edits to methodology YAML under `tied-bundle/`** | Separate sponsor methodology change + LEAP path |
| **Weakening MCP / verification gates for pilot throughput** | Program charter §5 — forbidden |
| **Mutating TIED project YAML via raw file edits** | Use MCP / `tied-cli` when tools exist ([Phase 1 forbidden note](../../../../docs/langgraph/tied-langgraph-orchestration-plan.md)) |
| **Assuming P0 `pre_implementation allowed: true` authorizes P1 RED** | P0 was plan-only enrollment |

## MCP base-path policy (affirmed)

| Target | `TIED_BASE_PATH` |
| --- | --- |
| Stdd program + pilot scaffold | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` |
| Fixture phases (P3+) | `/Users/fareed/Documents/dev/test/1791767366/tied-project` |

One Cursor window per target repo; agent records `tied_config_get_base_path` before MCP writes.

## Pre-approved hinges (P1 scaffold)

| Hinge | Value |
| --- | --- |
| `p1_scope` | `implement_scaffold_mcp_adapter` |
| `p1_depth_tier` | `integrated` |
| `p1_child_folder` | `tied-project/working/PLAN-TIED-LG-P1-SCAFFOLD/` |
| `p1_exit_criterion` | `pytest` / `uv run pytest` green under `tools/langgraph-pilot/tests/`; no product behavior change outside pilot tree |
| `p1_ci_job` | optional stub; **non-blocking** until Phase 4 |
| `p1_ci_blocking` | `false` |
| `integrated_waiver` | `none` |
| `canonical_promotion` | `leap_plus_sponsor_methodology_change` (unchanged) |

## Costly choices (re-affirmed from P0 charter)

| Choice | P1 treatment |
| --- | --- |
| Runtime spine | Python LangGraph at `tools/langgraph-pilot/`; agentstream remains default elsewhere |
| HITL | Autonomous obligation cycles; post-hoc sponsor audit through P7 |
| Fixture contract | Unchanged — PROMPT-GF-09 / client `1791767366` / fixture `REQ-BOUNDED_WORKER_POOL` for later waves |

## Agency boundary

This file authorizes **P1 implement intent** in the program orchestrator (`waves.P1`, `p1_implement_authorized_at`). It does **not** replace:

- A fresh **P1** Tracker copy and persisted **child CITDP**,
- Successful **P1-scoped** **`pre_implementation`** gate on that scope,
- **`sub-adversarial-inquiry-pass`** when integrated depth triggers match the child CITDP,
- Phase **2–7** waves (each gated by orchestrator + evidence).

## Request trace

- Sponsor request (2026-10-12): *proceed to sign* (following draft of `sponsor-authority-p1-scaffold-TEMPLATE.md`).
