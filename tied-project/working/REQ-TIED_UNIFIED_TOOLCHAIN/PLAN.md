# Unified TIED developer toolchain — linked plan

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml) (**Implemented** via `tied_verify` 2026-09-23; arc **`close_out`** **`allowed: true`** post-**`72b7d9d`**) |
| **ARCH** | [ARCH-TIED_UNIFIED_TOOLCHAIN](../../tied/architecture-decisions/ARCH-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **IMPL** | [IMPL-TIED_UNIFIED_TOOLCHAIN](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN.yaml) · [pseudo-code](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md) |
| **CITDP** | [CITDP-REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **Tracker** | **Arc closed:** [checklist-tracker-phase4-arc-closed.yaml](./checklist-tracker-phase4-arc-closed.yaml); **idle stub:** [checklist-tracker.yaml](./checklist-tracker.yaml) (copy checklist template before **4embed** / **4e**) · 4b archive: [checklist-tracker-phase4b-archive.yaml](./checklist-tracker-phase4b-archive.yaml) |
| **Last delivery** | **2026-09-23** — Phase **4a–4d** shipped **`72b7d9d`**; arc **`close_out`** re-validated (advisory diagnostics only) |
| **profile_depth** | **`integrated`** (sponsor 2026-09-22; effective **Phase 3b slice 2+**; slice 1 arc closed at `minimal`) |
| **gate_policy** | `advisory` |
| **Git push policy** | Sponsor requested push after Phase **4** close-out commits (2026-09-23) |

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
2. **Phases 0–3b (shipped):** npm workspace at **`mcp-server/`**; `@tied/mcp`, `@tied/cli`, `@tied/bootstrap`, `@tied/yaml-cli`, `@tied/agentstream` strangler through qualified preview/dry-run/reconcile on **`fbe65e1`**; MCP adherence TS hook; README / wrappers updated.
3. **Phase 4 (shipped `72b7d9d`):** **`LIVE_EXECUTOR_TS`**, **`CHECKLIST_RUN_TS`**, Ruby/shell retirement (**4b**), default **`TIED_AGENTSTREAM_IMPL=ts`** (**4c**), Go tree removal + frozen oracle fixtures (**4d**); REQ **Implemented** via **`tied_verify`**. Non-blocking backlog: **4embed** spike, **4e** Tier 3 Ruby compare / `validate_tokens` TS port.
4. **`tied_validate_consistency`** passes after TIED stack updates; gates documented below (including **`close_out`** for completed slices).

---

## Delivery snapshot (post Phase 4 arc)

| Phase | Status | Shipped (high level) |
| --- | --- | --- |
| **0** | Complete | REQ/ARCH/IMPL, CITDP, this PLAN, sponsor log |
| **1** | Complete | Workspace root **`mcp-server/`**; unified `npm run build`; `@tied/mcp` + `@tied/cli` (`tied mcp` → dist MCP) |
| **2** | Complete | `@tied/bootstrap`, `@tied/yaml-cli`; `tied bootstrap` / `tied yaml`; TS adherence hook in MCP; `tied-cli.sh` → workspace CLI |
| **3a** | Complete | `@tied/agentstream` package; `tied agentstream`; `TIED_AGENTSTREAM_IMPL=go\|ts`; Go default; tiedpreflight TS + parity tests |
| **3b slice 1** | Complete | TS-native **`--checklist-tracker-preview`** (`PreviewTrackerMigration` vs Go oracle); parity + dispatcher tests |
| **3b slice 2a–2d** | **Complete (shipped)** | Dry-run, pipeline/batch, checklist render, adherence reconcile TS-native (`fbe65e1`) |
| **4a** | **Complete (shipped)** | Live executor + extended dry-run TS-native; tracker-mode live TS-native |
| **4b** | **Complete (shipped)** | Ruby `tools/agent-stream` + adherence Ruby launcher removed; RISK-UNIFIED-005 inventory |
| **4c** | **Complete (shipped)** | Default `TIED_AGENTSTREAM_IMPL=ts`; deprecation notice per OQ-4-4 |
| **4** (arc) | **Complete (shipped)** | **`72b7d9d`** — Phase **4a–4d**; arc **`close_out`** **`allowed: true`** |
| **4d** | **Complete (shipped)** | Go tree removed; oracle fixtures under `mcp-server/packages/agentstream/testdata/`; TS-only `tied agentstream` |

**REQ satisfaction:** **Implemented** (verification-gated 2026-09-23) for Tier 1 suite + Phase **3b** qualified argv + Phase **4** legacy removal (**4a–4d** shipped **`72b7d9d`**). Machine arc **`close_out`** **`allowed: true`** (2026-09-23; `run-phase4-arc-close-out-gate.mjs`, run_id `phase4-full-close-out-2026-09-23`).

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
| **Fallback (historical)** | Go `tools/agentstream` retained through **4c** only; removed **4d** — emergency use prior git tag (OQ-4-1) |
| **Deprecate** | Ruby `tools/agent-stream/`; Ruby YAML front-ends and hook bridges after TS replacements |
| **Rejected / deferred** | Rust (cost); Deno (ecosystem); Bun as **primary** (second runtime)—optional CI-only experiment per sponsor #4 |

Rationale: reuse mcp-server MCP/analysis investment; bootstrap already Node; shared types between MCP and `@tied/agentstream`.

---

## Tool suite inventory (tiers)

### Tier 1 — unified core (target packages)

| Path | Today | Target package | Role | Slice 1 status |
| --- | --- | --- | --- | --- |
| `mcp-server/` | TS/Node | `@tied/mcp` | TIED YAML MCP, verify, gates, adversarial inquiry, feature-orchestration | **In workspace** |
| `mcp-server/packages/agentstream/` | TypeScript (operator path) | `@tied/agentstream` | Pipeline, checklist, executor, adherence, tiedpreflight | **Shipped** — TS-only; oracle via frozen fixtures |
| `tools/bootstrap/` | Node (.mjs) engines | `@tied/bootstrap` | copy_files, new-tied-client, MCP config preservation | **Wrapped** in workspace |

### Tier 2 — wrappers (thin; converge on `@tied/cli`)

| Path | Role | Slice 1 status |
| --- | --- | --- |
| `.cursor/skills/tied-yaml/scripts/tied-cli.sh` | MCP JSON-RPC client → `@tied/cli` | **Updated** |
| `copy_files.sh` / `copy_files.cmd` | Bootstrap entrypoints → `tied bootstrap` | **Delegates** |
| `tools/bundled-tied-yaml-skill/scripts/tied.sh` | Feature orchestration facade | Unchanged shell |

### Tier 3 — consolidate to TS

| Path | Today | Migration | Slice 1 status |
| --- | --- | --- | --- |
| `scripts/yaml_tool.sh`, `lint_yaml.sh` | shell → Ruby sorter | `@tied/yaml-cli` (TS canonicalizer) | **Parity tests** in package |
| `scripts/compare_yaml_dirs.rb`, `yaml_semantic_compare.rb` | Ruby | TS compare in `@tied/yaml` | Backlog (Phase 2+) |
| `scripts/run-feature-batch-agentstream.sh` | shell | `tied agentstream` batch or TS driver | Backlog (Phase 3b) |
| `scripts/validate_tokens.sh` | shell | TS or shared test harness | Backlog |

### Tier 4 — deprecate

| Path | Notes |
| --- | --- |
| `tools/agent-stream/` (Ruby) | **Removed** Phase **4b** |

### Tier 5 — port with suite (sponsor #5)

| Path | Today | Target | Slice 1 status |
| --- | --- | --- | --- |
| `scripts/adherence_append_action_attempted.rb` | Ruby hook bridge (historical) | TS in MCP `dist/cli` + hook tests | **TS only**; Ruby launcher removed Phase **4b** |

### Out of scope

`working/**` research pilots and one-off qualification scripts.

---

## Target architecture

### Workspace layout (locked)

- **Root:** **`mcp-server/`** npm workspace (packages under `mcp-server/packages/`).
- **Packages (as shipped + backlog):**
  - `@tied/mcp` — current `mcp-server` implementation (root package)
  - `@tied/bootstrap` — wraps `tools/bootstrap` engines
  - `@tied/yaml-cli` — lint/canonicalize (TS)
  - `@tied/agentstream` — TS operator CLI (**complete** post-**4d**)
  - `@tied/cli` — umbrella **`tied`** binary
- **Build:** `cd mcp-server && npm run build && npm test` at workspace root.
- **Release/docs:** operators assume **Node ≥18** on PATH.

### Umbrella CLI (`tied`)

```
tied mcp          → stdio MCP (mcp-server/dist/index.js)
tied bootstrap    → copy_files / client bootstrap
tied yaml         → canonicalize / lint (TS)
tied agentstream  → TS entry (default `TIED_AGENTSTREAM_IMPL=ts`; no in-repo Go binary post-4d)
```

### Cursor MCP config story

| Phase | Config |
| --- | --- |
| **1–2 (now)** | `node <repo>/mcp-server/dist/index.js` or `tied mcp` |
| **Invariant** | `TIED_BASE_PATH` semantics unchanged; `tied_config_get_base_path` mandatory |

### Agentstream dispatch (post **4d** — shipped **`72b7d9d`**)

| `TIED_AGENTSTREAM_IMPL` | Behavior |
| --- | --- |
| **`ts`** (default) | All documented TIED operator flows in [@tied/agentstream README](../../mcp-server/packages/agentstream/README.md) run TS-native; **no** Go subprocess forward |
| **`go`** | **Not supported** in-repo after **4d** (OQ-4-1: reinstall a **prior tag** that still ships `tools/agentstream/` for emergency only) |
| Parity proof | Frozen oracle fixtures under `mcp-server/packages/agentstream/testdata/oracle/` (see [phase4d-go-oracle-freeze.json](./phase4d-go-oracle-freeze.json)) |

---

## Migration phases

| Phase | Name | Deliverables | Exit gate | Status |
| --- | --- | --- | --- | --- |
| **0** | Architecture + TIED stack | REQ/ARCH/IMPL, CITDP, this PLAN | TIED consistency; planning gates | **Done** |
| **1** | Workspace scaffold | Workspace at **`mcp-server/`**; build/test unified | MCP tests + workspace build | **Done** |
| **2** | Bootstrap + yaml CLI | `@tied/bootstrap`, `@tied/yaml-cli`; adherence TS hook | Bootstrap/yaml parity; hook smoke | **Done** |
| **3a** | Agentstream shell | Package, dispatch, tiedpreflight TS, Go oracle tests | Go tests green; TS preflight parity | **Done** |
| **3b slice 1** | Tracker preview | `--checklist-tracker-preview` TS-native | Golden vs Go oracle; gates + **close_out** | **Done** (`a23d939`) |
| **3b slice 2a–2d** | Strangler core | Dry-run, pipeline/batch preview, checklist render, adherence reconcile | RED parity per submodule; no Go forward for qualified argv | **Done (shipped `fbe65e1`)** |
| **4** | Legacy removal + optional embed | Slices **4a–4d** (+ optional **4embed**); see Phase 4 section | Full parity; TS default; deprecation window; Go/Ruby removed | **Done (`72b7d9d`; arc close_out allowed)** |

---

## Phase 3b strangler backlog (slice 2+)

Align to [IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md) **`AGENTSTREAM_STRANGLER` BACKLOG** and **RISK-UNIFIED-001**.

**Slice order (sponsor confirmed 2026-09-22):** **2a → 2b → 2c → 2d** (executor dry-run first). Reorder only if dependency data contradicts.

| Slice | IMPL focus | Port target | Parity oracle |
| --- | --- | --- | --- |
| **2a** | Executor dry-run TS-native | `@tied/agentstream` | Go dry-run JSON/fixtures |
| **2b** | Pipeline / batch driver subset | `@tied/agentstream` + optional `run-feature-batch-agentstream.sh` | Go golden + `checklist/testdata` |
| **2c** | Checklist render / expansion | `@tied/agentstream` | `tools/agentstream/checklist/testdata` |
| **2d** | Adherence strangler | `@tied/agentstream` + hook integration | Go adherence + MCP gate tests |

**Exit for Phase 3b (full):** With `TIED_AGENTSTREAM_IMPL=ts`, **qualified preview/dry-run/reconcile argv** ran without Go forward until **4a** extended TS coverage. **Historical:** live executor and non-qualified argv forwarded to Go until Phase **4a–4d** closed the strangler.

---

## Phase 4 — legacy removal + optional embed evaluation

**Tokens:** [REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml) · [ARCH-TIED_UNIFIED_TOOLCHAIN](../../tied/architecture-decisions/ARCH-TIED_UNIFIED_TOOLCHAIN.yaml) · [IMPL-TIED_UNIFIED_TOOLCHAIN](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN.yaml) · satisfaction **SC-UNIFIED-MIGRATION-PHASES** · **RISK-UNIFIED-001**..**006**

**Status:** **4 arc closed** — shipped **`72b7d9d`**; **`tied_verify`** → REQ **Implemented**; arc **`close_out`** **`allowed: true`** (2026-09-23).

### Purpose

Close the strangler: port the **remaining Go-authoritative agentstream surfaces**, flip the **default** implementation to TypeScript, run a **documented deprecation window**, **remove** Go and Ruby legacy trees from the operator path, and optionally **evaluate** (not ship) a single-binary Node embed for operator-only installs.

### Dependencies on prior phases (hard gates)

| Prerequisite | Evidence | Blocks Phase 4 if missing |
| --- | --- | --- |
| Phase **3b slices 2a–2d** shipped | **`fbe65e1`**; [phase3b-full-close-out-gate.json](./phase3b-full-close-out-gate.json) | No claim of “TS strangler complete” |
| Qualified TS argv (preview, dry-run subset, reconcile) | [@tied/agentstream README](../../mcp-server/packages/agentstream/README.md); parity tests in `mcp-server/packages/agentstream` | Cannot shrink Go forward surface safely |
| `@tied/cli` / workspace build green | `cd mcp-server && npm run build && npm test` | Removal breaks operator docs |
| Sponsor **#1** / **#7** | Embedded runtime **optional**; Ruby removal **after** parity + notice | Scope creep into pkg/nexe deliverable |

**Not a Phase 4 prerequisite (may run in parallel or defer):** Tier 3 Ruby YAML compare (`compare_yaml_dirs.rb`), `validate_tokens.sh` TS port, Bun CI experiment — track as **4e backlog** unless sponsor promotes them into removal gate.

### Historical — Go-forward surface (baseline at 3b close-out; closed by **4a–4d**)

Before slice **4a**, with `TIED_AGENTSTREAM_IMPL=ts`, `@tied/agentstream` **forwarded to Go** for argv outside the Phase 3b qualified set. Those categories were ported in **4a**; default flip **4c**; Go tree removal **4d**. See IMPL blocks **`LIVE_EXECUTOR_TS`**, **`CHECKLIST_RUN_TS`**, and extended dry-run coverage in [pseudo-code](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md). Deprecation window: [phase4c-deprecation-notice.md](./phase4c-deprecation-notice.md).

### Slice order (recommended; reorder only if dependency data contradicts)

**4a → 4b → 4c → 4d**; **4embed** optional anytime after **4a** planning spike slot.

| Slice | IMPL focus | Port target | Parity oracle / proof |
| --- | --- | --- | --- |
| **4a** | Live executor + checklist run + remaining dry-run disqualifiers | `@tied/agentstream` | Go live/dry-run fixtures; `tools/agentstream/checklist/testdata`; **no Go forward** for documented operator flows when `impl=ts` |
| **4b** | Ruby / shell retirement (operator path) | `@tied/cli`, docs, hooks | `tools/agent-stream/` unused; Ruby adherence **launcher** removed after TS-only hook path; optional Tier 3 scripts per sponsor |
| **4c** | Default flip + deprecation window | `@tied/cli`, README, CI env | **`TIED_AGENTSTREAM_IMPL=ts`** default; **≥ one release cycle** (or tagged milestone) with Go binary **still in repo** but not default; DIAGNOSTIC shim optional |
| **4d** | Go tree removal | Delete or archive `tools/agentstream/`; drop Go from required operator docs | `npm test` green; Go oracle tests **migrated** to frozen fixtures or nightly job; **`tied_verify`** / REQ **Implemented** only after this slice |
| **4embed** | Embedded Node evaluation **only** | Spike doc under `working/REQ-TIED_UNIFIED_TOOLCHAIN/` | pkg/nexe-style feasibility; **no** committed product deliverable (sponsor **#1**) |

Align new blocks to [IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md) **`AGENTSTREAM_STRANGLER` TERMINATION**, **`DEPRECATE_RUBY_AGENT_STREAM`**, and **`UMBRELLA_CLI_DISPATCH`** POST conditions.

### Acceptance criteria (Phase 4 arc)

1. **Full parity:** With `TIED_AGENTSTREAM_IMPL=ts`, **documented** TIED operator flows in README + this PLAN run **without** Go subprocess forward (or sponsor documents a **named emergency shim** flag with expiry).
2. **Default TS:** Default env/CLI behavior uses **`ts`** without breaking CI or Cursor MCP story (`tied mcp` unchanged).
3. **Legacy removed:** `tools/agentstream/` no longer required for normal development; `tools/agent-stream/` (Ruby) removed after deprecation notice per **`DEPRECATE_RUBY_AGENT_STREAM`**.
4. **REQ completion:** [REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml) may move to **Implemented** only after **4d** + `tied_validate_consistency` + project **`tied_verify`** if verification-gated.
5. **Embed (optional):** If **4embed** runs, outcome is a **sponsor decision record** (adopt / defer / reject) — not a release artifact unless a **new** REQ is opened.

### Exit gate (Phase 4 full)

| Gate | Criterion |
| --- | --- |
| **Parity** | RED parity tests covered all Go-forward categories above; GREEN on `npm test`; Go oracle either retired or confined to non-blocking CI job |
| **Deprecation** | Release note or tag documents Go/Ruby removal; one-cycle warning satisfied (sponsor **#6**, **#7**) |
| **Removal** | No README step requires `go install` / Ruby gem for unified suite; shell wrappers delegate to **`tied`** only |
| **TIED** | `tied_validate_consistency` clean; CITDP evidence updated; Phase 4 **`close_out`** gate **`allowed: true`** |
| **Depth** | **`profile_depth: integrated`**, **`gate_policy: advisory`**; adversarial inquiry at **pre_implementation**, **pre-RED**, and **verification** per [AGENTS.md](../../AGENTS.md) §3.3.1 |

### Phase 4 risks (inherited + arc-specific)

| ID | Risk | Mitigation in Phase 4 |
| --- | --- | --- |
| **RISK-UNIFIED-001** | Live executor + checklist run regression (~remaining Go LOC) | Slice **4a** only; golden fixtures; keep Go oracle until **4c** |
| **RISK-UNIFIED-004** | TS subprocess performance vs Go | Benchmark before **4c** default flip; defer shim if data proves need |
| **RISK-UNIFIED-002** | Wrong `TIED_BASE_PATH` after Go removal | Integration tests on `tied mcp` + `tied agentstream` with multi-root docs |
| **RISK-UNIFIED-005** | Shell/Ruby YAML paths still used after Go removal | Explicit **4b** inventory; `@tied/yaml-cli` + MCP canonicalizer as replacement |
| **RISK-UNIFIED-006** | Operators assume `impl=ts` is full TS while Go forward still existed | **Post-4d:** README + PLAN dispatch table state TS-only path; emergency Go via **prior tag** only (OQ-4-1) |
| **RISK-UNIFIED-007** (proposed) | Removing Go oracle breaks future strangler fixes | Freeze oracle fixtures in **4d**; document “last known good” Go commit in CITDP evidence |

### Verification additions (Phase 4)

| Trigger | Actions |
| --- | --- |
| After **4a** port touch | `cd mcp-server && npm run build && npm test`; targeted live/dry-run parity; `cd tools/agentstream && go test ./...` while Go remains oracle |
| Before **4c** default flip | CI matrix with `TIED_AGENTSTREAM_IMPL=ts` **and** `go`; compare executor benchmarks if RISK-UNIFIED-004 triggered |
| Before **4d** deletion | Grep/docs audit: no `tools/agentstream` in operator quick-start; adherence Ruby contract test retired or replaced |
| Phase 4 **`close_out`** | Unified close-out runner + envelope; **`tied_validate_consistency`**; REQ status update via **`tied_verify`** if applicable |

### Post–Phase 4 arc (2026-09-23)

**Arc status:** Closed at **`72b7d9d`**; REQ **Implemented**; authoritative Tracker archived at [checklist-tracker-phase4-arc-closed.yaml](./checklist-tracker-phase4-arc-closed.yaml). [checklist-tracker.yaml](./checklist-tracker.yaml) is an **idle stub** until optional follow-up.

| Follow-up | When | Prompt type / checklist |
| --- | --- | --- |
| **Push / CHANGELOG hygiene** | Sponsor policy 2026-09-23 | **`plan-close-out`** if additional doc-only commits needed; **`origin/main`** already includes **`72b7d9d`** + post-close-out sync (**`8bb296e`** as of refine-plan) |
| **4embed** spike | Sponsor promotes optional embed evaluation | Copy fresh Tracker; **`build-plan`** scoped to **4embed** only; decision record — not a product deliverable |
| **4e backlog** | Tier 3 Ruby YAML compare, `validate_tokens.sh` TS port, Bun CI experiment | New REQ or CITDP slice; fresh Tracker; **`build-plan`** or **`plan-new-feature`** per scope |
| **No further Phase 4 implementation** | Default | **None** — do not re-open **4a–4d** without sponsor LEAP |

Do **not** commit gitignored gate JSON or ephemeral `token-create-*.json` receipts.

### Open questions (resolved — sponsor accepted defaults 2026-09-22)

| # | Question | **Decision** |
| --- | --- | --- |
| OQ-4-1 | Retain **emergency Go shim** (`TIED_AGENTSTREAM_IMPL=go`) after **4d**? | **No** — remove binary; document reinstall of prior tag for emergency |
| OQ-4-2 | Migrate Go oracle to **frozen fixtures** vs **delete tests** with TS-only harness? | **Frozen fixtures** in repo + optional nightly Go job |
| OQ-4-3 | Tier 3 Ruby compare scripts in **4b** or separate REQ? | **Defer** unless blocking removal gate |
| OQ-4-4 | Minimum **deprecation window** length (calendar vs one git tag)? | **One tagged release** on `origin/main` with Go still present, TS default in **4c** |

---

## Risks and mitigations

| ID | Risk | L | Mitigation |
| --- | --- | --- | --- |
| **RISK-UNIFIED-001** | Agentstream Go→TS size (~14k LOC) and checklist/adherence regression | High | Strangler slices; golden fixtures; per-slice RED parity |
| **RISK-UNIFIED-002** | `TIED_BASE_PATH` footguns when one CLI serves MCP | Medium | `tied_config_get_base_path`; one-window-per-repo docs; integration tests |
| **RISK-UNIFIED-003** | Windows path and stdio MCP fragility | Medium | Bootstrap path helpers; win32 CI where available |
| **RISK-UNIFIED-004** | TS subprocess orchestration performance vs Go | Low | Benchmark executor; Go shim only if data proves need |
| **RISK-UNIFIED-005** | YAML canonicalization Ruby-backed today | Medium | `@tied/yaml-cli` + MCP canonicalizer; retire shell front-end when compare ported |
| **RISK-UNIFIED-006** | Operators assume `TIED_AGENTSTREAM_IMPL=ts` is full TS | Medium | **Post-4d:** README + PLAN dispatch (TS-only); OQ-4-1 prior-tag emergency; no in-repo **`go`** opt-in |
| **RISK-UNIFIED-007** | Go oracle loss on removal breaks audit trail | Low | Freeze fixtures at **4d**; CITDP records last Go oracle commit (Phase **4** section) |

---

## Verification strategy

**When to run**

| Trigger | Actions |
| --- | --- |
| After any `@tied/*` or MCP hook change | `cd mcp-server && npm run build && npm test` |
| After agentstream parity / oracle fixture change | `cd mcp-server && npm test` (packages/agentstream fixture tests); optional nightly Go job if configured — **no** in-repo Go tree post-**4d** |
| After adherence bridge change | `ruby scripts/test/adherence_append_action_attempted_test.rb` + MCP hook test |
| Before slice **close_out** | Unified close-out runner + envelope blocking (see close-out plan); `tied_validate_consistency` |
| Before claiming REQ **Implemented** | Phase **4d** + arc **`close_out`** + project **`tied_verify`** ( **satisfied** 2026-09-23 ) |

**Do not rely on** stale `working/REQ-TIED_UNIFIED_TOOLCHAIN/validate-consistency.json` alone—re-run `tied_validate_consistency` at gate time.

**REQ status:** **Implemented** (verification-gated). Future optional slices (**4embed**, **4e**) do not revert REQ unless sponsor opens a new requirement.

---

## Test matrix (by phase / slice)

| Scope | Command / suite | Proves |
| --- | --- | --- |
| Workspace | `cd mcp-server && npm install && npm run build && npm test` | `@tied/cli`, bootstrap, yaml-cli, agentstream package tests, MCP e2e, adherence hook |
| Oracle fixtures | `mcp-server/packages/agentstream/testdata/oracle/**` + package tests | Post-**4d** parity vs frozen Go oracle (RISK-UNIFIED-007) |
| Adherence hook (TS) | `mcp-server` dist hook tests (`adherence-append-action-attempted.test.js`) | Append-only hook semantics post-**4b** (Ruby launcher removed) |
| Agentstream TS | `packages/agentstream` parity, dispatcher, tiedpreflight, tracker-migration-preview tests | Slice 1 + future slice RED/GREEN |
| Checklist goldens | `mcp-server/packages/agentstream/testdata/**` (+ migrated oracle copies) | RISK-UNIFIED-001 |
| TIED YAML | `lint_yaml` on changed project YAML; **`tied_validate_consistency`** | Stack traceability |
| Gates | `tied_checklist_gate_validate` per phase; close-out runner for **`close_out`** | Checklist enforcement (advisory) |
| Phase **4a–4d** | `npm test` + frozen oracle fixtures (post-**4d** TS-only) | Live executor parity; Go tree removal gate |
| Phase **4embed** | Spike notes only | Sponsor embed decision (non-blocking) |

Phase 0: TIED-only. Phases 1–4: parity-first strangler (complete). Ongoing: `npm test` at workspace root for `@tied/*` changes.

---

## Open items / next execution entry point

**Recommended prompt type:** **`plan-close-out`** until **process close-out hygiene** is committed and pushed (authoritative [checklist-tracker-phase4-arc-closed.yaml](./checklist-tracker-phase4-arc-closed.yaml), CITDP activation sync, idle stub, gitignore patterns). After hygiene lands on **`origin/main`**, default **None** for the arc; optional **`build-plan`** for **4embed** only.

**Post–4d process (2026-09-23):** Feature delivery **`72b7d9d`**; arc **`close_out`** → **`allowed: true`** post delivery commit ([phase4-full-close-out-gate.json](./gates/phase4-full-close-out-gate.json)); **`tied_verify`** → REQ **Implemented**. Re-run **`close_out`** runner after hygiene commit so envelope and gate receipts reference the new HEAD.

**Git (informational):** **`main`** tracks **`origin/main`** at **`422bc87`** (includes Bun build fix and partial tracker sync). **Pending local (uncommitted):** CITDP, PLAN, idle stub, **untracked** arc-closed tracker, `.gitignore` — sponsor **`plan-close-out`** + commit + push closes the gap.

**Deferred / non-blocking (4e backlog)**

- **4embed** — embedded Node evaluation spike (decision record only).
- Bun CI experiment (Node remains canonical).
- Tier 3 Ruby YAML compare / `validate_tokens.sh` TS port.
- Ephemeral `working/**/token-create-*.json` — omit from commits.

---

## Refine

**Sponsor terms resolved (2026-09-22):** runtime (Node ≥18), CLI brand (`tied`), monorepo root (`mcp-server/`), Bun (CI-gated optional), Ruby hooks (port to TS), Go strangler + Ruby deprecation path.

**Post–slice-1 resolutions (2026-09-22 refine-plan):**

| Topic | Resolution |
| --- | --- |
| REQ status after slice 1 close-out | **In Progress** (partial delivery) |
| Next prompt type | **`build-plan`** on this PLAN for Phase 3b slice 2+ |
| `validate-consistency.json` in git | **Re-run at gates**; snapshot optional, not required for traceability |
| `token-create-*.json` | **Omit from commits** (ephemeral audit) |
| Phase 4 embedded runtime | Still optional / uncommitted |
| Slice 2 order | **2a → 2b → 2c → 2d** (executor dry-run first) — **confirmed** |
| Git push | **Satisfied** — **`origin/main`** includes **`72b7d9d`** + **`8bb296e`** (2026-09-23) |
| `profile_depth` for slice 2+ | **`integrated`** (upgrade from `minimal` used for slice 1 close-out) |
| Phase 4 refine (2026-09-22) | Slices **4a→4b→4c→4d** + optional **4embed**; live executor in **4a**; default **`ts`** in **4c**; Go delete in **4d**; OQ-4-1..4-4 documented in Phase 4 section |

**Post–Phase-4-arc refine-plan (2026-09-23):**

| Topic | Resolution |
| --- | --- |
| REQ status | **Implemented** via **`tied_verify`**; arc **`close_out`** **`allowed: true`** |
| Phase **4** implementation | **Closed** — no further **4a–4d** unless sponsor LEAP |
| Tracker | Archived [checklist-tracker-phase4-arc-closed.yaml](./checklist-tracker-phase4-arc-closed.yaml); [checklist-tracker.yaml](./checklist-tracker.yaml) idle until **4embed** / **4e** |
| Agentstream dispatch | TS-only post-**4d**; no **`TIED_AGENTSTREAM_IMPL=go`** in-repo (OQ-4-1 prior tag) |
| Next prompt type | **`plan-close-out`** until hygiene commit; then **None** (arc complete); optional **`build-plan`** (**4embed**) |
| Push policy | Re-push after hygiene commit (feature delivery already on **`origin/main`**) |
| **4e backlog** | Tier 3 Ruby compare, `validate_tokens` TS port, Bun CI — non-blocking |
| **Process close-out hygiene** | **Pending** — commit arc-closed tracker + CITDP + gitignore; no new IMPL blocks |
| **`pre_implementation` gate (refine-plan)** | **N/A** — no new implementation slice; use authoritative closed tracker + **`close_out`** only |

**Vocabulary:** `linked plan`, `umbrella CLI`, `strangler slice`, `profile_depth` **integrated**, `gate_policy` advisory, **oracle fixture freeze**, **4e backlog**, **post-arc idle tracker**, **process close-out hygiene** — [citdp-planning-notes.md](./citdp-planning-notes.md); Touchpoint 3 **VALIDATE** at hygiene commit.

---

## Plan (CITDP)

- **Change definition:** Multi-language operator tooling → **shipped** TS/Node suite; Phases **0–4 (4a–4d)** on **`72b7d9d`**; optional **4embed** / **4e** backlog only.
- **Impact:** `ARCH-TIED_UNIFIED_TOOLCHAIN`; `@tied/agentstream` TS-only operator path; Go/Ruby legacy removed per **`DEPRECATE_RUBY_AGENT_STREAM`** and Go tree removal evidence.
- **Risk / depth:** `depth_tier: integrated`, `gate_policy: advisory`; RISK-UNIFIED-001..007 mitigations applied through **4d**; CITDP `leap_feedback.record_status`: **`applied_phase_4_complete`** (post-refine); notes in [citdp-planning-notes.md](./citdp-planning-notes.md).
- **Test strategy:** Workspace `npm test` + frozen oracle fixtures; no in-repo Go oracle CLI post-**4d**.

---

## Implement (outline — no code in refine-plan)

**Shipped (production — arc complete at `72b7d9d`):**

| Slice | IMPL blocks / outcome |
| --- | --- |
| **3b** | **EXECUTOR_DRY_RUN_TS**, **PIPELINE_BATCH_TS**, **CHECKLIST_RENDER_TS**, **ADHERENCE_STRANGLER_TS** (`fbe65e1`) |
| **4a** | **LIVE_EXECUTOR_TS**, **CHECKLIST_RUN_TS**, extended dry-run disqualifiers |
| **4b** | **DEPRECATE_RUBY_AGENT_STREAM**; Ruby launcher removal; Tier 3 inventory (deferred compare) |
| **4c** | Default **`TIED_AGENTSTREAM_IMPL=ts`**; [phase4c-deprecation-notice.md](./phase4c-deprecation-notice.md) |
| **4d** | Go tree removal; oracle fixture freeze; **`tied_verify`** → REQ **Implemented** |

**No further Phase 4 product implementation** in refine-plan scope. Optional follow-ups only via sponsor-scoped **`build-plan`**:

- **4embed** — spike + sponsor decision record (no product commit unless new REQ).
- **4e** — Tier 3 Ruby YAML compare, `validate_tokens.sh` TS port, Bun CI experiment.

**Process close-out hygiene (doc/TIED only — in flight):**

| Step | Outcome |
| --- | --- |
| **`sub-close-out-evidence-sync`** | `run-close-out-gates.mjs` on [checklist-tracker-phase4-arc-closed.yaml](./checklist-tracker-phase4-arc-closed.yaml); envelope blocking gaps **0** |
| **Commit** | Stage arc-closed tracker, idle stub, CITDP, PLAN, `.gitignore`, CHANGELOG, planning notes |
| **Post-commit replay** | Same runner on new HEAD; **`git push origin main`** |

Phase 0–**4d** production code **landed** through **`72b7d9d`** (see [Delivery snapshot](#delivery-snapshot-post-phase-4-arc)).

---

## Gate validation

| Phase / slice | Gate | Result | Evidence |
| --- | --- | --- | --- |
| Phase 1 | `pre_implementation` | **`allowed: true`**, advisory | [phase1-pre-implementation-gate.json](./phase1-pre-implementation-gate.json) |
| Phase 1 | `verification` | **`allowed: true`**, advisory | [phase1-verification-gate.json](./phase1-verification-gate.json) |
| Phase 2 | `pre_implementation` | **`allowed: true`**, advisory | [phase2-pre-implementation-gate.json](./phase2-pre-implementation-gate.json) |
| Phase 2 | `verification` | **`allowed: true`**, advisory | [phase2-verification-gate.json](./phase2-verification-gate.json) |
| Phase 3a | `pre_implementation` | **`allowed: true`**, advisory | [phase3-pre-implementation-gate.json](./phase3-pre-implementation-gate.json) |
| Phase 3a | `verification` | **`allowed: true`**, advisory | [phase3-verification-gate.json](./phase3-verification-gate.json) |
| Phase 3b slice 1 | `pre_implementation` | **`allowed: true`**, advisory | [phase3b-pre-implementation-gate.json](./phase3b-pre-implementation-gate.json) |
| Phase 3b slice 1 | `verification` | **`allowed: true`**, advisory | [phase3b-verification-gate.json](./phase3b-verification-gate.json) |
| Phase 3b slice 1 | **`close_out`** | **`allowed: true`**, advisory | phase3b verification gate + close-out runner / envelope (gitignored); Tracker `close_out_evidence` |
| Phase 3b slice 2a | `pre_implementation` | **`allowed: true`**, advisory | Parent preflight 2026-09-22; inquiry `slice2a-pre-impl-2026-09-22` |
| Phase 3b slice 2a | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success` diagnostics) | [phase3b-slice2a-verification-gate.json](./gates/phase3b-slice2a-verification-gate.json); inquiry `slice2a-verification-2026-09-23` |
| Phase 3b slice 2a | **`close_out`** | *N/A — superseded by unified Phase 3b close_out* | See unified row below |
| Phase 3b slice 2b | `pre_implementation` | **`allowed: true`**, advisory | [phase3b-slice2b-pre-implementation-gate.json](./gates/phase3b-slice2b-pre-implementation-gate.json); inquiry `slice2b-pre-impl-2026-09-22` |
| Phase 3b slice 2b | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase3b-slice2b-verification-gate.json](./gates/phase3b-slice2b-verification-gate.json); inquiry `slice2b-verification-2026-09-23` |
| Phase 3b slice 2b | **`close_out`** | *N/A — superseded by unified Phase 3b close_out* | See unified row below |
| Phase 3b slice 2c | `pre_implementation` | **`allowed: true`**, advisory | [phase3b-slice2c-pre-implementation-gate.json](./gates/phase3b-slice2c-pre-implementation-gate.json); inquiry `slice2c-pre-impl-2026-09-23` |
| Phase 3b slice 2c | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase3b-slice2c-verification-gate.json](./gates/phase3b-slice2c-verification-gate.json); inquiry `slice2c-verification-2026-09-23` |
| Phase 3b slice 2c | **`close_out`** | *N/A — superseded by unified Phase 3b close_out* | See unified row below |
| Phase 3b slice 2d | `pre_implementation` | **`allowed: true`**, advisory | [phase3b-slice2d-pre-implementation-gate.json](./gates/phase3b-slice2d-pre-implementation-gate.json); inquiry `slice2d-pre-impl-2026-09-23` |
| Phase 3b slice 2d | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase3b-slice2d-verification-gate.json](./gates/phase3b-slice2d-verification-gate.json); inquiry `slice2d-verification-2026-09-23` |
| Phase 3b slice 2d | **`close_out`** | *N/A — superseded by unified Phase 3b close_out* | See unified row below |
| Phase 3b **full** | **`close_out`** | **`allowed: true`**, advisory | [phase3b-full-close-out-gate.json](./phase3b-full-close-out-gate.json); inquiry `slice3b-close-out-2026-09-23`; envelope gitignored under `working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/` |
| Phase 3b **full** | Milestone | **3b qualified surface complete (2a–2d)** | **`fbe65e1`** pushed to `origin/main`; post-push `close_out` re-validated 2026-09-23; Phase 4 still separate |
| Phase **4a** | `pre_implementation` | **`allowed: true`**, advisory | [phase4a-pre_implementation-gate.json](./gates/phase4a-pre_implementation-gate.json); inquiry `phase4a-pre-impl-2026-09-22` |
| Phase **4a** | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase4a-verification-gate.json](./gates/phase4a-verification-gate.json); inquiry `phase4a-verification-2026-09-22` |
| Phase **4a follow-up** | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase4a-followup-verification-gate.json](./gates/phase4a-followup-verification-gate.json); inquiry `phase4a-followup-verification-2026-09-23` |
| Phase **4b** | `pre_implementation` | **`allowed: true`**, advisory | [phase4b-pre_implementation-gate.json](./gates/phase4b-pre_implementation-gate.json); inquiry `phase4b-pre-impl-2026-09-23` |
| Phase **4b** | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase4b-verification-gate.json](./gates/phase4b-verification-gate.json); inquiry `phase4b-verification-2026-09-23` |
| Phase **4b** | **`close_out`** | *N/A — superseded by Phase 4 arc close_out* | Slice gates only |
| Phase **4a** | **`close_out`** | *N/A — superseded by Phase 4 arc close_out* | Slice gates only |
| Phase **4c** | `pre_implementation` | **`allowed: true`**, advisory | [phase4c-pre_implementation-gate.json](./gates/phase4c-pre_implementation-gate.json); inquiry `phase4c-pre-impl-2026-09-23` |
| Phase **4c** | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase4c-verification-gate.json](./gates/phase4c-verification-gate.json); inquiry `phase4c-verification-2026-09-23` |
| Phase **4c** | **`close_out`** | *N/A — superseded by Phase 4 arc close_out* | Default flip slice |
| Phase **4d** | `pre_implementation` | **`allowed: true`**, advisory | [phase4d-pre_implementation-gate.json](./gates/phase4d-pre_implementation-gate.json); inquiry `phase4d-pre-impl-2026-09-23` |
| Phase **4d** | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase4d-verification-gate.json](./gates/phase4d-verification-gate.json); inquiry `phase4d-verification-2026-09-23` |
| Phase **4** (arc) | **`close_out`** | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase4-full-close-out-gate.json](./gates/phase4-full-close-out-gate.json); run_id `phase4-full-close-out-2026-09-23`; envelope blocking gaps **0**; delivery commit **`72b7d9d`** — **re-run post hygiene commit** |
| Phase **4** (arc) | **`tied_verify`** | **`ok: true`** (2026-09-23) | REQ **Implemented** / IMPL **Active** via [run-phase4d-tied-verify.mjs](./run-phase4d-tied-verify.mjs) + authoritative tracker |
| Process hygiene | **`close_out`** | **Pending replay** on new HEAD | After commit of arc-closed tracker + CITDP; not a new **`pre_implementation`** slice |

**Integrated adversarial inquiry:** **not_applicable** for **slice 1** close-out (historical `minimal` depth). **Required** for **Phase 3b slice 2+** and **Phase 4 (4a–4d)** at `integrated` depth — artifacts under `working/REQ-TIED_UNIFIED_TOOLCHAIN/adversarial-inquiry/` per [AGENTS.md](../../AGENTS.md) §3.3.1. **Post-arc optional work** reuses integrated depth only if sponsor opens **4embed** / **4e** with a fresh Tracker.
