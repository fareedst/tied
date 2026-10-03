# Planning notes — REQ-TIED_UNIFIED_TOOLCHAIN

## Refine resolutions (2026-09-22)

| Topic | Resolution | Sponsor confirmation |
| --- | --- | --- |
| Repository scope | TIED **source** repo (`stdd`) developer/operator tooling only | Confirmed |
| Client scope | Clients consume built artifacts + bootstrap; no mandate to unify client app stacks | Confirmed |
| Distribution | **Umbrella CLI** brand **`tied`** with subcommands (`mcp`, `agentstream`, `bootstrap`, `yaml`, …) | Confirmed |
| CLI brand | Operator-facing command name **`tied`** (not separate product names per tool) | Confirmed |
| Binaries vs monolith | npm/pnpm **workspace**; one `npm run build` produces MCP + CLIs | Confirmed |
| Monorepo root | **Expand `mcp-server/`** as workspace root (not `tools/tied-suite/` as primary) | Confirmed |
| Node runtime | **User-installed Node ≥18** for Phases 1–3; Phase 4 embedded runtime optional evaluation only—not committed | Confirmed |
| Bun | **Allowed only if CI proves** MCP + tests compatible; **Node canonical** for docs and release | Confirmed |
| Installers | Documented build + PATH; native `.pkg`/MSI deferred | Confirmed |
| Ruby `tools/agent-stream/` | **Deprecate** after parity checklist; remove Phase 4 | Confirmed |
| Go `tools/agentstream/` | **Strangler port** to TS; keep shipping Go until TS gate parity | Confirmed |
| Ruby adherence / hook bridges | **Port to TypeScript** with suite (e.g. `adherence_append_action_attempted`); not indefinite Ruby | Confirmed |

## profile_depth

- `depth_tier`: **`integrated`** (sponsor confirmed 2026-09-22; effective Phase 3b **slice 2+**)
- `prior_depth_tier`: **`minimal`** (slice 1 planning + close-out arc)
- `gate_policy`: **advisory**
- Rationale: Remaining strangler work (executor, pipeline, checklist render, adherence) targets checklist/adherence parity and subprocess orchestration—integrated adversarial inquiry per AGENTS §3.3.1 for slice 2+.

## Git / release policy (2026-09-22 → 2026-09-23)

- **Push deferred** until **Phase 3b complete** (slices **2a–2d**) — **satisfied** 2026-09-23.
- **origin/main:** `a23d939` (slice 1) + **`fbe65e197d456b4dce8a9d062b112f4155d9ce36`** (2a–2d + close_out evidence).

## Unified Phase 3b close_out (2026-09-23)

- **Milestone:** slices **2a–2d** qualified TS surface; unified `close_out` with inquiry `slice3b-close-out-2026-09-23`.
- **Committable gate receipt:** [phase3b-full-close-out-gate.json](./phase3b-full-close-out-gate.json).
- **Post-push:** Re-ran close-out runner with `--run-id slice3b-close-out-2026-09-23`; `allowed: true`, envelope blocking gaps **0** (advisory diagnostics remain).
- **REQ status:** remains **In Progress** — Phase 4 (Go/Ruby removal, live executor TS-default) not in scope.
- **Vocabulary Touchpoint 3:** `strangler slice`, `TS-native argv surface`, `adherence-reconcile` — validated against [tied/vocab/tied-methodology.md](../../tied/vocab/tied-methodology.md) and [tied/vocab/agentstream.md](../../tied/vocab/agentstream.md).

## Slice order (2026-09-22)

- **Confirmed:** **2a** executor dry-run → **2b** pipeline/batch → **2c** checklist render → **2d** adherence strangler.

## Phase 4 refine (2026-09-22)

- **Scope:** PLAN.md Phase 4 section only; 3b arc unchanged.
- **Slice order:** **4a** (live executor + checklist run + dry-run extensions) → **4b** (Ruby/shell operator path) → **4c** (default `TIED_AGENTSTREAM_IMPL=ts` + deprecation window) → **4d** (Go tree removal) → optional **4embed** (pkg/nexe evaluation, non-deliverable).
- **REQ status:** stays **In Progress** until **4d** + verification/`tied_validate_consistency`.
- **Open questions:** **Resolved 2026-09-22** — sponsor accepted PLAN defaults (OQ-4-1: no post-4d Go shim; OQ-4-2: frozen fixtures; OQ-4-3: defer Tier 3 compare; OQ-4-4: one tagged release deprecation window).
- **Tracker:** Reset at Phase 4 **`build-plan`** — do not reuse closed 3b tracker without copy hygiene.
- **Vocabulary RECORD:** `Go-forward surface`, `deprecation window`, `oracle fixture freeze`, `qualified argv` vs `documented operator flow`.
## Phase 4 arc post-4d process (2026-09-23)

- **Delivery:** Slices **4a–4d** on **`origin/main`** — commit **`72b7d9d`**; TS-only `@tied/agentstream`; Go tree removed; oracle fixtures under `mcp-server/packages/agentstream/testdata/`.
- **Tests:** `cd mcp-server && npm test` — **991/991** (no Go).
- **`tied_verify`:** REQ **Implemented**, IMPL **Active** (2026-09-23); runner [run-phase4d-tied-verify.mjs](./run-phase4d-tied-verify.mjs).
- **Arc `close_out`:** [phase4-full-close-out-gate.json](./gates/phase4-full-close-out-gate.json) — **`allowed: true`** after delivery **`traceable-commit`**; envelope blocking gaps **0**; **re-run** after process hygiene commit.
- **Tracker:** Authoritative closed [checklist-tracker-phase4-arc-closed.yaml](./checklist-tracker-phase4-arc-closed.yaml) (commit pending); idle [checklist-tracker.yaml](./checklist-tracker.yaml).
- **Vocabulary Touchpoint 3:** RECORD/VALIDATE `Go tree removal`, `oracle fixture freeze`, TS-default **`@tied/agentstream`**, **process close-out hygiene** — [tied/vocab/agentstream.md](../../tied/vocab/agentstream.md), [tied/vocab/domain-references.md](../../tied/vocab/domain-references.md).
- **Next prompt type:** **`plan-close-out`** (hygiene commit + push); then optional **4embed** via **`build-plan`**.

## Linked plan

Canonical plan for `/build-plan`: [PLAN.md](./PLAN.md)

Close-out execution plan (Cursor): `.cursor/plans/phase_4_plan_close-out_77945a58.plan.md` (refined 2026-09-23).
