# Unified TIED developer toolchain — linked plan

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **ARCH** | [ARCH-TIED_UNIFIED_TOOLCHAIN](../../tied/architecture-decisions/ARCH-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **IMPL** | [IMPL-TIED_UNIFIED_TOOLCHAIN](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN.yaml) · [pseudo-code](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md) |
| **CITDP** | [CITDP-REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) |
| **Status** | **Phase 3b slice 1 complete** — TS `--checklist-tracker-preview` + parity tests; **Phase 3b backlog** = checklist render, pipeline, executor dry-run TS-native, adherence |
| **profile_depth** | `minimal` |
| **gate_policy** | `advisory` |

---

## Goal

Deliver a **single-language** (TypeScript on **user-installed Node ≥18**) developer suite for the TIED source repository: one npm/pnpm workspace under **`mcp-server/`**, umbrella CLI brand **`tied`** (`tied mcp`, `tied agentstream`, `tied bootstrap`, `tied yaml`, …), unified build/test story, and a phased strangler migration from Go/Ruby/shell helpers—with **parity gates** before legacy removal.

## Non-goals

- Big-bang rewrite of the agentstream checklist engine in one step (strangler only).
- **Embedded Node runtime** in Phases 1–3; Phase 4 may *evaluate* pkg/nexe-style embedding—**not committed** as a sponsor deliverable.
- Replacing Cursor IDE or the agent subprocess protocol.
- Unifying client application codebases with TIED repo tooling.
- Bun as canonical runtime or primary docs target (Node remains canonical).

## Success criteria

1. CITDP and this plan record **locked sponsor decisions** (2026-09-22) and migration phases with exit gates.
2. Phase 1 **`build-plan`**: npm/pnpm workspace rooted at **`mcp-server/`**, `@tied/mcp` + scaffold packages, single `npm run build` at workspace root, README updated—**Go/Ruby unchanged functionally**.
3. Phases 2–4: bootstrap/yaml CLI unification, agentstream strangler, legacy removal—each with RED parity tests before deprecation.
4. `tied_validate_consistency` passes after TIED stack updates; pre-implementation gate documented below.

---

## Sponsor decision log

| # | Topic | Decision (confirmed 2026-09-22) |
| --- | --- | --- |
| 1 | **Runtime** | User-installed **Node ≥18 only** for Phases 1–3; Phase 4 embedded runtime **optional future**, not committed |
| 2 | **CLI brand** | Umbrella command **`tied`** with subcommands (`mcp`, `agentstream`, `bootstrap`, `yaml`, …) |
| 3 | **Monorepo root** | **Expand `mcp-server/`** as npm/pnpm workspace root (not `tools/tied-suite/` as primary) |
| 4 | **Bun** | **Allowed only if CI proves** MCP + full test suite compatibility; **Node is canonical** for docs and release |
| 5 | **Ruby hooks** | **Port to TypeScript** with the suite (including adherence hook bridges); not “keep Ruby indefinitely” |
| 6 | **Go agentstream** | Strangler port to TS; ship Go until TS **parity gate** passes |
| 7 | **Ruby agent-stream** | Deprecate after checklist parity; remove in Phase 4 |
| 8 | **Repo scope** | TIED **source** repo (`stdd`) operator tooling only |

---

## Language choice and fallback

| Role | Choice |
| --- | --- |
| **Primary** | TypeScript on **Node.js ≥18**, workspace centered on **`mcp-server/`** |
| **Fallback** | Retain **Go** `tools/agentstream` if TS port fails parity gates; still unify bootstrap/yaml on Node |
| **Deprecate** | Ruby `tools/agent-stream/`; Ruby YAML front-ends and hook bridges after TS replacements |
| **Rejected / deferred** | Rust (cost); Deno (ecosystem); Bun as **primary** (second runtime)—optional CI-only experiment per sponsor #4 |

Rationale: reuse mcp-server MCP/analysis investment; bootstrap already Node; shared types between MCP and future `@tied/agentstream`.

---

## Tool suite inventory (tiers)

### Tier 1 — unified core (target packages)

| Path | Today | Target package | Role |
| --- | --- | --- | --- |
| `mcp-server/` | TS/Node | `@tied/mcp` | TIED YAML MCP, verify, gates, adversarial inquiry, feature-orchestration |
| `tools/agentstream/` | Go | `@tied/agentstream` | Pipeline, checklist, executor, adherence, tiedpreflight |
| `tools/bootstrap/` | Node (.mjs) | `@tied/bootstrap` | copy_files, new-tied-client, MCP config preservation |

### Tier 2 — wrappers (thin; converge on `@tied/cli`)

| Path | Role |
| --- | --- |
| `.cursor/skills/tied-yaml/scripts/tied-cli.sh` | MCP JSON-RPC client → exec `tied` / `@tied/cli` |
| `copy_files.sh` / `copy_files.cmd` | Bootstrap entrypoints → `tied bootstrap` |
| `tools/bundled-tied-yaml-skill/scripts/tied.sh` | Feature orchestration facade |

### Tier 3 — consolidate to TS

| Path | Today | Migration |
| --- | --- | --- |
| `scripts/yaml_tool.sh`, `lint_yaml.sh` | shell → Ruby sorter | `@tied/yaml-cli` (TS canonicalizer) |
| `scripts/compare_yaml_dirs.rb`, `yaml_semantic_compare.rb` | Ruby | TS compare in `@tied/yaml` |
| `scripts/run-feature-batch-agentstream.sh` | shell | `tied agentstream` batch subcommand or TS driver |
| `scripts/validate_tokens.sh` | shell | TS or shared test harness (Phase 2+) |

### Tier 4 — deprecate

| Path | Notes |
| --- | --- |
| `tools/agent-stream/` (Ruby) | Deprecation notice → removal Phase 4 |

### Tier 5 — port with suite (sponsor #5)

| Path | Today | Target |
| --- | --- | --- |
| `scripts/adherence_append_action_attempted.rb` | Ruby hook bridge | TS hook bridge in workspace (Phase 2–3) |

### Out of scope

`working/**` research pilots and one-off qualification scripts.

---

## Target architecture

### Workspace layout (locked)

- **Root:** expand existing **`mcp-server/`** directory into the npm/pnpm **workspace root** (package name e.g. `@tied/suite` or repo-local equivalent).
- **Packages (incremental):**
  - `@tied/mcp` — current `mcp-server` implementation
  - `@tied/bootstrap` — migrated from `tools/bootstrap`
  - `@tied/yaml-cli` — lint/canonicalize/compare (TS)
  - `@tied/agentstream` — strangler port from Go
  - `@tied/cli` — umbrella **`tied`** binary; dispatches subcommands
- **Build:** one `npm run build` (or pnpm equivalent) at workspace root produces MCP dist + CLI artifacts.
- **Release/docs:** all operator docs assume **Node ≥18** on PATH; Bun documented only as optional CI matrix row if proven.

### Umbrella CLI (`tied`)

```
tied mcp          → stdio MCP (same behavior as mcp-server/dist/index.js)
tied bootstrap    → copy_files / client bootstrap
tied yaml         → canonicalize / lint / compare
tied agentstream  → pipeline (Go shim → TS default after parity)
```

`tied-cli.sh` becomes a thin wrapper resolving `TIED_MCP_BIN` to workspace build output.

### Cursor MCP config story

| Phase | Config |
| --- | --- |
| **1** | Unchanged: `node <repo>/mcp-server/dist/index.js` (absolute path in `.cursor/mcp.json`) |
| **2+** | Optional: `node <repo>/mcp-server/packages/cli/dist/index.js mcp` or `tied mcp` with **identical stdio JSON-RPC** |
| **Invariant** | `TIED_BASE_PATH` semantics unchanged; `tied_config_get_base_path` remains mandatory session check |

---

## Migration phases

| Phase | Name | Deliverables | Exit gate |
| --- | --- | --- | --- |
| **0** | Architecture + TIED stack | REQ/ARCH/IMPL, CITDP, this PLAN, sponsor log | TIED consistency; pre_implementation gate (planning) |
| **1** | Workspace scaffold | Workspace root at **`mcp-server/`**; `@tied/mcp` package; root `npm run build`; README single command; **no Go/Ruby removal** | CI green on existing MCP tests + workspace build |
| **2** | Bootstrap + yaml CLI | `@tied/bootstrap`, `@tied/yaml-cli`; `tied bootstrap` / `tied yaml`; TS adherence hook bridges; `tied-cli.sh` → `@tied/cli` | Parity vs current bootstrap + yaml_tool golden outputs; hook smoke tests |
| **3** | Agentstream strangler | `@tied/agentstream` package; env `TIED_AGENTSTREAM_IMPL=go\|ts`; golden fixtures | Go vs TS parity on checklist/testdata + executor dry-run + tiedpreflight |
| **4** | Legacy removal + optional embed | Remove Go agentstream + Ruby agent-stream after parity; optional pkg/nexe **evaluation only** | One release cycle deprecation; sponsor sign-off for embed decision |

---

## Risks and mitigations

| ID | Risk | L | Mitigation |
| --- | --- | --- | --- |
| **RISK-UNIFIED-001** | Agentstream Go→TS size (~14k LOC) and checklist/adherence regression | High | Strangler; golden fixtures from `tools/agentstream/checklist/testdata`; phase gate on Go vs TS parity |
| **RISK-UNIFIED-002** | `TIED_BASE_PATH` footguns when one CLI serves MCP | Medium | Preserve `tied_config_get_base_path`; one-window-per-repo docs; integration tests |
| **RISK-UNIFIED-003** | Windows path and stdio MCP fragility | Medium | Reuse bootstrap path helpers; win32 CI where available |
| **RISK-UNIFIED-004** | TS subprocess orchestration performance vs Go | Low | Benchmark executor hot path; Go shim only if data proves need |
| **RISK-UNIFIED-005** | YAML canonicalization Ruby-backed today | Medium | MCP TS canonicalizer; migrate `yaml_tool` front-end to `@tied/yaml-cli` |

---

## Test strategy (by phase)

| Phase | Tests |
| --- | --- |
| **0** | `lint_yaml` on changed TIED YAML; `tied_validate_consistency`; no migration code tests |
| **1** | Existing `mcp-server` unit/e2e suite via workspace scripts; smoke: build produces `dist/index.js` |
| **2** | RED parity: bootstrap fixtures; yaml canonicalization vs Ruby/shell baselines; TS hook bridge contract tests |
| **3** | RED parity: Go golden JSON/fixtures vs TS `@tied/agentstream`; composition tests for `tied agentstream` dispatch |
| **4** | Full CI matrix (Node canonical); optional Bun job if sponsor #4 satisfied; removal = no Go/Ruby paths in default build |

---

## Open items / next step

1. Invoke **`build-plan`** with this file as the linked plan — **Phase 1 only** (workspace scaffold under `mcp-server/`).
2. Add workspace `package.json` / `pnpm-workspace.yaml` without breaking current `npm run build --prefix mcp-server` until cutover.
3. Document `tied` CLI stub (package `@tied/cli`) with `mcp` delegating to existing dist entry.
4. Bun: add CI experiment ticket only after Phase 1 stable (non-blocking).

---

## Refine

**Sponsor terms resolved (2026-09-22):** runtime (Node ≥18), CLI brand (`tied`), monorepo root (`mcp-server/`), Bun (CI-gated optional), Ruby hooks (port to TS), Go strangler + Ruby deprecation path.

**Vocabulary:** `linked plan`, `umbrella CLI`, `strangler port`, `profile_depth` minimal / `gate_policy` advisory — recorded in [citdp-planning-notes.md](./citdp-planning-notes.md); Prompt Composer glossary preloaded.

**Ambiguity:** None blocking Phase 1; Phase 4 embedded runtime explicitly optional/uncommitted.

---

## Plan (CITDP)

- **Change definition:** Multi-language operator tooling → phased TS/Node suite with locked sponsor defaults (see table above).
- **Impact:** `ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM`, `ARCH-TIED_STRUCTURE`, `IMPL-TIED_FILES`, Go/Ruby agentstream modules (future LEAP).
- **Risk / depth:** `depth_tier: minimal`, `gate_policy: advisory`; RISK-UNIFIED-001..005 in CITDP.
- **Test strategy:** Parity-first per phase; no RED migration tests until Phase 1 `build-plan`.

---

## Implement (outline only — Phase 0)

No production migration code in this refine-plan pass. Phase 1+ **`build-plan`** implements per [IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md):

1. **WORKSPACE_SCAFFOLD** — workspace root at `mcp-server/`, `@tied/mcp` minimum.
2. **UMBRELLA_CLI_DISPATCH** — `@tied/cli` subcommands; thin `tied-cli.sh`.
3. **MCP_STDIO_ENTRY_UNCHANGED** — Cursor config parity.
4. **AGENTSTREAM_STRANGLER** — Phase 3; env-driven go|ts.
5. **DEPRECATE_RUBY_AGENT_STREAM** — notices then Phase 4 removal.

TDD order: IMPL blocks validated → RED parity tests → GREEN port → `tied_validate_consistency`.

---

## Gate validation

| Phase | Result | Evidence |
| --- | --- | --- |
| `pre_implementation` (Phase 1) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase1-pre-implementation-gate.json` |
| `verification` (Phase 1) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase1-verification-gate.json` |
| `pre_implementation` (Phase 2) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase2-pre-implementation-gate.json` |
| `verification` (Phase 2) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase2-verification-gate.json` |
| `pre_implementation` (Phase 3a) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase3-pre-implementation-gate.json` |
| `verification` (Phase 3a) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase3-verification-gate.json` |
| `pre_implementation` (Phase 3b slice 1) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase3b-pre-implementation-gate.json` |
| `verification` (Phase 3b slice 1) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase3b-verification-gate.json` |

| `close_out` (Phase 3b slice 1) | **`allowed: true`**, advisory | `working/REQ-TIED_UNIFIED_TOOLCHAIN/phase3b-verification-gate.json` + local envelope (gitignored); see checklist-tracker `close_out_evidence` |

### Phase 3b port backlog (after slice 1)

- Checklist rendering / expansion (batch driver subset), pipeline, executor dry-run TS-native, adherence (RISK-UNIFIED-001).
- `TIED_AGENTSTREAM_IMPL=ts`: **does not** forward `--checklist-tracker-preview`; other argv still forwards to Go with stderr `DIAGNOSTIC` until ported.
