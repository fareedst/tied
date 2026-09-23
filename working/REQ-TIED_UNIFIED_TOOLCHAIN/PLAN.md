# Unified TIED developer toolchain — linked plan

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml) (**Implemented** via `tied_verify` 2026-09-23; arc **`close_out`** **`allowed: true`** post-**`72b7d9d`**) |
| **ARCH** | [ARCH-TIED_UNIFIED_TOOLCHAIN](../../tied/architecture-decisions/ARCH-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **IMPL** | [IMPL-TIED_UNIFIED_TOOLCHAIN](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN.yaml) · [pseudo-code](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md) |
| **CITDP** | [CITDP-REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) (Phase **4d** slice; 4b archive at [checklist-tracker-phase4b-archive.yaml](./checklist-tracker-phase4b-archive.yaml)) |
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
2. **Phases 0–2 + 3a–3b slice 1 (shipped):** npm workspace at **`mcp-server/`**; `@tied/mcp`, `@tied/cli`, `@tied/bootstrap`, `@tied/yaml-cli`, `@tied/agentstream` (dispatcher, tiedpreflight, `--checklist-tracker-preview` TS-native); MCP adherence TS hook; README / wrappers updated—**Go/Ruby remain functionally authoritative** for most agentstream argv.
3. **Phase 3b (shipped 2a–2d):** qualified preview/dry-run/reconcile TS-native on **`fbe65e1`**. **Phase 4:** live executor + checklist run + default **`ts`** + Go/Ruby removal—RED parity per [Phase 4](#phase-4--legacy-removal--optional-embed-evaluation) slices before deletion.
4. **`tied_validate_consistency`** passes after TIED stack updates; gates documented below (including **`close_out`** for completed slices).

---

## Delivery snapshot (post slice 1)

| Phase | Status | Shipped (high level) |
| --- | --- | --- |
| **0** | Complete | REQ/ARCH/IMPL, CITDP, this PLAN, sponsor log |
| **1** | Complete | Workspace root **`mcp-server/`**; unified `npm run build`; `@tied/mcp` + `@tied/cli` (`tied mcp` → dist MCP) |
| **2** | Complete | `@tied/bootstrap`, `@tied/yaml-cli`; `tied bootstrap` / `tied yaml`; TS adherence hook in MCP; `tied-cli.sh` → workspace CLI |
| **3a** | Complete | `@tied/agentstream` package; `tied agentstream`; `TIED_AGENTSTREAM_IMPL=go\|ts`; Go default; tiedpreflight TS + parity tests |
| **3b slice 1** | Complete | TS-native **`--checklist-tracker-preview`** (`PreviewTrackerMigration` vs Go oracle); parity + dispatcher tests |
| **3b slice 2a–2d** | **Complete (shipped)** | Dry-run, pipeline/batch, checklist render, adherence reconcile TS-native (`fbe65e1`) |
| **4a** | **Complete (local)** | Live executor + extended dry-run TS-native; tracker-mode live TS-native |
| **4b** | **Complete (local)** | Ruby `tools/agent-stream` + adherence Ruby launcher removed; RISK-UNIFIED-005 inventory |
| **4c** | **Complete (local)** | Default `TIED_AGENTSTREAM_IMPL=ts`; Go deprecation window documented |
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
| **Fallback** | Retain **Go** `tools/agentstream` if TS port fails parity gates; still unify bootstrap/yaml on Node |
| **Deprecate** | Ruby `tools/agent-stream/`; Ruby YAML front-ends and hook bridges after TS replacements |
| **Rejected / deferred** | Rust (cost); Deno (ecosystem); Bun as **primary** (second runtime)—optional CI-only experiment per sponsor #4 |

Rationale: reuse mcp-server MCP/analysis investment; bootstrap already Node; shared types between MCP and `@tied/agentstream`.

---

## Tool suite inventory (tiers)

### Tier 1 — unified core (target packages)

| Path | Today | Target package | Role | Slice 1 status |
| --- | --- | --- | --- | --- |
| `mcp-server/` | TS/Node | `@tied/mcp` | TIED YAML MCP, verify, gates, adversarial inquiry, feature-orchestration | **In workspace** |
| `tools/agentstream/` | Go (authoritative for most argv) | `@tied/agentstream` | Pipeline, checklist, executor, adherence, tiedpreflight | **Strangler:** preview + preflight TS; rest → Go |
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
| `tools/agent-stream/` (Ruby) | Deprecation notice → removal Phase 4 |

### Tier 5 — port with suite (sponsor #5)

| Path | Today | Target | Slice 1 status |
| --- | --- | --- | --- |
| `scripts/adherence_append_action_attempted.rb` | Ruby hook bridge | TS in MCP `dist/cli` + hook tests | **TS primary**; Ruby launcher retained for contract |

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
  - `@tied/agentstream` — strangler port from Go (**partial**)
  - `@tied/cli` — umbrella **`tied`** binary
- **Build:** `cd mcp-server && npm run build && npm test` at workspace root.
- **Release/docs:** operators assume **Node ≥18** on PATH.

### Umbrella CLI (`tied`)

```
tied mcp          → stdio MCP (mcp-server/dist/index.js)
tied bootstrap    → copy_files / client bootstrap
tied yaml         → canonicalize / lint (TS)
tied agentstream  → TS entry (default); set TIED_AGENTSTREAM_IMPL=go for legacy Go binary
```

### Cursor MCP config story

| Phase | Config |
| --- | --- |
| **1–2 (now)** | `node <repo>/mcp-server/dist/index.js` or `tied mcp` |
| **Invariant** | `TIED_BASE_PATH` semantics unchanged; `tied_config_get_base_path` mandatory |

### Agentstream dispatch (Phase 3b complete — slices 2a–2d)

| `TIED_AGENTSTREAM_IMPL` | Qualified argv (TS-native, no Go forward) | Unqualified argv |
| --- | --- | --- |
| **`ts`** (default, **4c**) | Preview/dry-run/reconcile **plus** live checklist run (`-c`, with or without `--checklist-tracker-yaml`) and extended dry-run `-d` shapes documented in README — documented operator flows (**4a**) | **Forward to Go** with stderr `DIAGNOSTIC` only for argv outside documented operator flows |
| **`go`** (legacy opt-in, **4c** window) | N/A — Go binary for all argv | Go binary |
| **Phase 4d target** | Same as **`ts`** default row | Go tree removed; no Go subprocess |

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

**Exit for Phase 3b (full):** With `TIED_AGENTSTREAM_IMPL=ts`, **qualified preview/dry-run/reconcile argv** runs without Go forward. **Live executor, checklist run, and other non-qualified argv** still forward to Go (see [@tied/agentstream README](../../mcp-server/packages/agentstream/README.md)). Go tests remain the strangler oracle until Phase 4 removal gate.

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

### Remaining Go-forward surface (baseline at 3b close-out)

With `TIED_AGENTSTREAM_IMPL=ts`, `@tied/agentstream` still **forwards to Go** when argv is **not** in the Phase 3b qualified set ([`index.ts`](../../mcp-server/packages/agentstream/src/index.ts)):

| Category | Examples | IMPL pseudo-code target (build-plan) |
| --- | --- | --- |
| **Live executor** | Non-`-d` runs that invoke Cursor/agent subprocess orchestration | **`LIVE_EXECUTOR_TS`** |
| **Checklist run** | Full checklist execution (not `--preview-lead-checklist` / tracker preview) | **`CHECKLIST_RUN_TS`** |
| **Extended dry-run** | Disqualifiers in `qualifiesForTsNativeDryRun` (e.g. `--prompts-file`, `--tdd-yaml`, `--verify-session`, `--non-compact-html`, argv after `--`) | **`EXECUTOR_DRY_RUN_TS`** extension or **`PIPELINE_BATCH_TS`** |
| **Other subcommands** | Any path hitting “subcommand not implemented in TS” DIAGNOSTIC | Per-oracle port or explicit **shim retention** decision |

Default **`TIED_AGENTSTREAM_IMPL=ts`** applies from slice **4c**; set **`go`** for legacy Go binary during the deprecation window until **4d** (see [phase4c-deprecation-notice.md](./phase4c-deprecation-notice.md)).

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
| **RISK-UNIFIED-006** | Operators assume `impl=ts` is full TS **before 4a** | **4c:** README states default **`ts`**; **`go`** documented as legacy opt-in; PLAN dispatch table lists any remaining forward paths |
| **RISK-UNIFIED-007** (proposed) | Removing Go oracle breaks future strangler fixes | Freeze oracle fixtures in **4d**; document “last known good” Go commit in CITDP evidence |

### Verification additions (Phase 4)

| Trigger | Actions |
| --- | --- |
| After **4a** port touch | `cd mcp-server && npm run build && npm test`; targeted live/dry-run parity; `cd tools/agentstream && go test ./...` while Go remains oracle |
| Before **4c** default flip | CI matrix with `TIED_AGENTSTREAM_IMPL=ts` **and** `go`; compare executor benchmarks if RISK-UNIFIED-004 triggered |
| Before **4d** deletion | Grep/docs audit: no `tools/agentstream` in operator quick-start; adherence Ruby contract test retired or replaced |
| Phase 4 **`close_out`** | Unified close-out runner + envelope; **`tied_validate_consistency`**; REQ status update via **`tied_verify`** if applicable |

### Before `build-plan` (Phase 4)

1. Copy [checklist-tracker.yaml](./checklist-tracker.yaml) from [agent-req-implementation-checklist.yaml](../../tied/docs/agent-req-implementation-checklist.yaml) (new arc; archive 3b tracker at [checklist-tracker-phase3b-unified-closed.yaml](./checklist-tracker-phase3b-unified-closed.yaml) if not already).
2. Set Tracker `record_identity.profile_depth: integrated`, `gate_policy: advisory`, `slice: phase-4-legacy-removal` (or per-slice `phase-4a-live-executor`, …).
3. Extend IMPL pseudo-code with **`LIVE_EXECUTOR_TS`**, **`CHECKLIST_RUN_TS`**, and removal blocks; run **`pseudocode_validate`** before RED tests.
4. Run **`tied_checklist_gate_validate`** with `phase: pre_implementation`, updated Tracker + [CITDP](../../tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml), identity-bound activation evidence at integrated depth.
5. PRELOAD [fidelity-research.md](../../tied/vocab/fidelity-research.md) + [quality-assurance.md](../../tied/vocab/quality-assurance.md); plan **`sub-adversarial-inquiry-pass`** artifacts under `working/REQ-TIED_UNIFIED_TOOLCHAIN/adversarial-inquiry/`.

**Recommended next prompt type:** **`build-plan`** on this PLAN scoped to Phase **4a** (or sponsor-approved slice).

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
| **RISK-UNIFIED-006** | Operators assume `TIED_AGENTSTREAM_IMPL=ts` is full TS | Medium | README + DIAGNOSTIC forwarding; PLAN dispatch table; default **`go`** until Phase **4c** |
| **RISK-UNIFIED-007** | Go oracle loss on removal breaks audit trail | Low | Freeze fixtures at **4d**; CITDP records last Go oracle commit (Phase **4** section) |

---

## Verification strategy

**When to run**

| Trigger | Actions |
| --- | --- |
| After any `@tied/*` or MCP hook change | `cd mcp-server && npm run build && npm test` |
| After Go agentstream touch | `cd tools/agentstream && go test ./...` |
| After adherence bridge change | `ruby scripts/test/adherence_append_action_attempted_test.rb` + MCP hook test |
| Before slice **close_out** | Unified close-out runner + envelope blocking (see close-out plan); `tied_validate_consistency` |
| Before claiming REQ **Implemented** | Full Phase 3b parity + Phase 4 gate; project **`tied_verify`** if verification-gated |

**Do not rely on** stale `working/REQ-TIED_UNIFIED_TOOLCHAIN/validate-consistency.json` alone—re-run `tied_validate_consistency` at gate time.

**Partial REQ policy:** Keep REQ **In Progress** until Phase 3b full parity + Phase 4 removal criteria met; slice close-outs use **`close_out`** gate, not full REQ completion.

---

## Test matrix (by phase / slice)

| Scope | Command / suite | Proves |
| --- | --- | --- |
| Workspace | `cd mcp-server && npm install && npm run build && npm test` | `@tied/cli`, bootstrap, yaml-cli, agentstream package tests, MCP e2e, adherence hook |
| Go baseline | `cd tools/agentstream && go test ./...` | Oracle for strangler parity |
| Adherence Ruby contract | `ruby scripts/test/adherence_append_action_attempted_test.rb` | Append-only hook semantics |
| Agentstream TS | `packages/agentstream` parity, dispatcher, tiedpreflight, tracker-migration-preview tests | Slice 1 + future slice RED/GREEN |
| Checklist goldens | `tools/agentstream/checklist/testdata/**` (via Go today; TS must match) | RISK-UNIFIED-001 |
| TIED YAML | `lint_yaml` on changed project YAML; **`tied_validate_consistency`** | Stack traceability |
| Gates | `tied_checklist_gate_validate` per phase; close-out runner for **`close_out`** | Checklist enforcement (advisory) |
| Phase **4a–4d** | `npm test` + Go oracle while present; post-**4d** TS-only + fixture oracle | Live executor parity; removal gate |
| Phase **4embed** | Spike notes only | Sponsor embed decision (non-blocking) |

Phase 0: TIED-only. Phase 1–3b: parity-first before expanding TS surface. Phase 4: parity-first before default flip and deletion.

---

## Open items / next execution entry point

**Recommended:** Optional **`build-plan`** for **4embed** spike only; otherwise Phase **4** arc is closed locally at **`72b7d9d`**.

**Post–4d process (2026-09-23):** **`traceable-commit`** completed with commit **`72b7d9d`**; arc **`close_out`** re-run → **`allowed: true`** ([phase4-full-close-out-gate.json](./gates/phase4-full-close-out-gate.json); advisory `finding_unresolved`, `warn_not_success`).

**Not recommended:** Committing gitignored gate JSON or ephemeral `token-create-*.json` receipts.

**Deferred / non-blocking**

- Bun CI experiment ticket (after workspace stable).
- Commit `working/**/token-create-*.json` (omit—re-run token tools if needed).
- **Push to origin:** Phase **4** close-out push requested 2026-09-23 (after commits **`72b7d9d`** + follow-on doc/fixture commit).
- Tier 3 Ruby YAML compare / `validate_tokens.sh` TS port (see Phase 4 **4b** / **4e** backlog).

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
| Git push | **Satisfied** at **`fbe65e1`** (2026-09-23); Phase **4** TBD |
| `profile_depth` for slice 2+ | **`integrated`** (upgrade from `minimal` used for slice 1 close-out) |
| Phase 4 refine (2026-09-22) | Slices **4a→4b→4c→4d** + optional **4embed**; live executor in **4a**; default **`ts`** in **4c**; Go delete in **4d**; OQ-4-1..4-4 documented in Phase 4 section |

**Vocabulary:** `linked plan`, `umbrella CLI`, `strangler slice`, `partial REQ delivery`, `profile_depth` **integrated**, `gate_policy` advisory, **Go-forward surface**, **deprecation window**, **oracle fixture freeze** — [citdp-planning-notes.md](./citdp-planning-notes.md); Touchpoint 3 **VALIDATE** at next commit.

---

## Plan (CITDP)

- **Change definition:** Multi-language operator tooling → phased TS/Node suite; **Phases 0–3b (2a–2d) shipped** on **`fbe65e1`**; **Phase 4** = live executor + default **`ts`** + Go/Ruby removal (+ optional embed spike).
- **Impact:** `ARCH-TIED_UNIFIED_TOOLCHAIN`; Go still authoritative for **live executor** and non-qualified argv; **`LIVE_EXECUTOR_TS`** / **`CHECKLIST_RUN_TS`** (planned IMPL blocks) before deletion.
- **Risk / depth:** `depth_tier: integrated`, `gate_policy: advisory`; RISK-UNIFIED-001..007; inquiry **required** for Phase 4 gates; CITDP `leap_feedback.record_status`: `applied_phase_3b_pushed`; Phase 4 planning in [citdp-planning-notes.md](./citdp-planning-notes.md).
- **Test strategy:** Matrix above; Phase 4 slices add RED parity for Go-forward categories before **4c** default flip and **4d** removal.

---

## Implement (outline — no code in refine-plan)

**Shipped (3b):** **EXECUTOR_DRY_RUN_TS**, **PIPELINE_BATCH_TS**, **CHECKLIST_RENDER_TS**, **ADHERENCE_STRANGLER_TS** on **`fbe65e1`**.

**Phase 4 `build-plan`** (extend pseudo-code first):

1. **LIVE_EXECUTOR_TS** (slice **4a**) — subprocess orchestration parity vs Go live path.
2. **CHECKLIST_RUN_TS** (slice **4a**) — non-preview checklist execution vs `checklist/testdata`.
3. **EXECUTOR_DRY_RUN_TS** / **PIPELINE_BATCH_TS** extensions (slice **4a**) — remaining dry-run disqualifiers.
4. **DEPRECATE_RUBY_AGENT_STREAM** + hook launcher removal (slice **4b**).
5. Default **`TIED_AGENTSTREAM_IMPL=ts`** + release notice (slice **4c**).
6. Go tree removal + oracle fixture freeze (slice **4d**).
7. Optional **4embed** spike — decision record only.

TDD order: pseudo-code validation → RED parity → GREEN port → composition → verification gate → Phase 4 arc **`close_out`** when sponsored.

Phase 0–3b production code **landed** through **`fbe65e1`** (see [Delivery snapshot](#delivery-snapshot-post-slice-1)).

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
| Phase **4b** | **`close_out`** | *Deferred* | Slice delivery; arc **`close_out`** after **4d** |
| Phase **4a** | **`close_out`** | *Deferred* | Slice delivery; arc **`close_out`** after **4d** |
| Phase **4d** | `pre_implementation` | **`allowed: true`**, advisory | [phase4d-pre_implementation-gate.json](./gates/phase4d-pre_implementation-gate.json); inquiry `phase4d-pre-impl-2026-09-23` |
| Phase **4d** | `verification` | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase4d-verification-gate.json](./gates/phase4d-verification-gate.json); inquiry `phase4d-verification-2026-09-23` |
| Phase **4** (arc) | **`close_out`** | **`allowed: true`**, advisory (`finding_unresolved`, `warn_not_success`) | [phase4-full-close-out-gate.json](./gates/phase4-full-close-out-gate.json); run_id `phase4-full-close-out-2026-09-23`; envelope blocking gaps **0**; commit **`72b7d9d`** |
| Phase **4** (arc) | **`tied_verify`** | **`ok: true`** (2026-09-23) | REQ **Implemented** / IMPL **Active** via [run-phase4d-tied-verify.mjs](./run-phase4d-tied-verify.mjs) + authoritative tracker |

**Integrated adversarial inquiry:** **not_applicable** for **slice 1** close-out (historical `minimal` depth). **Required** for **Phase 3b slice 2+** and **Phase 4** at `integrated` depth — activation collect + inquiry passes per [AGENTS.md](../../AGENTS.md) §3.3.1.
