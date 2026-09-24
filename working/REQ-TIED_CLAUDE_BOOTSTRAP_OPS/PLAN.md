# PLAN — REQ-TIED_CLAUDE_BOOTSTRAP_OPS

**Status:** Plan gate (pre-implementation) — 2026-09-23  
**Parent (closed):** [REQ-TIED_CLAUDE_HARNESS](../../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml) — Phase 1 Windows + Phase 3 optional deferrals  
**Sibling:** [REQ-TIED_CLAUDE_LIVE_DRIVER](../../tied/requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) (AgentDriver / fixtures — out of scope here)  
**Refined plan:** `~/.cursor/plans/claude_harness_follow-on_reqs_ec0ae021.plan.md`  
**Sponsor source:** [`docs/comparisons/claude-code-tied-multi-harness-plan.md`](../../docs/comparisons/claude-code-tied-multi-harness-plan.md) (Phase 1 Windows acceptance + Phase 3 optional ergonomics)

## Intent

Close parent **Phase 1 Windows acceptance** and **Phase 3 optional** rows: Windows CI/smoke Claude asserts, **windows_copy_proven_in_ci** symlink unlock, optional **skills/ re-root**, adherence hook spike, and comparison-doc **Current** refresh.

## Scope slices (ordered)

| Slice | Deliverable | Gate |
| --- | --- | --- |
| **B1** | `windows-bootstrap-smoke.cmd` asserts `.claude/skills/` + repo-root `.mcp.json` with `tied-yaml` | Must be green before B2/B3 |
| **B2** | Symlink opt-in when `windows_copy_proven_in_ci: true`; throw when false | After B1 proof |
| **B3** | Optional `skills/` re-root (ARCH + flag + both harnesses + Windows) | Explicit defer OK |
| **B4** | Adherence hook spike → bridge or `not_applicable` | Explicit defer OK |
| **B5** | Comparison plan Current + Post–Phases 0–3 → A/B; fix stale ~L95 claim | Mandatory for B close-out |

**Hard gate:** No symlink or skills re-root merge before `windows_copy_proven_in_ci` is proven.

## Non-goals

- AgentDriver / live stream fixtures ([REQ-TIED_CLAUDE_LIVE_DRIVER])
- Mode B adversarial inquiry TypeScript path fix
- Changing Cursor `.cursor/mcp.json` create-only policy

## Depends on

- `REQ-TIED_CLAUDE_HARNESS`
- `REQ-TIED_SETUP`
- `REQ-PROMPT_TYPE_GLOBAL_SKILLS`
- Related ARCH: `ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM`

## Depth policy

- `depth_tier`: intended **integrated**; Mode B TS gap → `depth_change_waiver` — see CITDP
- `gate_policy`: **advisory**
- `profile_depth`: **integrated** when measured

## Artifacts

| Artifact | Path |
| --- | --- |
| Tracker | `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/checklist-tracker.yaml` |
| CITDP | `tied/citdp/CITDP-REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml` |
| IMPL sidecar | `tied/implementation-decisions/IMPL-TIED_CLAUDE_BOOTSTRAP_OPS-pseudocode.md` |
| Phase 0 | `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/phase0/` |

## Implementation order (build-plan)

1. Phase 0: pilot MCP/skill load checklist + Windows smoke assert list
2. RED B1 Windows smoke Claude asserts → GREEN + proof note
3. B2 symlink gate tests (only after B1 proof)
4. B3/B4 optional / spike
5. B5 comparison doc refresh at close-out

## Non-claims

- Unix unit green ≠ Windows copy proven
- Symlink is not the default install path
- Adherence without spike receipt is not shipped
