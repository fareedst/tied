# Claude Code × TIED — multi-harness comparison

**Document role:** Comparison and **closure record** for the Claude multi-harness program—not an executable backlog. For maintenance traceability, use [`working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md).

**Audience:** TIED maintainers, client leads, and anyone porting TIED workflows from Cursor to Claude Code (or running both).

**Context:** External guidance often proposes a minimal pipeline—several planning skills, one `plan/PLAN.md`, one execute skill, project MCP, and thin `CLAUDE.md`. That pattern is directionally right (filesystem state, skill decomposition, MCP orthogonality) but **under-specifies** what TIED already ships: the REQ/ARCH/IMPL graph, CITDP, per-request **Authoritative Tracker**, adherence ledger, **Prompt Composer** (`global prompt skill` bundle), and the TypeScript **`tied agentstream`** checklist driver.

**Related:** [`tied-vs-disciplined-agentic-engineering.md`](tied-vs-disciplined-agentic-engineering.md), [`dae-mechanisms-for-tied-improvement.md`](dae-mechanisms-for-tied-improvement.md), [`../../working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md`](../../working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md).

**Status:** Sponsor-approved **full program** (Phases 0→3, decision log below). **`REQ-TIED_CLAUDE_HARNESS`**, **`REQ-TIED_CLAUDE_LIVE_DRIVER`**, **`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`**, and optional **`REQ-TIED_CLAUDE_SKILLS_REROOT`** are **Implemented** and closed. Remainder slices **R1–R8** (doc + hygiene) closed **2026-09-24** — see **What remains**. Sections labeled **Current** are evidence-backed against this repository; **Proposed** applies only to genuinely future sponsor scope (new REQ tokens), not shipped bootstrap, agentstream, or closed remainder work. This comparison doc does not hold project TIED YAML.

**Last updated:** 2026-09-24

**Operator entry:** Claude-first disposable client factory — `test-new-claude-tied-client` (bash via `scripts/build-commands.sh`) or `scripts\test-new-claude-tied-client.cmd` (Windows); direct CLI: `node tools/bootstrap/new-tied-client.mjs --disposable --harness claude`; re-validate an existing tree: `node scripts/run-tied-claude-client-validation.mjs` ([`tools/bootstrap/README.md`](../../tools/bootstrap/README.md) § Claude-first disposable client).

### What remains (2026-09-24) — program closed

Phases **0→3**, follow-on **`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`** / **`REQ-TIED_CLAUDE_LIVE_DRIVER`**, **`REQ-TIED_CLAUDE_SKILLS_REROOT`**, and remainder slices **R1–R8** are **complete**. There is **no open Claude multi-harness implementation backlog** in this repository—only doc maintenance, operator-only checks, and **new sponsor REQs** for future scope. Authoritative closure record: [`working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md).

| Slice | Owner | Status |
| --- | --- | --- |
| ~~**R1 — Doc reconcile**~~ ✅ **complete 2026-09-24** | Doc maintenance — [`r1-doc-reconcile-receipt.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/r1-doc-reconcile-receipt.md) | **Current** labels vs bootstrap + agentstream README |
| ~~**R2 — Stale B3 deferral note**~~ ✅ **complete 2026-09-24** | LEAP hygiene — [`skills-reroot-deferred.md`](../../working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/skills-reroot-deferred.md) | — |
| ~~**R3 — Optional repo-root `skills/` re-root (B3)**~~ ✅ **complete 2026-09-24** | [`REQ-TIED_CLAUDE_SKILLS_REROOT`](../../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml) · `TIED_SKILLS_REROOT=1` | — |
| ~~**R4 — Dual child REQ close-out LEAP**~~ ✅ **complete 2026-09-24** | [`working/REFINE-DUAL_REQ_CLOSE_OUT/`](../../working/REFINE-DUAL_REQ_CLOSE_OUT/) | — |
| ~~**R5 — Operator live Claude checklist**~~ ✅ **complete 2026-09-24** | Human operator (not CI) | [`operator-live-claude-smoke-r5.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/operator-live-claude-smoke-r5.md) · README § Operator live smoke |
| ~~**R6 — Interactive Claude IDE pilot**~~ ✅ **complete 2026-09-24** | Runbook + automatable preflight; human IDE session optional follow-up | [`operator-interactive-claude-ide-r6.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/operator-interactive-claude-ide-r6.md) · gap list § R6 cross-reference |
| ~~**R7 — Real CLI stream oracles**~~ ✅ **complete 2026-09-24** | Maintenance on **`REQ-TIED_CLAUDE_LIVE_DRIVER`** | [`r7-cli-oracle-capture-receipt.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/r7-cli-oracle-capture-receipt.md) · CLI **2.1.273** |
| ~~**R8 — Claude adherence hooks**~~ ✅ **N/A 2026-09-24** | Closed **N/A** (bootstrap ops B4) | [`r8-adherence-hook-bridge-na.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/r8-adherence-hook-bridge-na.md) · **RISK-BOOT-005** |

### Sponsor decision log (2026-09-23)

| # | Topic | Decision |
| --- | --- | --- |
| 1 | **Program scope** | **Full program:** Phases 0→3 in sequence with acceptance gates between phases—not doc-only or Phase 1–only stop by default. |
| 2 | **TIED traceability** | **Dedicated REQ** family (e.g. `REQ-TIED_CLAUDE_HARNESS` + ARCH/IMPL/CITDP/Tracker); do not fold solely into `REQ-TIED_SETUP`. |
| 3 | **Claude skill install** | **Copy by default** to `.claude/skills/`; optional env flag for Unix symlinks after CI proves Windows copy path. |
| 4 | **MCP bootstrap** | **Dual harness:** create-if-absent repo-root `.mcp.json`; **safe merge** adds `mcpServers.tied-yaml` only when missing; **Current** Cursor create-only policy unchanged. |
| 5 | **Automation** | **Phase 2 in same program** as Phase 1—`tied agentstream` Claude harness after Phase 1 acceptance; live runs gated on fixtures (not `--agent-path`). |
| 6 | **Feature orchestration** | **Client-development-index matrix:** REQ work → Prompt Composer; FEAT lifecycle → `feature-orchestrator`; shared TIED YAML MCP / `tied-cli`. |
| 7 | **Metrics** | **Harness dimension** on MCP usage (e.g. client id suffix or `TIED_MCP_HARNESS=cursor\|claude` in bootstrap templates). |

**Maintenance-only:** Interactive skill/MCP onboarding is **Current** (2026-09-24, including operator MCP approval)—see **Unresolved (discovery)** for adherence hooks only. Subprocess contract, bootstrap `.mcp.json` merge, Windows copy path, **real CLI stream oracles** (`fixtures/claude/`, CLI **2.1.273**), and optional **`skills/` re-root** (`TIED_SKILLS_REROOT`, [REQ-TIED_CLAUDE_SKILLS_REROOT](../../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml)) are **Current** in repo when explicitly enabled; default remains harness-native `.cursor/skills` and `.claude/skills`.

---

## Executive summary

| Generic Claude port idea | TIED-aligned response |
| --- | --- |
| Single `plan/PLAN.md` as all state | **Layered state:** project TIED YAML (canonical semantics) + `working/{REQ-TOKEN}/` (linked plan, CITDP, Authoritative Tracker, adherence) + optional `tied/features/` views |
| Five skills: requirements → architecture → implementation-plan → review → execute | **Reuse Prompt Composer** (`plan-new-feature`, `refine-plan`, `build-plan`, `plan-close-out`, `prompt-type-router`, `prompt-shared/`); validate Claude packaging before mapping invocations—do not fork a parallel taxonomy |
| Manual `/execute-plan` only | **`tied agentstream`** for automated checklist turns; **`--harness claude`** shipped (fixtures + operator live gate)—distinct from interactive skills |
| Put all invariants in `CLAUDE.md` | **`AGENTS.md` stays canonical**; `CLAUDE.md` = Claude-only deltas (skill paths, MCP file name, no Cursor **prompt-type subagent** wrappers) |
| Optional subagents everywhere | **Global prompt skills first**; isolated research (explore, security) only—same policy as TIED-source `.cursor/agents/` vs **client installation** |

**North star:** One workflow vocabulary, one **TIED YAML MCP** / `tied-cli` surface, one TypeScript checklist driver with explicit per-harness subprocess adapters. Cursor remains the reference automation path until a Claude contract is proven.

### Proposal status vocabulary

| Label | Meaning |
| --- | --- |
| **Current** | Shipped and verified in this repo (see citations). |
| **Proposed** | Future implementation slice with full TIED tracking. |
| **Unresolved** | Discovery or naming not yet evidenced—do not treat as shipped (see **Unresolved (discovery)**). |

---

## Operating modes (do not conflate)

| Mode | Preferred entry | Operator | TIED data |
| --- | --- | --- | --- |
| **Interactive Prompt Composer** | `/plan-new-feature`, `/refine-plan`, `/build-plan`, … | Human in IDE | **TIED YAML MCP** or **`tied-cli.sh`** in session |
| **Semi-automated** | Same skills + manual Tracker updates | Human per checklist slug | Not **`tied agentstream`** automation |
| **Automated checklist** | `tied agentstream -c … --checklist-tracker-yaml working/REQ-…/checklist-tracker.yaml …` | Shell / CI | Tracker receipts + adherence contracts enforced by driver |

A successful interactive `/build-plan` session is **not** evidence that automated **`tied agentstream`** works on Claude. Vocabulary: [`tied/vocab/agentstream.md`](../../tied/vocab/agentstream.md), [`tied/vocab/prompt-composer.md`](../../tied/vocab/prompt-composer.md).

Optional human-in-the-loop chain (Cursor: **`prompt-type sequence subagent`** `plan-refine-build`; Claude: equivalent only if skill invocations are verified):

```text
/plan-new-feature  →  review  →  /refine-plan  →  /build-plan
```

Do **not** ship one mega-skill that plans and executes without inspection (`disable-model-invocation: true` on leaf skills).

---

## What TIED already implements (Current)

```text
                    AGENTS.md + tied/docs/*
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
   TIED YAML MCP      Prompt Composer      tied agentstream
  (project YAML)   (bundled global skills)  (pipeline + executor)
         │                  │                  │
         └──────── working/{REQ}/ ────────────┘
           PLAN.md · CITDP · Tracker · adherence
                            │
                     source + tests
```

1. **Semantic DB** — Project YAML under `tied/` is the long-lived REQ/ARCH/IMPL graph. Markdown plans cannot replace MCP-addressable tokens, LEAP, or `tied_validate_consistency`.

2. **Prompt Composer** — Canonical **`global prompt skill`** bundle: [`tools/bundled-prompt-type-skills/`](../../tools/bundled-prompt-type-skills/). **Client installation:** [`copy_files.sh`](../../copy_files.sh) / `@tied/bootstrap` → `tools/bootstrap/` copies skills into `.cursor/skills/` (see [`tied/docs/prompt-type-skills.md`](../../tied/docs/prompt-type-skills.md)). **`prompt-type subagent`** wrappers under `.cursor/agents/` are TIED-source only and are **not** installed into clients.

3. **Linked plan vs Authoritative Tracker** — `working/{REQ-TOKEN}/PLAN.md` (or Cursor plan attachment) is the **linked plan** for `refine-plan` / `build-plan`. Full REQ execution uses the per-request **Authoritative Tracker** from [`tied/docs/agent-req-implementation-checklist.yaml`](../../tied/docs/agent-req-implementation-checklist.yaml), not prose in PLAN.md alone.

4. **`tied agentstream` (Current)** — `@tied/agentstream` assembles turns from argv, feature-spec batch, TDD YAML, and lead checklist; live execution spawns the Cursor `agent` CLI with `stream-json` parsing (`executor-run.ts`). **`--agent-path`** overrides the executable only; it does **not** implement a Claude harness. Dispatcher is TypeScript-only after Phase **4d**; live checklist + `--checklist-tracker-yaml`, adherence ledger, and optional MCP preflight are supported. See [`mcp-server/packages/agentstream/README.md`](../../mcp-server/packages/agentstream/README.md).

5. **Bootstrap / MCP (Current)** — [`tools/bootstrap/lib/mcp-config.mjs`](../../tools/bootstrap/lib/mcp-config.mjs): **`initializeTiedMcpConfig`** creates `.cursor/mcp.json` with `tied-yaml`, `TIED_BASE_PATH`, and optional metrics **only when the file is absent**; existing Cursor files are untouched (**MCP config preservation**). **`initializeClaudeMcpConfig`** creates or **safe-merges** repo-root **`.mcp.json`** with `tied-yaml` and `TIED_MCP_HARNESS=claude`. [`bootstrapTied`](../../tools/bootstrap/lib/bootstrap.mjs) installs Cursor skills under `.cursor/skills/` and Claude skills under **`.claude/skills/`** (copy default; Unix symlink opt-in only when `windows_copy_proven_in_ci` is true—see `GATE_SYMLINK_ON_WINDOWS_PROOF` in [`claude-harness.test.mjs`](../../tools/bootstrap/lib/claude-harness.test.mjs)). Windows smoke asserts Claude artifacts via [`assert-windows-bootstrap-claude.mjs`](../../tools/bootstrap/lib/assert-windows-bootstrap-claude.mjs).

Replacing this with a generic five-stage PLAN.md pipeline would drop checklist gates, Tracker receipts, adherence reconciliation, and traceability.

### Post–Phases 0–3 (parent closed → follow-on REQs)

Parent **`REQ-TIED_CLAUDE_HARNESS`** delivered Phase 0 pilot, Phase 1 dual bootstrap, Phase 2 **dry-run** `--harness claude`, and Phase 3 client-development-index matrix. Residual work is split explicitly:

| Phase (parent program) | Shipped in parent | Follow-on REQ | Status (2026-09-24) |
| --- | --- | --- | --- |
| 0 — Pilot / contracts | Phase 0 checklists under `working/REQ-TIED_CLAUDE_HARNESS/phase0/` | — | **Closed** with parent |
| 1 — Dual bootstrap | `.claude/skills/` copy, repo-root `.mcp.json` safe merge, harness metrics | **`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`** B1 Windows asserts + smoke proof | **Closed** — Windows CI green ([run 36031010940](https://github.com/fareedst/tied/actions/runs/36031010940)); `WINDOWS_COPY_PROVEN_IN_CI` **true** in [`constants.mjs`](../../tools/bootstrap/lib/constants.mjs) (symlink still opt-in) |
| 2 — Agentstream harness | `--harness claude` **dry-run** placeholder; Cursor live path unchanged | **`REQ-TIED_CLAUDE_LIVE_DRIVER`** — live AgentDriver, frozen stream oracles, composition | **Implemented** (fixture CI; no live Claude in CI) |
| 3 — Ergonomics / index | Multi-harness section in [`client-development-index.md`](../../tied/docs/client-development-index.md) | **`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`** B2 symlink gate (test-proven opt-in), B4 adherence spike, **B5 this doc**; optional B3 via **`REQ-TIED_CLAUDE_SKILLS_REROOT`** (`TIED_SKILLS_REROOT=1`, default off) | B2 + B5 + **R3/B3** green (2026-09-24); B4 not_applicable (see `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/`) |

---

## Target architecture (Current)

Dual-harness view—matches **`tools/bootstrap/`** output after Phase 1 + bootstrap ops close-out.

```text
                         AGENTS.md  (vendor-neutral obligations)
                              │
        ┌─────────────────────┴─────────────────────┐
   CLAUDE.md (thin)                          .cursor/rules loader
        │                                           │
        └───────────────┬───────────────────────────┘
                        │
         tools/bundled-prompt-type-skills/
         tools/bundled-tied-yaml-skill/     ← canonical sources
                        │
         ┌──────────────┼──────────────┐
  .cursor/skills/  .claude/skills/   skills/ (optional — TIED_SKILLS_REROOT=1)
  (bootstrap)      (copy default)     (default off; both harnesses when enabled)
         │              │
         └──── prompt-shared + leaf SKILL.md
                        │
    Interactive Prompt Composer     tied agentstream (automated)
                        │
         working/{REQ}/ + project tied/ via TIED YAML MCP or tied-cli
```

| Layer | Role | Claude (Current) |
| --- | --- | --- |
| Process | Interactive **global prompt skills** | `.claude/skills/<prompt-type>/SKILL.md` — copy-default from bootstrap ([`skills.mjs`](../../tools/bootstrap/lib/skills.mjs), [`README.md`](../../tools/bootstrap/README.md)) |
| Capabilities | **TIED YAML MCP** + **`tied-cli`** | Repo-root **`.mcp.json`** safe-merge for `tied-yaml` + `TIED_MCP_HARNESS=claude` ([`mcp-config.mjs`](../../tools/bootstrap/lib/mcp-config.mjs)); CLI fallback per [`tied/vocab/tied-yaml-mcp.md`](../../tied/vocab/tied-yaml-mcp.md) |
| State | TIED indexes, CITDP, Authoritative Tracker, linked PLAN | Unchanged repo paths |
| Automation | Turn assembly, Tracker receipts, subprocess | **`--harness claude`** + **`AgentDriver`** ([`REQ-TIED_CLAUDE_LIVE_DRIVER`](../../tied/requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml)); Cursor remains default live path |

---

## Mapping: generic stages → Prompt Composer

| Generic | TIED surface | Notes |
| --- | --- | --- |
| `/requirements` | **`plan-new-feature`** (Refine + impact) | REQ tokens + CITDP, not PLAN-only prose |
| `/architecture` | CITDP + ARCH during **Plan** | [`tied-plan-citdp.md`](../../tools/bundled-prompt-type-skills/prompt-shared/tied-plan-citdp.md)—not a separate skill unless sponsor splits UX |
| `/implementation-plan` | IMPL pseudo-code + test strategy + Tracker copy | Gated at `pre_implementation`; sidecar is critical |
| `/review-plan` | **`refine-plan`** | Linked plan + stack consistency |
| `/execute-plan` | **`build-plan`** (interactive) **or** **`tied agentstream`** (automated) | Different contracts—see operating modes |

---

## MCP plan

### Invariants (Current)

- **Server:** `mcp-server/dist/index.js` or `tied mcp`; bootstrap **safe-merge** for repo-root `.mcp.json` is covered by [`claude-harness.test.mjs`](../../tools/bootstrap/lib/claude-harness.test.mjs). **Interactive** Claude IDE MCP auth/load remains operator-verified (R6).
- **TIED base path:** absolute path to the active repo’s `tied/`; confirm with **`tied_config_get_base_path`** before any project YAML write ([`tied/vocab/tied-yaml-mcp.md`](../../tied/vocab/tied-yaml-mcp.md), RISK-010).
- **Writes:** project YAML only—never `tied/methodology/`.
- **Without IDE MCP:** **`tied-cli.sh`** per [`tied/docs/using-tied-without-mcp.md`](../../tied/docs/using-tied-without-mcp.md)—not ad-hoc index edits.

### Bootstrap dual harness (Current — sponsor-locked)

Shipped in **`tools/bootstrap/`** (via `@tied/bootstrap` / `copy_files.sh`). Env/flag names (e.g. symlink opt-in) are pinned by RED tests in [`claude-harness.test.mjs`](../../tools/bootstrap/lib/claude-harness.test.mjs).

| File | Policy |
| --- | --- |
| `.cursor/mcp.json` | Create-if-absent only (`initializeTiedMcpConfig` in [`mcp-config.mjs`](../../tools/bootstrap/lib/mcp-config.mjs)); unchanged |
| `.mcp.json` (repo root) | Create-if-absent **or** **safe merge**—add `mcpServers.tied-yaml` only when missing (`initializeClaudeMcpConfig`) |
| Skills | **Copy by default** to `.claude/skills/`; optional Unix symlinks when `WINDOWS_COPY_PROVEN_IN_CI` is true and env opt-in is set |
| Metrics | **`TIED_MCP_HARNESS=claude`** (or cursor equivalent) in bootstrap-generated MCP env blocks |
| `CLAUDE.md` | Optional create-if-absent from [`CLAUDE.md.template`](../../tools/bootstrap/templates/CLAUDE.md.template) ([`claude-md.mjs`](../../tools/bootstrap/lib/claude-md.mjs)) |

Do **not** claim Cursor `.cursor/mcp.json` copies verbatim to Claude; do **not** change Cursor create-only policy without a separate sponsor change.

Planning and execution paths both instruct MCP/`tied-cli` for YAML and validation tools (`tied_validate_consistency`, `tied_checklist_gate_validate`, project verify) per Tracker slugs.

---

## Skill portability (Current)

Interactive **global prompt skills** are not the automated executor. Bootstrap **copy-default** install preserves the same bundles as Cursor; explicit-only activation, section order, linked-plan semantics, and **TIED applicability boundary** remain skill-author obligations. **R6:** runbook + preflight complete; verify Claude’s discovery/front-matter in a live IDE session only if onboarding gaps appear (not a program blocker).

| Step | Action | Default |
| --- | --- | --- |
| A | Dual install from [`tools/bundled-prompt-type-skills/`](../../tools/bundled-prompt-type-skills/) + [`tools/bundled-tied-yaml-skill/`](../../tools/bundled-tied-yaml-skill/) | **Copy** to `.claude/skills/`; symlinks opt-in after CI |
| B | Optional repo-root `skills/` re-root (**R3 / B3**) | **Current** — **`TIED_SKILLS_REROOT=1`** when `WINDOWS_COPY_PROVEN_IN_CI` and ARCH gates pass; default **off** ([`REQ-TIED_CLAUDE_SKILLS_REROOT`](../../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml), [`skills-reroot.mjs`](../../tools/bootstrap/lib/skills-reroot.mjs)) |
| C | Harness appendix files | Optional if front matter diverges; not required for current copy path |

Adjust only harness-specific lines in front matter or a one-line install-path note—do not silently rewrite canonical `tools/bundled-prompt-type-skills/`.

**Minimal `CLAUDE.md` (Current template — bootstrap create-if-absent):**

```markdown
# Claude Code — TIED project

Load **AGENTS.md** for all obligations.

- Planning: `.claude/skills/` (installed by bootstrap copy-default).
- Automated checklist: `tied agentstream` (Node ≥18)—separate from interactive skills.
- TIED data: verified Claude **TIED YAML MCP** config or `tied-cli.sh`; confirm **TIED base path** matches this repo’s `tied/`.
- Linked plans: `working/{REQ-TOKEN}/PLAN.md`; canonical tokens: `tied/`.
- Do not substitute conversational plan mode for Authoritative Tracker + project YAML.
```

---

## Harness adapter for `tied agentstream` (Current)

**Cursor executor (default live):** `agentArgv()` → Cursor `agent --print --output-format stream-json …`; `runAgent()` parses NDJSON with `session_id`, `thinking` deltas, `assistant.message.content`.

| Profile | Subprocess | When |
| --- | --- | --- |
| **`cursor`** (default) | Cursor `agent` | Default live checklist |
| **`claude`** | Claude Code CLI + dedicated parser (`REQ-TIED_CLAUDE_LIVE_DRIVER`) | Fixture-gated CI; operator live with `AGENTSTREAM_CLAUDE_LIVE_OK=1` |
| **`dry-run`** | None | Existing `-d` |

**Shipped:** `AgentDriver` boundary, frozen oracles under [`fixtures/claude/`](../../mcp-server/packages/agentstream/fixtures/claude/), **`--harness claude`** — **not** `--agent-path claude` (**`--agent-path`** overrides Cursor executable only). See [`agentstream` README](../../mcp-server/packages/agentstream/README.md).

**Adherence:** Cursor `.cursor/hooks.json` → append-only adherence bridge. Claude hooks: **not_applicable** at bootstrap ops close-out (B4)—manual `tied agentstream adherence-reconcile` + Tracker discipline when running Claude interactively.

---

## Subagents

| Use | Avoid |
| --- | --- |
| Repo exploration, dependency audit, read-only security | Sequential plan → refine → build (use skills + filesystem state) |
| Optional forked research inside refine / CITDP | Replacing Tracker writes or MCP YAML mutations |

Do not assume Claude `.claude/agents/` mirrors TIED-source **prompt-type subagents**; any future wrapper needs its own contract tests and stays out of the client skill bundle.

---

## Phased delivery (historical archive)

**Status:** Phases **0→3** **closed** under **`REQ-TIED_CLAUDE_HARNESS`**; follow-on **`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`**, **`REQ-TIED_CLAUDE_LIVE_DRIVER`**, and remainder **R1–R8** **complete**. Use **What remains (2026-09-24)** for maintenance pointers—not the tables below as a backlog.

**Program (archive):** Phases **0→3** in one **`REQ-TIED_CLAUDE_HARNESS`** arc (sponsor-locked). Each phase ended with **go/no-go** (historical only—program is closed); acceptance was Tracker slugs + tests.

### Phase 0 — Interactive pilot (closed)

| | |
| --- | --- |
| **Deliverables** | Pilot notes under `working/REQ-TIED_CLAUDE_HARNESS/`; gap list (skill discovery, MCP auth, tool semantics, session behavior); **TIED base path** checklist ([`tied/vocab/tied-yaml-mcp.md`](../../tied/vocab/tied-yaml-mcp.md)) |
| **Acceptance** | One checklist-driven REQ slice exercised in Claude via **temporary** skill copy + documented MCP/`tied-cli` setup; contracts for Phase 1 bootstrap and Phase 2 fixtures written down; **no** canonical `tools/bootstrap/` or agentstream code changes |
| **Decision point** | *(Historical.)* Go to Phase 1 only when skill + MCP + CLI discovery gaps are documented |

Do **not** claim **`tied agentstream`** Claude automation from the pilot.

### Phase 1 — Bootstrap dual harness (closed)

| | |
| --- | --- |
| **Deliverables** | Copy install to `.claude/skills/`; repo-root `.mcp.json` create-if-absent + **safe merge** for `tied-yaml`; harness metrics env; RED bootstrap contract tests; optional minimal `CLAUDE.md` template (this doc) if ARCH approves ownership |
| **Acceptance** | Fresh temp client: **Current** `.cursor/skills/` + create-only `.cursor/mcp.json` behavior unchanged; Claude paths added without clobbering existing MCP servers; Windows copy path covered in CI; **`TIED_MCP_HARNESS`** (or equivalent) present in generated config |
| **Decision point** | *(Historical.)* Go to Phase 2 when bootstrap tests green and Phase 0 contract notes are reflected in IMPL pseudo-code |
| **Explicit non-goal** | No **`tied agentstream`** subprocess/harness changes |

### Phase 2 — Agentstream Claude profile (closed — live in LIVE_DRIVER)

| | |
| --- | --- |
| **Deliverables** | `AgentDriver` boundary (or equivalent), **`--harness claude`**, README contract (CLI version pin, permissions, MCP load, stream limits), driver unit + composition fixtures |
| **Acceptance** | `npm test` green in `mcp-server/packages/agentstream`; dry-run unchanged; live checklist + session chain + Tracker receipt tests on **Claude fixtures** (not `--agent-path` alone) |
| **Decision point** | *(Historical.)* Enable operator live Claude checklist runs only when fixture contracts pass; operator path documented in agentstream README |

### Phase 3 — Ergonomics and index (closed)

| | |
| --- | --- |
| **Deliverables** | **Client-development-index REQ vs FEAT matrix** (REQ work → Prompt Composer; FEAT lifecycle → **`feature-orchestrator`**; shared **TIED YAML MCP** / **`tied-cli`**); optional repo-root `skills/` re-root; DAE-style Step-0 for interactive sessions if it adds value ([`dae-mechanisms-for-tied-improvement.md`](dae-mechanisms-for-tied-improvement.md)); Claude adherence hook bridge **N/A** until stable upstream hook points ([R8 receipt](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/r8-adherence-hook-bridge-na.md)) |
| **Acceptance** | Matrix published in [`tied/docs/client-development-index.md`](../../tied/docs/client-development-index.md); Phase 3 slices marked complete or explicitly deferred in Authoritative Tracker with sponsor note |
| **Decision point** | *(Historical.)* Program close-out when Phases 0–2 acceptance met and Phase 3 matrix recorded — **met 2026-09-24** |

### Cross-phase exit gates (historical — not an active checklist)

These gates applied while the program was open. For **new** sponsor scope, use **`plan-new-feature`** and the Authoritative Tracker—not this list.

- `tied_validate_consistency` on touched Claude REQ project YAML.
- Bootstrap integration tests: Cursor create-if-absent preserved; Claude copy + `.mcp.json` safe merge + harness metrics covered.
- Agentstream test suite green; Claude **live** mode additionally requires LIVE_DRIVER fixtures.
- Client-development-index matrix updated when Phase 3 closed (done).

---

## Implementation entry (complete — maintenance only)

The parent program opened with **`plan-new-feature`** as **`REQ-TIED_CLAUDE_HARNESS`** (Phases **0→3**). That arc is **Implemented** and closed. Follow-ons **`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`**, **`REQ-TIED_CLAUDE_LIVE_DRIVER`**, **`REQ-TIED_CLAUDE_SKILLS_REROOT`**, and remainder **R1–R8** are also **complete**.

**Maintenance entry points (no open program backlog):**

| Goal | Entry | Notes |
| --- | --- | --- |
| Doc truth vs bootstrap / agentstream | Edit this doc; cross-check [`tools/bootstrap/README.md`](../../tools/bootstrap/README.md) and [`agentstream` README](../../mcp-server/packages/agentstream/README.md) | Closure record [`working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md) |
| New Claude harness scope | **`plan-new-feature`** | **New REQ token** — do not reopen closed REQs without sponsor LEAP |
| LEAP / commit hygiene on closed REQs | **`plan-close-out`** | Sponsor-directed only (e.g. [`working/REFINE-DUAL_REQ_CLOSE_OUT/`](../../working/REFINE-DUAL_REQ_CLOSE_OUT/)) |

**Archive — original phase ordering (REQ-TIED_CLAUDE_HARNESS):** Refine + CITDP + Tracker → Phase 0 pilot notes → Phase 1 bootstrap → Phase 2 dry-run harness → Phase 3 index matrix; live driver and bootstrap ops then split to follow-on REQs as recorded in **Post–Phases 0–3**.

Do **not** create new REQ/ARCH/IMPL YAML from this comparison doc without **`plan-new-feature`** and **`tied_config_get_base_path`** confirmation.

### Interactive onboarding (Current — 2026-09-24)

| Evidence | What it proves |
| --- | --- |
| [`interactive-claude-onboarding-2026-09-24.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/interactive-claude-onboarding-2026-09-24.md) | Prompt Composer slash skills + stdio MCP on bootstrapped client (Claude Code **2.1.273**) |
| [`interactive-claude-mcp-approved-stdout.txt`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/interactive-claude-mcp-approved-stdout.txt) | Operator approval → **`tied-yaml` ✔ Connected**; default-session MCP tool use |
| [`operator-claude-factory-validation-attestation-2026-09-24.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/operator-claude-factory-validation-attestation-2026-09-24.md) | Sponsor: **`test-new-claude-tied-client`** + **`--with-claude-code-interactive-smoke`** validation green |
| [`operator-live-claude-agentstream-2026-09-24.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/operator-live-claude-agentstream-2026-09-24.md) | Live **`--harness claude`** one-turn with **`AGENTSTREAM_CLAUDE_LIVE_OK=1`** (operator gate finalized) |

Runbook: [`operator-interactive-claude-ide-r6.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/operator-interactive-claude-ide-r6.md). Re-smoke: bootstrap README § validation flags.

---

## TIED stack boundary (for implementers)

This document is **comparison-only**—no project REQ/ARCH/IMPL detail files here. Implementation of **`REQ-TIED_CLAUDE_HARNESS`** follows [`tied/docs/agent-req-implementation-checklist.yaml`](../../tied/docs/agent-req-implementation-checklist.yaml): Authoritative Tracker copy, CITDP persistence, `tied_checklist_gate_validate` at `pre_implementation`, IMPL pseudo-code + validation before RED tests, composition tests for MCP/subprocess bindings, verification gate + close-out.

| Concern | Current owner | Maintenance notes |
| --- | --- | --- |
| Interactive taxonomy | `tools/bundled-prompt-type-skills/` → `.cursor/skills/` + `.claude/skills/` | Optional repo-root **`skills/`** when **`TIED_SKILLS_REROOT=1`** ([**R3**](../../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml)) |
| TIED data access | **TIED YAML MCP** + **`tied-cli`** | Interactive Claude onboarding **Current** — [`interactive-claude-onboarding-2026-09-24.md`](../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/interactive-claude-onboarding-2026-09-24.md) |
| Feature orchestration | **`feature-orchestrator`** / `tied/features/` | Matrix shipped in [`client-development-index.md`](../../tied/docs/client-development-index.md) |
| Checklist driver | `@tied/agentstream` — **`--harness claude`** + fixtures | ~~Operator live smoke (R5)~~ ✅; ~~real CLI oracles (R7)~~ ✅ **2.1.273**; ~~Claude adherence hook bridge (R8)~~ ✅ **N/A** (Cursor `.cursor/hooks` only) |
| Agent subprocess | Cursor `agent` (default live) + Claude **AgentDriver** | — |
| Bootstrap | Dual harness in `tools/bootstrap/` | **R3/B3** optional re-root shipped (default off); post-CI LEAP complete (**R4**) |
| Canonical intent | Project TIED YAML + IMPL pseudo-code | Never PLAN.md / CLAUDE.md alone |

---

## Non-goals

- PLAN.md-only workflows replacing TIED YAML.
- Parallel requirements/architecture/review skill taxonomy.
- Mandating Claude for TIED methodology development (Cursor remains reference).
- Embedding Node in the CLI (unchanged unified-toolchain scope).
- `--agent-path` as a Claude adapter.
- Claude live checklist automation before contract tests.
- Auto-push / auto-merge from agentstream.

---

## Unresolved (discovery)

Per **Proposal status vocabulary**, items here are **Unresolved**—not **Current** and not **Proposed** implementation backlog.

**Sponsor policy (2026-09-24):** **Watch-only** for the row below—**no new REQ** until upstream Claude Code exposes a stable project hook contract; re-probe periodically and document in bootstrap ops evidence (**RISK-BOOT-005**). Skill install stays **copy-default** (Unix symlinks remain optional, Deferred—no program work).

| Item | Status | Notes |
| --- | --- | --- |
| Future Claude adherence hook bridge | **Unresolved (watch-only)** | R8 closed **N/A**; Cursor **`.cursor/hooks`** only today. On Claude: manual **`tied agentstream adherence-reconcile`** + Tracker discipline. Open **`plan-new-feature`** only after hook contract is evidenced—not by default. |

**Moved to Current (not listed here):** Interactive skill/MCP onboarding (§ **Interactive onboarding** above); Claude subprocess/stream oracles (**`fixtures/claude/`**, LIVE_DRIVER); bootstrap **`.mcp.json` safe merge**; Windows copy proof; REQ family tokens; remainder slices R1–R8.

**build-plan** vs **`tied agentstream`** remain distinct operating modes ([§ Operating modes](#operating-modes-do-not-conflate)).
