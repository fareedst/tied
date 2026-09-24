# PLAN — REQ-TIED_CLAUDE_LIVE_DRIVER

**Status:** Plan gate (pre-implementation) — 2026-09-23  
**Parent (closed):** [REQ-TIED_CLAUDE_HARNESS](../../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml) — Phases 0–3 shipped; live AgentDriver deferred  
**Refined plan:** `~/.cursor/plans/claude_harness_follow-on_reqs_ec0ae021.plan.md`  
**Sponsor source:** [`docs/comparisons/claude-code-tied-multi-harness-plan.md`](../../docs/comparisons/claude-code-tied-multi-harness-plan.md) (sponsor log + Open discovery CLI rows + Phase 2)

## Intent

Deliver the **live** half of comparison-plan **Phase 2** / parent `SC-CLAUDE-P2-AGENTSTREAM`: Claude **AgentDriver**, frozen **Claude stream oracles** under `mcp-server/packages/agentstream/fixtures/claude/`, **live-executor** composition for `harness=claude`, and README **CLI pin** + **dry vs live** table.

Parent already shipped `--harness claude` **dry-run** only. This REQ owns the live clause via `related_to` + CITDP LEAP note — **do not** silently rewrite the closed parent Tracker or satisfaction text.

## Scope

| In | Out |
| --- | --- |
| AgentDriver Claude module + parsers | Live Claude subprocess in CI |
| Oracles under `fixtures/claude/` | `--agent-path` as harness selector |
| live-executor composition (mocked in CI) | Mode B adversarial inquiry TS fix |
| README pin + dry vs live table | Bootstrap / Windows / symlink / skills re-root (REQ B) |

## Depends on

- `REQ-TIED_CLAUDE_HARNESS` (dry-run harness select, dual bootstrap)
- `REQ-GOAGENT-AGENT-EXECUTOR` (executor / receipt contracts)

## Depth policy

- `depth_tier`: intended **integrated**; Mode B TS gap → `depth_change_waiver` (same pattern as parent) — see CITDP
- `gate_policy`: **advisory**
- `profile_depth`: **integrated** (evidence-chain) when measured; else record `not_measured`

## Artifacts

| Artifact | Path |
| --- | --- |
| Tracker | `working/REQ-TIED_CLAUDE_LIVE_DRIVER/checklist-tracker.yaml` |
| CITDP | `tied/citdp/CITDP-REQ-TIED_CLAUDE_LIVE_DRIVER.yaml` |
| IMPL sidecar | `tied/implementation-decisions/IMPL-TIED_CLAUDE_LIVE_DRIVER-pseudocode.md` |
| Phase 0 | `working/REQ-TIED_CLAUDE_LIVE_DRIVER/phase0/` |

## Implementation order (build-plan)

1. Phase 0: promote contract draft rows; lock oracle filenames under `fixtures/claude/`
2. RED unit: `PARSE_CLAUDE_STREAM` / `EXTRACT_CLAUDE_SESSION` against oracles
3. RED unit: `SELECT_LIVE_DRIVER` / `CLAUDE_AGENT_DRIVER` factory
4. RED composition: `BIND_LIVE_EXECUTOR_CLAUDE` with mocked subprocess
5. GREEN + README pin / dry-vs-live table
6. Regression: dry-run `--harness claude`; `--agent-path` independent of harness

## Non-claims

- Dry-run green ≠ live parity
- Cursor oracles are not Claude fixtures
- No live Claude in CI for v1
