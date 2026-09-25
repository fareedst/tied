# Client development index — minimal CITDP + LEAP + TIED

**Audience**: Engineers and AI agents in a **TIED client project** (after `copy_files.sh`).

**Purpose**: One page that names the **smallest document set** needed to apply the **vocabulary layer** (shared domain language), **TIED** (traceable REQ → ARCH → IMPL → tests → code), **CITDP** (structured change analysis), and **LEAP** (keep docs and code aligned) on every development task.

**Process spine**: `[PROC-AGENT_REQ_CHECKLIST]` in [agent-req-implementation-checklist.md](agent-req-implementation-checklist.md).

---

## The three pieces (30 seconds)

| Piece | Client nickname | What it does |
| --- | --- | --- |
| **Vocabulary** | **Shared language** | Resolves sponsor terms, routes pre-read context, records naming bridges, and validates names across artifacts. |
| **TIED** | **Traceability stack** | Records intent in YAML tokens and IMPL pseudo-code; links requirements, design, tests, and code using vocabulary terms. |
| **CITDP** | **Change analysis** | Before code: define the change, blast radius, risks, test plan; after: persist `tied/citdp/CITDP-*.yaml`. |
| **LEAP** | **Stack sync** | When tests or code disagree with IMPL, update **IMPL first**, then ARCH/REQ if scope changed—not silent drift. |

**Mandatory build order**: complete IMPL pseudo-code (with block token comments) → failing tests → minimal code → composition → E2E only when required → validate and sync the stack.

---

## Core seven — read these for every project

Use these **nicknames** in tickets, PRs, and agent prompts.

| # | Nickname | File | Read when |
| --- | --- | --- | --- |
| 1 | **Rules** | [`../../AGENTS.md`](../../AGENTS.md) | Session start; defines obligations, MCP base path, vocab touchpoints. |
| 2 | **Vocabulary** | Client [`../vocab/routing.md`](../vocab/routing.md) → methodology `../methodology/vocab/routing.md` → matched glossaries | **Before** reading TIED, source, or tests; resolve and preload terms across ownership layers, then record new names and validate before commit. |
| 3 | **Checklist** | [agent-req-implementation-checklist.md](agent-req-implementation-checklist.md) | **Every** new feature, change, or bug fix — the executable procedure. |
| 4 | **Tracker** | [agent-req-implementation-checklist.yaml](agent-req-implementation-checklist.yaml) | Copy to a working folder per task; record step completion (see YAML header). |
| 5 | **Processes** | [processes.md](processes.md) | Need the **definition** behind a checklist step. Read these sections only: `[PROC-CITDP]`, `[PROC-LEAP]`, `[PROC-TIED_DEV_CYCLE]`, `[PROC-IMPL_CODE_TEST_SYNC]`, `[PROC-TEST_STRATEGY]`, `[PROC-QUALITY_ASSURANCE]`, `[PROC-QUALITY_EVIDENCE_PROVENANCE]`, `[PROC-TEST_ADEQUACY]`, `[PROC-VOCABULARY_INDEX]`. |
| 6 | **Pseudo-code** | [pseudocode-writing-and-validation.md](pseudocode-writing-and-validation.md) | Authoring or repairing IMPL `essence_pseudocode`; three layers A/B/C; three-way alignment; LEAP micro-cycle. **New client projects** default to `Grammar-Version: v2` in the canonical sidecar template ([pseudocode-grammar-v2-migration.md](pseudocode-grammar-v2-migration.md)); optional grammar reads: [pseudocode-grammar.v1.md](pseudocode-grammar.v1.md), [pseudocode-grammar.v2.md](pseudocode-grammar.v2.md). |
| 7 | **Change records** | [citdp-policy.md](citdp-policy.md) + [citdp-record-template.yaml](citdp-record-template.yaml) | When to write a CITDP file; shape for `tied/citdp/CITDP-*.yaml`, quality evidence matrix, and residual-risk decisions. |

Quality assurance references: [quality-assurance-commands.md](quality-assurance-commands.md), [quality-evidence-manifest.md](quality-evidence-manifest.md), [quality-assurance-pilot.md](quality-assurance-pilot.md), [composition-coverage.md](composition-coverage.md), and [evidence-chain-profile.md](evidence-chain-profile.md) (`evidence_chain_profile_generate`, Path B manual, and the TIED-source offline **evidence chain statistics report** CLI).

**Session pairing**: read **Rules** and [ai-principles.md](ai-principles.md) (**Principles**) together at bootstrap — Principles expands the same mandates in checklist form.

---

## Quick reads (optional, ~15 minutes)

| Nickname | File | Why |
| --- | --- | --- |
| **LEAP overview** | [LEAP.md](LEAP.md) | Short rationale for why IMPL beats hunting source files. |
| **Diagrams** | [methodology-diagrams.md](methodology-diagrams.md) | Visual stack, LEAP loop, TDD inner loop, CITDP flow. |
| **Build order** | [implementation-order.md](implementation-order.md) | One-page mandatory sequence (also inside **Processes** § `[PROC-TIED_DEV_CYCLE]`). |

---

## Scenario → start here

| Situation | Start at | Also open |
| --- | --- | --- |
| New requirement | **Checklist** → `session-bootstrap` | **Pseudo-code** Track A; project YAML indexes below |
| Change existing behavior | **Checklist** → `change-definition` | **Processes** § `[PROC-CITDP]`; **Change records** |
| Upgrade TIED methodology | **methodology-migration.md** → Phase 0 | **Rules**, refreshed TIED YAML MCP, and the per-request Tracker |
| TIED already updated; code/tests lag | [tied-first-implementation-procedure.md](tied-first-implementation-procedure.md) (**TIED-first**) | **Checklist** with verify-only REQ/ARCH/IMPL steps |
| Bug fix | **Checklist** → `session-bootstrap` | Add REQ at `author-requirement` if missing |
| Fidelity research | **tied-fidelity-research.md** | Read-only stages 0–4 audit; preserve evidence; promote only after adjudication |
| New staged feature | **tied-feature-onboarding.md** → `tied init` | `.cursor/skills/tied-yaml/scripts/tied.sh feature new`; use the feature-orchestration MCP tools for lifecycle work |
| Tests/code diverged from IMPL | **Pseudo-code** § LEAP micro-cycle | **Processes** § `[PROC-LEAP]`; checklist `sub-leap-micro-cycle` |
| Repair without full new REQ | **Checklist** + **Pseudo-code** Track B or C | Same LEAP order |
| Claude Code client bootstrap | **Multi-harness entry matrix** (below) → **Rules** + **Checklist** `session-bootstrap` | [Claude Code × TIED multi-harness plan](../../docs/comparisons/claude-code-tied-multi-harness-plan.md); run `./copy_files.sh` (installs `.claude/skills/`, repo-root `.mcp.json` safe-merge for `tied-yaml`) |

---

## Multi-harness entry matrix (Cursor vs Claude Code)

**Traceability:** [REQ-TIED_CLAUDE_HARNESS](../requirements/REQ-TIED_CLAUDE_HARNESS.yaml) · sponsor decision #6 in [claude-code-tied-multi-harness-plan.md](../../docs/comparisons/claude-code-tied-multi-harness-plan.md).

Use this matrix to pick the **entry surface** and **state layer** without conflating REQ-scoped checklist work with FEAT lifecycle orchestration. **`AGENTS.md`** remains canonical on every harness; optional **`CLAUDE.md`** is a thin Claude-only delta after bootstrap.

| Work kind | Primary entry | Skill / tool surface | Canonical state |
| --- | --- | --- | --- |
| **REQ-scoped change** (new requirement, behavior change, bug tied to `[REQ-*]`) | **Prompt Composer** global skills | **Cursor:** `.cursor/skills/` (installed by `copy_files.sh`) · **Claude Code:** `.claude/skills/` (same bundles, copy-default) — e.g. `/plan-new-feature`, `/refine-plan`, `/build-plan`, `/plan-close-out` | Project **`tied/`** YAML + per-request **`working/{REQ-TOKEN}/`** (linked plan, CITDP, Authoritative Tracker) |
| **FEAT lifecycle** (staged product feature, canonical FEAT views) | **Feature orchestrator** | `tied init` / `tied.sh feature …` and feature-orchestration MCP tools; skills under `.cursor/skills/` or `.claude/skills/` as needed for YAML edits | **`tied/features/`** + feature MCP workflow (not a substitute for REQ checklist when semantics live in `[REQ-*]`) |
| **Mutate project TIED YAML** (either harness) | **TIED YAML MCP** or **`tied-cli.sh`** | Same server and CLI on both harnesses; confirm **`tied_config_get_base_path`** points at this repo’s **`tied/`** before writes | Index + detail YAML under **`tied/`** (methodology under **`tied/methodology/`** is read-only) |

### Operating modes (do not conflate)

| Mode | Who drives turns | Evidence accepted for automation |
| --- | --- | --- |
| **Interactive Prompt Composer** | Human in IDE (`/build-plan`, …) | MCP / **`tied-cli`** writes; manual Tracker updates — **not** agentstream receipts |
| **Semi-automated** | Same skills + operator updates Tracker slugs | Typed **`evidence_refs`** on the Authoritative Tracker |
| **`tied agentstream`** | Shell / CI checklist driver | Tracker receipts + harness-specific **AgentDriver** contracts (`--harness cursor` reference; `--harness claude` fixture-gated) |

Vocabulary: [agentstream.md](../vocab/agentstream.md), [prompt-composer.md](../vocab/prompt-composer.md).

---

## Data you edit (not prose docs)

| Nickname | Path | Role |
| --- | --- | --- |
| **Requirements** | `tied/requirements.yaml`, `tied/requirements/` | What and why (`[REQ-*]`). |
| **Architecture** | `tied/architecture-decisions.yaml`, `tied/architecture-decisions/` | Design choices (`[ARCH-*]`). |
| **Implementation** | `tied/implementation-decisions.yaml`, `tied/implementation-decisions/`, `IMPL-*-pseudocode.md` | Behavior spec (`[IMPL-*]`). |
| **Token registry** | `tied/semantic-tokens.yaml` | Every `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`, `[PROC-*]`. |
| **CITDP records** | `tied/citdp/CITDP-*.yaml` | Change-analysis audit trail. |
| **Methodology** (read-only) | `tied/methodology/` | Inherited tokens; refreshed by `copy_files.sh`; do not edit. |
| **Domain names** | `tied/vocab/routing.md` → matched glossaries | PRELOAD via routing index before reading YAML or source; full `domain-references.md` on demand for cross-topic. |

Guides for YAML shapes: [requirements.md](requirements.md), [architecture-decisions.md](architecture-decisions.md), [implementation-decisions.md](implementation-decisions.md), [semantic-tokens.md](semantic-tokens.md), [detail-files-schema.md](detail-files-schema.md).

---

## Tooling (when mutating YAML)

| Nickname | Location | Role |
| --- | --- | --- |
| **YAML tools index** | [tied-yaml-agent-index.md](tied-yaml-agent-index.md) | Maps skill, runbook, validation loop. |
| **tied-cli** | `.cursor/skills/tied-yaml/scripts/tied-cli.sh` | Primary write path for project YAML. |
| **Without MCP** | [using-tied-without-mcp.md](using-tied-without-mcp.md) | Documented manual workflow. |

### Adherence ergonomics and DAE quick wins (`tied` CLI — Waves 1–2)

From the repo root (or any client with `@tied/cli` on `PATH`), these subcommands **compose** existing MCP gate tools — they do not fork gate semantics.

| Command | Purpose | Exit codes |
| --- | --- | --- |
| `tied gate check --request-token REQ-… --phase pre_implementation\|verification\|close_out` | Calls `tied_checklist_gate_validate` with Tracker + CITDP paths (defaults under `working/{REQ}/` and `tied/citdp/`). Optional `--slug`, `--tracker`, `--citdp`, `--project-root`, `--check-branch` (hard-fail on branch mismatch vs CITDP `branch:` or Tracker `execution_evidence.branch`; opt-out via `.tied-yaml.yaml` `dae.branch_check: false` or CITDP `branch_check: skip`). | `0` allowed; `1` blocked; `2` misconfig / MCP down |
| MCP **`tied_gate_check`** | Same composition as **`tied gate check`** (returns `allowed`, `exit_code`, `receipt_path`, `reasons[]`). | Same exit semantics in `exit_code` |
| `tied branch check --request-token REQ-…` | Standalone W2a branch hygiene (same algorithm as `--check-branch`). | `0` match/skip; `1` mismatch; `2` not a git repo |
| `tied next [--request-token REQ-…]` | Discovers Authoritative Tracker(s), prints the first pending checklist **slug** in YAML order plus open REQ tokens and CITDP draft phases. | `0` recommendation; `1` no pending work; `2` ambiguous trackers |
| `tied handoff validate --path …` | Validates additive `working/{REQ}/handoffs/{phase}.yaml` (schema v1); does **not** replace `request-evidence-envelope.v1.json`. | `0` valid; `1` schema errors |

MCP `pseudocode_validate` accepts optional `leakage_lint` (default on) and `gate_mode` for W2b host-syntax leakage rules. CITDP template documents `size`, `gate_profile`, and `express_lane` (Wave 2c). Optional **diff-scoped change-risk report** hooks (upstream DAE CP7 / CRAP metric) are documented on checklist slugs `verification-gate` and `traceable-commit` when CITDP `diff_scoped_crap: true` (Wave 2d; default off). After successful `quality_evidence_collect_manifest`, `collectVerificationEvidence` invokes `runOptionalDiffScopedCrapAfterManifest` when CITDP enables the hook (R2 / RISK-DAE-009); report JSON under `working/{REQ}/evidence/diff-scoped-crap-{timestamp}.json`. Tests: `mcp-server/src/diff-scoped-crap.test.ts`, `mcp-server/src/quality-evidence-collection.test.ts`.

### Validation depth (Wave 3)

MCP **`pseudocode_analyze`** accepts **`closure_join_report: true`** with **`request_token`**, **`impl_tokens[]`**, optional path globs, and **`persist_closure_report`** (default true) to write `working/{REQ}/evidence/closure-join-{timestamp}.json`. Implementation: `mcp-server/src/analysis/closure-join-report.ts`. Mechanical vs LLM judgment boundaries: [`pseudocode-writing-and-validation.md`](pseudocode-writing-and-validation.md) § Mechanical checks vs LLM judgment.

Set `TIED_BASE_PATH` to this project’s `tied/` (or pass `--project-root`) before gate checks. Receipts may persist under `working/{REQ}/gates/` when gate persistence is configured in CITDP/Tracker.

### Verification charter (Wave 4 — opt-in)

Traceability: [REQ-TIED_DAE_VERIFICATION_CHARTER](../requirements/REQ-TIED_DAE_VERIFICATION_CHARTER.yaml) (child of [REQ-TIED_DAE_INCORPORATION](../requirements/REQ-TIED_DAE_INCORPORATION.yaml) program Wave 4).

Charter tools are **off by default**. Enable only when **both** hold:

1. CITDP `record_identity.verification_charter: true` (and optional `mutation_cache`, `disjoint_verifier: required`, `gauntlet:` block).
2. Project manifest / policy documents charter opt-in (same charter-off default as program PLAN).

| Tool | When | MCP / module |
| --- | --- | --- |
| **Disjoint verifier** | `disjoint_verifier: required` at `verification` / `close_out` | `tied_checklist_gate_validate` — pass `evidence.adherenceLedger` + `evidence.verifierSessionId`; waiver via `disjoint_verifier_waiver` (owner + expiry) |
| **Mutation cache** | `mutation_cache: true` after composition-green diff list | `buildMutationCacheReport` in `mcp-server/src/mutation-cache.ts`; pass `evidence.mutationCache` into gate validate at verification |
| **Gauntlet** | Optional `gauntlet.probes[]` after composition green, before E2E | `parseGauntletBlock` in `mcp-server/src/gauntlet-runner.ts` |

Fixtures: `working/REQ-TIED_DAE_INCORPORATION/fixtures/charter/verification-charter-minimal.yaml`, `fixtures/ledger/disjoint-verifier-mismatch.json`.

### Graph integrity (Wave 5)

Traceability: [REQ-TIED_DAE_INCORPORATION](../requirements/REQ-TIED_DAE_INCORPORATION.yaml) program Wave 5 (parent REQ; charter Wave 4 remains on [REQ-TIED_DAE_VERIFICATION_CHARTER](../requirements/REQ-TIED_DAE_VERIFICATION_CHARTER.yaml)).

| Mechanism | Operator entry | Notes |
| --- | --- | --- |
| **Ontology rules (W5a)** | MCP `tied_validate_consistency` with `ontology_rules: true` | Optional `adherence_ledger` + `verifier_session_id` for disjoint session check. Fails `ok` on ARCH/IMPL dependency cycles and duplicate detail paths; reports inverse REQ advisories in `ontology_issues[]`. |
| **Charter compliance table (W5b)** | `tied_checklist_gate_validate` at `pre_implementation` | Pass structured `evidence.charterCompliance` (immutable categories/tokens, touch set, new ARCH tokens, approval evidence). Blocks when immutable scope touched without remediation. Default clients unchanged when evidence omitted. |

Fixtures: `working/REQ-TIED_DAE_INCORPORATION/fixtures/graph/arch-cycle-minimal.yaml`, `fixtures/charter/immutable-req-touch.yaml`.

### Methodology client boundary (R4 — separate program)

Traceability: [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY](../requirements/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml) (**Planned**; independent of DAE incorporation). Executable plan: `working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/PLAN.md`. CITDP: `tied/citdp/CITDP-REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml`.

| Phase | Intent | Operator note |
| --- | --- | --- |
| **A** | Pattern **#4** — optional bootstrap Unix read-only `tied/methodology/`, client pre-commit hook template for `tied/methodology/**`, CI path guard doc | Composes with MCP `detail-loader` / `yaml-loader` project-only writes; enter via **`build-plan`** remainder `Phase A` |
| **B** | Pattern **#2** — MCP bundled methodology read spike + migration gates | Does not remove `copy_files.sh` tree until parity tests pass; remainder `Phase B` |

Policy anchor: `[PROC-TIED_METHODOLOGY_READONLY]` in [processes.md](processes.md).

#### methodology-boundary-ci-guard (Phase A — advisory CI)

Compose with MCP `detail-loader` / `yaml-loader` rejection — hooks and CI add friction; they do **not** replace project-only MCP write guards.

**Bootstrap (opt-in, not default-on):**

```bash
./copy_files.sh --install-methodology-hook /path/to/client
# Unix only, explicit:
./copy_files.sh --methodology-readonly --install-methodology-hook /path/to/client
git -C /path/to/client config core.hooksPath .githooks
```

On Windows, use the hook template (via `--install-methodology-hook`) and CI guard first; Unix `chmod` read-only is skipped with operator guidance in bootstrap output.

**CI job pattern (copy-paste):** fail or warn when any changed path is under `tied/methodology/`:

```bash
# Advisory (exit 0 with message) — flip to required by setting MCB_CI_BLOCK=1
MCB_CI_BLOCK="${MCB_CI_BLOCK:-0}"
base="${GITHUB_BASE_REF:-origin/main}"
if git rev-parse --verify "$base" >/dev/null 2>&1; then
  range="$base...HEAD"
else
  range="HEAD~1..HEAD"
fi
hits="$(git diff --name-only "$range" -- 'tied/methodology' 'tied/methodology/**' || true)"
if [[ -n "$hits" ]]; then
  echo "Methodology boundary: diff touches read-only tied/methodology/ (refresh via copy_files.sh from TIED source):" >&2
  echo "$hits" >&2
  if [[ "$MCB_CI_BLOCK" == "1" ]]; then
    exit 1
  fi
fi
```

Local pre-commit equivalent: `.githooks/pre-commit` installed by `--install-methodology-hook` (see `tools/bootstrap/templates/pre-commit-methodology-guard.sh`).

After writes: `lint_yaml` on changed YAML + `tied_validate_consistency` (checklist `sub-yaml-edit-loop`).

On a fresh bootstrap with no project-specific REQ/ARCH/IMPL tokens, `tied_validate_consistency` should report `ok: true` once inherited methodology detail files resolve under `tied/methodology/`.

---

## Supporting docs (installed by bootstrap; not in core six)

`copy_files.sh` also copies these when missing. Use when the **Checklist** or **YAML tools index** points you there — not required on every task.

| Area | Files |
| --- | --- |
| Commit / release | `commit-guidelines.md` |
| MCP setup | `adding-tied-mcp-and-invoking-passes.md`, `ai-agent-tied-mcp-usage.md`, `yaml-update-mcp-runbook.md` |
| Automation | `req-impl-state-guide-agent-workflow.md`, `requirement-list-state-guide-agent-workflow.md` |
| Preload contract | `agent-preload-contract-template.yaml` → client `tied/agent-preload-contract.yaml` |
| Fidelity research | `tied-fidelity-research.md`, `pseudocode-fidelity-audit-agent-prompt.md` |
| Pseudo-code extras | `pseudocode-format-and-practices.md`, `pseudocode-validation-checklist.yaml`, `pseudocode-static-analysis-checklist.yaml`, `pseudocode-grammar.v1.md`, `pseudocode-grammar.v2.md`, `pseudocode-grammar-v2-migration.md`, `templates/impl-essence-pseudocode-template.md`, `scripts/audit-grammar-v2-default.mjs` |
| Vocab meta | `vocabulary-index-analysis-and-standards.md` |

---

## One-line agent prompt

> Follow **Rules**, resolve and preload **Vocabulary**, execute **Checklist** steps from a per-task **Tracker** copy, author/repair behavior in **Pseudo-code** before RED tests, apply **LEAP** on divergence, record new terms, persist **Change records** when behavior changes, mutate project YAML via **tied-cli**, and validate vocabulary plus `tied_validate_consistency`.

---

**TIED Methodology Version**: 3.0.0 · **Last updated**: 2026-09-24
