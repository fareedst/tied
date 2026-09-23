# Unified TIED developer toolchain — linked plan

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml) (**In Progress**, partial) |
| **ARCH** | [ARCH-TIED_UNIFIED_TOOLCHAIN](../../tied/architecture-decisions/ARCH-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **IMPL** | [IMPL-TIED_UNIFIED_TOOLCHAIN](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN.yaml) · [pseudo-code](../../tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md) |
| **CITDP** | [CITDP-REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml) |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) (unified Phase **3b close_out** arc; archived at [checklist-tracker-phase3b-unified-closed.yaml](./checklist-tracker-phase3b-unified-closed.yaml)) |
| **Last delivery** | **2026-09-23** — **`fbe65e1`** on `origin/main` (stack **`a23d939`** + Phase **3b slices 2a–2d** + close_out evidence) |
| **profile_depth** | **`integrated`** (sponsor 2026-09-22; effective **Phase 3b slice 2+**; slice 1 arc closed at `minimal`) |
| **gate_policy** | `advisory` |
| **Git push policy** | **Satisfied** 2026-09-23 — deferred push milestone met at **`fbe65e1`**; Phase **4** is a separate arc |

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
3. **Phase 3b remainder + Phase 4:** checklist render/expansion, pipeline, executor dry-run TS-native, adherence strangler; then Go/Ruby removal after full parity—each slice with RED parity tests before defaulting `TIED_AGENTSTREAM_IMPL=ts`.
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
| **4** | Not started | Legacy removal; optional embed **evaluation only** |

**REQ satisfaction:** Partial—Tier 1 suite and **Phase 3b qualified argv** (2a–2d) are **shipped on origin**; live executor default and Phase 4 Go/Ruby removal are **not** done.

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
tied agentstream  → TS entry; preview native; other argv → Go when impl=ts (DIAGNOSTIC)
```

### Cursor MCP config story

| Phase | Config |
| --- | --- |
| **1–2 (now)** | `node <repo>/mcp-server/dist/index.js` or `tied mcp` |
| **Invariant** | `TIED_BASE_PATH` semantics unchanged; `tied_config_get_base_path` mandatory |

### Agentstream dispatch (Phase 3b complete — slices 2a–2d)

| `TIED_AGENTSTREAM_IMPL` | Qualified argv (TS-native, no Go forward) | Unqualified argv |
| --- | --- | --- |
| **`go`** (default) | N/A — Go binary for all argv | Go binary |
| **`ts`** | `--checklist-tracker-preview` + `-c`; `--preview-lead-checklist` + `-c`; `--preview-feature-spec-batch-yaml`; qualified pipeline `-d` (see `@tied/agentstream` README); `adherence-reconcile` or `--tracker` reconcile surface | **Forward to Go** with stderr `DIAGNOSTIC` (live executor, checklist run, etc.) |

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
| **4** | Legacy removal + optional embed | Remove Go/Ruby after full parity | One release cycle; sponsor embed decision | **Not started** |

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

**Exit for Phase 3b (full):** With `TIED_AGENTSTREAM_IMPL=ts`, documented operator flows run without Go forward (except explicit shim fallback flag if retained); Go test suite remains green until Phase 4 removal gate.

---

## Risks and mitigations

| ID | Risk | L | Mitigation |
| --- | --- | --- | --- |
| **RISK-UNIFIED-001** | Agentstream Go→TS size (~14k LOC) and checklist/adherence regression | High | Strangler slices; golden fixtures; per-slice RED parity |
| **RISK-UNIFIED-002** | `TIED_BASE_PATH` footguns when one CLI serves MCP | Medium | `tied_config_get_base_path`; one-window-per-repo docs; integration tests |
| **RISK-UNIFIED-003** | Windows path and stdio MCP fragility | Medium | Bootstrap path helpers; win32 CI where available |
| **RISK-UNIFIED-004** | TS subprocess orchestration performance vs Go | Low | Benchmark executor; Go shim only if data proves need |
| **RISK-UNIFIED-005** | YAML canonicalization Ruby-backed today | Medium | `@tied/yaml-cli` + MCP canonicalizer; retire shell front-end when compare ported |
| **RISK-UNIFIED-006** | Operators assume `TIED_AGENTSTREAM_IMPL=ts` is full TS | Medium | README + DIAGNOSTIC forwarding; PLAN dispatch table; docs until slice 2+ completes |

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

Phase 0: TIED-only. Phase 1+: parity-first before deprecating Go/Ruby paths.

---

## Open items / next execution entry point

**Recommended:** Phase 3b **tooling strangler complete (2a–2d)** — next **`build-plan`** or sponsor close-out for per-slice **`close_out`** envelopes; **Phase 4** legacy removal is a separate arc.

**Before `build-plan` (slice 2):**

1. Copy or reset [checklist-tracker.yaml](./checklist-tracker.yaml) from [agent-req-implementation-checklist.yaml](../../tied/docs/agent-req-implementation-checklist.yaml) (per-request Tracker hygiene).
2. Set Tracker `record_identity.profile_depth: integrated`, `gate_policy: advisory`; align with CITDP `depth_tier: integrated`.
3. Run **`tied_checklist_gate_validate`** with `phase: pre_implementation`, updated Tracker + CITDP, **`profile_depth: integrated`**, `gate_policy: advisory`.
4. At **integrated** depth: PRELOAD fidelity/QA glossaries; plan **`sub-adversarial-inquiry-pass`** at structural, pre-RED, and verification (persist artifacts under `working/REQ-TIED_UNIFIED_TOOLCHAIN/adversarial-inquiry/` when MCP runs inquiry).
5. Extend IMPL pseudo-code only if slice scope changes; run pseudo-code validation before RED tests.

**Not recommended:** Ad-hoc strangler coding without Tracker + pre_implementation gate (same REQ, same plan file is fine).

**Deferred / non-blocking**

- Bun CI experiment ticket (after workspace stable).
- Commit `working/**/token-create-*.json` (omit—re-run token tools if needed).
- **Push to origin:** **done** at **`fbe65e1`** (2026-09-23); Phase **4** push policy TBD when that arc sponsors delivery.

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

**Vocabulary:** `linked plan`, `umbrella CLI`, `strangler slice`, `partial REQ delivery`, `profile_depth` **integrated** (slice 2+) / `gate_policy` advisory, **deferred push** — [citdp-planning-notes.md](./citdp-planning-notes.md); Touchpoint 3 **VALIDATE** at next commit.

---

## Plan (CITDP)

- **Change definition:** Multi-language operator tooling → phased TS/Node suite; **Phases 0–3b slice 1 shipped**; remainder = agentstream strangler + Phase 4 removal.
- **Impact:** `ARCH-TIED_UNIFIED_TOOLCHAIN`, bootstrap/yaml/adherence modules **integrated**; Go `tools/agentstream` still authoritative for most argv; future LEAP on full parity.
- **Risk / depth:** `depth_tier: integrated` (slice 2+), `prior_depth_tier: minimal`, `gate_policy: advisory`; RISK-UNIFIED-001..006; integrated adversarial inquiry **required** for slice 2+ gates unless documented waiver; CITDP `leap_feedback.record_status`: `applied_phase_3b`.
- **Test strategy:** Matrix above; each backlog slice adds RED parity before shrinking Go forward surface.

---

## Implement (outline — no code in refine-plan)

Slice 2+ **`build-plan`** implements per IMPL blocks under **`AGENTSTREAM_STRANGLER` BACKLOG**:

1. **EXECUTOR_DRY_RUN_TS** (slice 2a) — TS-native dry-run; Go oracle tests.
2. **PIPELINE_BATCH_TS** (slice 2b) — pipeline + batch driver subset.
3. **CHECKLIST_RENDER_TS** (slice 2c) — render/expansion vs checklist testdata.
4. **ADHERENCE_STRANGLER_TS** (slice 2d) — adherence paths + gate integration.

TDD order: pseudo-code validation → RED parity → GREEN port → composition → verification gate → **`close_out`** per slice when sponsored.

Phase 0–3b slice 1 production code **already landed** in `a23d939` (see [Delivery snapshot](#delivery-snapshot-post-slice-1)).

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

**Integrated adversarial inquiry:** **not_applicable** for **slice 1** close-out (historical `minimal` depth). **Required** for **slice 2+** at `integrated` depth — activation collect + inquiry passes per [AGENTS.md](../../AGENTS.md) §3.3.1.
