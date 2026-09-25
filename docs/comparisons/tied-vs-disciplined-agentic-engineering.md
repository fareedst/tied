# TIED vs Disciplined Agentic Engineering (DAE)

**Role:** **Evaluator reference** — side-by-side methodology comparison. For **DAE→TIED incorporation execution** (waves, Tracker, CITDP), use the linked plan [`working/REQ-TIED_DAE_INCORPORATION/PLAN.md`](../../working/REQ-TIED_DAE_INCORPORATION/PLAN.md) (**[REQ-TIED_DAE_INCORPORATION]**) and the coordinator guide [`dae-mechanisms-for-tied-improvement.md`](dae-mechanisms-for-tied-improvement.md).

**Audience:** Engineers evaluating or combining agentic development methodologies.

**Sources (TIED):** This repository — enter via [`tied/vocab/routing.md`](../../tied/vocab/routing.md) (client handoff) and methodology snapshot under `tied/methodology/vocab/` after `copy_files.sh`. Spine docs: [`tied/docs/client-development-index.md`](../../tied/docs/client-development-index.md) (includes **multi-harness entry matrix**), [`tied/docs/vocabulary-layer-tied-leap-citdp.md`](../../tied/docs/vocabulary-layer-tied-leap-citdp.md), [`tied/docs/agent-req-implementation-checklist.md`](../../tied/docs/agent-req-implementation-checklist.md), [`tied/docs/LEAP.md`](../../tied/docs/LEAP.md). Recent operator stack: [`working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md`](../../working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md) (all-Node suite), [`claude-code-tied-multi-harness-plan.md`](claude-code-tied-multi-harness-plan.md) (Claude harness).

**Sources (DAE):** [swingerman/engineer](https://github.com/swingerman/engineer) (Disciplined Agentic Engineering). This analysis was written against a local clone layout: `engineer/` plugin root, `engineer/references/`, `engineer/scripts/dae_*.py`, README.

Neither repository references the other by name. Both target **engineer-led AI development** with **spec/test discipline** and **deterministic gates** instead of prompt-only control.

**Last updated:** 2026-09-24

---

## Executive summary

| Dimension | TIED | DAE |
| --- | --- | --- |
| **North star** | Token-linked REQ / ARCH / IMPL + pseudo-code as logical source of truth | Layered feature docs + Gherkin IR + generated acceptance pipeline |
| **Unit of work** | Project-wide `tied/` YAML graph; optional `tied/features/` orchestration | `features/NNN-slug/` under `.engineer/` manifest |
| **Discipline carrier** | Checklist slugs, **TIED YAML MCP** + **`tied`** CLI (`mcp`, `yaml`, `bootstrap`, `agentstream`), gate tools (`tied_checklist_gate_validate`, `tied_adherence_reconcile_run`, request-evidence envelope tools) | 21 stdlib Python guardrails + checkpoint handoffs |
| **Behavior contract** | IMPL `essence_pseudocode` (+ Gherkin not required) | Domain ACs → `spec.md` → `.build/spec.json` |
| **Change record** | `tied/citdp/CITDP-*.yaml` | Handoffs, tracker, panels (no CITDP twin) |
| **Resync when code learns** | LEAP (IMPL → ARCH → REQ) | Refine, edit specs/plan, re-verify, mutation |
| **Test signature** | Unit TDD, composition-before-wiring, justified E2E | Dual green streams (acceptance + unit), mutation, change-risk on diff (DAE CP7 / CRAP metric) |
| **Reference host UX** | **Dual harness:** Cursor (reference automation) + **Claude Code** (`.claude/skills/`, repo-root `.mcp.json` safe-merge); same **`AGENTS.md`** + TIED MCP | Claude Code plugins/skills |

---

## TIED shifts since 2026-09-22 (context for this comparison)

These changes narrow the “TIED = Cursor-only + scattered runtimes” picture and add **DAE-adjacent** mechanical gates without replacing the token graph.

| Shift | What shipped | DAE-relevant effect |
| --- | --- | --- |
| **All-Node operator suite** | [`REQ-TIED_UNIFIED_TOOLCHAIN`](../../tied/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml): umbrella **`tied`** on **Node ≥18**; **`@tied/agentstream`** TypeScript-only (Go/Ruby checklist drivers retired); MCP + bootstrap + yaml-cli in one workspace | Closer to DAE’s **single runtime, scriptable exits** — but exits come from MCP/CLI tied to the semantic DB, not per-feature `dae_*.py` |
| **Claude harness option** | [`REQ-TIED_CLAUDE_HARNESS`](../../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml) family: dual bootstrap, Prompt Composer in **`.claude/skills/`**, **`tied agentstream --harness claude`** (fixtures + operator live gate), optional adherence bridge | TIED is no longer “DAE owns Claude, TIED owns Cursor only”; both can run the **same** checklist vocabulary with different **AgentDriver** subprocesses |
| **Expanded MCP gate surface** | Checklist activation/collect, gate validate, adherence reconcile, pseudocode validate/analyze, feature-orchestration tools, LEAP proposal queue, request-evidence envelope build/validate/patch | Partial answer to DAE **Step 0** and handoff evidence — machine receipts on **`working/{REQ}/`** instead of only prose Tracker refs |
| **Routing index** | Methodology [`tied/vocab/routing.md`](../../tied/vocab/routing.md) documents **historical Ruby agent-stream** as non-operator; **agentstream**, **feature-orchestration**, **prompt-composer** glossaries for harness choice | Agents PRELOAD harness-specific vocab before conflating interactive skills with **`tied agentstream`** automation |

Detail and closure record: [`claude-code-tied-multi-harness-plan.md`](claude-code-tied-multi-harness-plan.md). Client entry matrix: [`client-development-index.md`](../../tied/docs/client-development-index.md) § Multi-harness.

---

## Shared thesis

Both methodologies assume capable LLMs **and** engineer judgment. Both reject sustained **vibe coding** (fast prompts without durable contracts).

| Theme | TIED | DAE |
| --- | --- | --- |
| Human owns intent and architecture | REQ/ARCH tokens; sponsor language via vocab **RESOLVE** | `CHARTER.md`; human confirms architecture at CP4 (`plan`) |
| Behavior before implementation detail | IMPL pseudo-code; **LEAP** when tests/code diverge | Domain ACs → Gherkin; Golden Rule: no implementation leakage in specs |
| Agents type; discipline is external | Checklist, MCP, `tied_validate_consistency` | `dae_*.py`; non-zero exit blocks progress |
| Layered specs | REQ → ARCH → IMPL (+ sidecar) | `feature.md` → `acs.md` → `spec.md` → `plan.md` (Speckit-style) |
| Two test concerns | Unit + composition (+ justified E2E) | Acceptance + unit streams both green |
| Beyond “tests pass” | Test adequacy, composition evidence, optional adversarial / evidence chains | Mutation (CP8), differential re-mutate, change-risk on diff (CP7) |
| Naming / graph integrity | `tied/vocab/*.md` + routing **PRELOAD** | `dae_ontology.py`; intent ↔ AI-native SDLC map |

Influence overlap: DAE cites Speckit, Uncle Bob’s acceptance-pipeline and ATDD lineage; TIED’s [`LEAP.md`](../../tied/docs/LEAP.md) describes the same abstraction ladder (specification as the rung above raw code).

---

## Structural contrast

```mermaid
flowchart LR
  subgraph tied [TIED stack]
    Vocab[tied/vocab routing]
    CITDP[CITDP change record]
    REQ[REQ YAML]
    ARCH[ARCH YAML]
    IMPL[IMPL pseudo-code]
    Code[Tests and code]
    Vocab --> CITDP
    Vocab --> REQ
    CITDP --> REQ
    REQ --> ARCH --> IMPL --> Code
    Code -->|LEAP| IMPL
  end

  subgraph dae [DAE stack per feature]
    Inbox[inbox / discuss intent]
    Feat[feature.md Ready]
    ACs[acs.md]
    Spec[spec.md Gherkin]
    Plan[plan.md]
    Build[CP5 implement]
    Inbox --> Feat --> ACs --> Spec --> Plan --> Build
  end
```

---

## 1. Artifact equivalence: DAE feature stack ↔ TIED REQ / ARCH / IMPL

### DAE per-feature artifacts

| Artifact | Checkpoint | Role |
| --- | --- | --- |
| `feature.md` | 1.5 Ready | Outcome, scope, `autonomy_level`, branch, optional `gate_profile`, `validation_method` |
| `acs.md` | 2 | Acceptance criteria in **domain language** |
| `spec.md`, `.build/spec.json` | 3 | Standard Gherkin; JSON IR for generators/mutators |
| `plan.md` | 4 | Architecture (human-owned), Charter Check, test strategy, optional `gauntlet:` |
| Code + tests | 5–8 | Implement, refine, verify (`arch-check`, change-risk on diff), harden (mutation) |

Intent may start in `.engineer/inbox.md`, `/engineer.discuss`, or async `intent.md` (see DAE `engineer/references/intent.md`).

### TIED project artifacts

See [`tied/docs/detail-files-schema.md`](../../tied/docs/detail-files-schema.md).

| Layer | Location | Role |
| --- | --- | --- |
| Understanding | `tied/vocab/*.md` | Preferred terms before formal YAML |
| Change analysis | `tied/citdp/CITDP-*.yaml` | Blast radius, risks, test plan, LEAP feedback at close-out |
| REQ | `tied/requirements/REQ-*.yaml` | `satisfaction_criteria`, `validation_criteria`, `traceability` |
| ARCH | `tied/architecture-decisions/ARCH-*.yaml` | Structural decision, `cross_references` |
| IMPL | `IMPL-*.yaml` + `IMPL-*-pseudocode.md` | Operational logic in pseudo-code blocks |
| Proof | Tests and code | Token comments; `code_locations` in IMPL detail |

### Mapping table (equivalence, not identity)

| DAE | TIED | Notes |
| --- | --- | --- |
| `feature.md` outcome/scope | REQ `description`, `satisfaction_criteria`, `rationale` | TIED splits measurable criteria into YAML fields |
| `acs.md` | REQ `satisfaction_criteria` (+ vocab references in criteria) | DAE separates AC discovery (CP2) from Gherkin (CP3) |
| `spec.md` / IR | IMPL `essence_pseudocode` + tests | **Main gap:** Gherkin IR vs language-agnostic pseudo-code |
| `plan.md` Architecture | ARCH `decision`, `implementation_approach` | DAE bundles Charter Check in one markdown file |
| `plan.md` Test strategy | REQ `validation_criteria`, checklist `test-strategy` | DAE `validation_method` (canary, staging) parallels non-default validation |
| `CHARTER.md` | Distributed ARCH/REQ/PROC tokens + `AGENTS.md` | Single charter vs tokenized methodology |
| Handoffs / tracker | Per-request checklist YAML + CITDP | Token graph vs checkpoint audit trail |

### Irreducible gaps

1. **Primary behavior IR:** Gherkin + project acceptance pipeline (DAE) vs IMPL pseudo-code sidecars (TIED).
2. **Scope:** One feature folder (DAE) vs many tokens across a repo (TIED).
3. **CITDP:** TIED persists [`citdp-record-template`](../../tied/docs/citdp-record-template.yaml)-shaped YAML; DAE embeds analysis in skills, panels, and scripts.
4. **No DAE ARCH/IMPL YAML** unless you add TIED separately.

**Integration thought experiment (not shipped in either repo):** One REQ token per feature folder; Gherkin for acceptance; LEAP updates IMPL when mutation or acceptance tests force behavior changes.

---

## 2. Gate mechanics: TIED checklist / MCP vs DAE ledger scripts

### DAE Step 0 (every checkpoint skill)

| Tool | Enforces |
| --- | --- |
| `dae_handoff.py <feature-dir> --through N` | Prior checkpoint complete; exit criteria met |
| `dae_branch.py` | On feature branch (unless `git.manual: true`) |
| `dae_progress.py` | Breadcrumb only; never blocks |
| `dae_ontology.py` (checkpoint exit) | Enumerations, AC↔scenario closure, verifier ≠ implementer |

Handoffs: YAML frontmatter per DAE `handoff-summary.md`, including `exit_criteria[]` with tool evidence. Dispatch: `handoff-dispatch.md` — `autonomy_level` (`low` | `medium` | `high`); external writes (push, merge PR) always need explicit human authorization.

**Gate profile** (`gate-profile.md`): `gate_profile.front` (`auto` | `bundled`) and `verify` (`light` | `standard` | `heavy` | `auto`) bundle human decisions at the ends of the pipeline.

### TIED checklist gates

Spine: [`agent-req-implementation-checklist.md`](../../tied/docs/agent-req-implementation-checklist.md) + per-request [`agent-req-implementation-checklist.yaml`](../../tied/docs/agent-req-implementation-checklist.yaml).

| Phase | Slugs (examples) | Gate character |
| --- | --- | --- |
| Intake | `session-bootstrap`, `change-definition`, `impact-discovery` | Vocab touchpoints 1–2; CITDP steps |
| Design | `author-requirement` … `persist-implementation-records`, `gate-pseudocode-validation` | **No production code** until IMPL complete and validated |
| Build | `unit-test-red/green`, `three-way-alignment-unit`, `composition-integration`, `end-to-end-ui` | RED before GREEN; composition before wiring |
| Close-out | **`verification-gate`**, `sync-tied-stack`, `persist-citdp-record`, **`traceable-commit`** | Full suite, lint, `tied_validate_consistency`, vocab **VALIDATE** |

**`verification-gate`:** Full tests, language lint, optional adversarial inquiry at verification phase, token validation, three-way alignment audit, IMPL metadata updates.

**`traceable-commit`:** Touchpoint 3 **VALIDATE** on all changed names; conventional commit referencing REQ/ARCH/IMPL tokens; no push unless asked.

**Subs:** `sub-yaml-edit-loop`, `sub-pseudocode-validation-pass`, `sub-leap-micro-cycle` (IMPL first on divergence).

**Machine gates (2026-09+):** Beyond consistency lint, operators can run **`tied_checklist_gate_validate`** (phase gates with Tracker + CITDP), **`tied_adherence_reconcile_run`** (ledger vs Tracker), **`tied_checklist_activation_collect`** (integrated adversarial pairing), and **`request_evidence_envelope_*`** (structured close-out evidence). These parallel DAE’s “tool evidence in handoff” pattern while keeping canonical semantics in project YAML.

### Side-by-side

| Concern | DAE | TIED |
| --- | --- | --- |
| May I start this step? | Handoff + branch scripts | Prior slugs + implementation freeze; optional gate CLI/MCP before slug advance |
| Structured integrity | `dae_ontology.py` | `tied_validate_consistency`, `pseudocode_validate` / analyze, pseudo-code layers |
| Human judgment | Review panel CP2/4; `consistency-check` warnings | REQ/ARCH authoring; adversarial advisory default |
| Session continuity | `/engineer.next` | Authoritative Tracker; **`tied agentstream`** (Cursor or Claude **AgentDriver**) or interactive Prompt Composer |

---

## 3. Vocabulary vs ontology

### TIED

- Entry: [`tied/vocab/routing.md`](../../tied/vocab/routing.md) → **PRELOAD** matched glossaries only.
- Modes: **RESOLVE**, **PRELOAD**, **RECORD**, **VALIDATE** at three touchpoints (prompt intake, pre-read, pre-commit).
- Domain vocab is plain Markdown; distinct from IMPL grammar (`INPUT`, `OUTPUT`, `PRE`, `POST`, …).

See [`vocabulary-layer-tied-leap-citdp.md`](../../tied/docs/vocabulary-layer-tied-leap-citdp.md).

### DAE

- **`dae_ontology.py`:** mechanical constraints at checkpoint exit (enumerations, functional properties, AC↔`@AC-N` closure, disjoint verifier/implementer).
- **`consistency-check` skill:** judgment (domain language, outcome coverage, plan rigor).

See DAE `engineer/references/ontology.md`.

### Contrast

| | TIED | DAE |
| --- | --- | --- |
| Primary pain | Cross-artifact **naming** (UI, CLI, YAML, blocks) | Within-feature **artifact graph** (AC↔scenario join) |
| Leakage | Domain vs IMPL grammar in pseudo-code doc | Golden Rule + spec-guardian on Gherkin |
| Consistency tool | Vocab VALIDATE at commit + MCP consistency | Ontology at every checkpoint exit |

---

## 4. Autonomy and strict gates

| | DAE | TIED |
| --- | --- | --- |
| Mechanical autonomy | `feature.md` `autonomy_level`: low / medium / high (manifest caps, path overrides) | Checklist driver hints; not the same single dial |
| Human at the ends | `gate_profile` bundles front/back; plan architecture always human under `bundled` | Full checklist with explicit human steps in authoring |
| Verification independence | Ontology: verifier handoff `agent_id` ≠ implementer | Same principle in adversarial / checklist policy |
| Strict blocking | Charter, outward writes, `plan` panel errors | Adversarial **gate_policy** `strict-*` rare; default **advisory**; verification-gated REQ status optional per project |

---

## 5. Two paths (spec-first vs prototype-first)

### DAE (`two-paths.md`, `prototype` skill, `express-lane.md`)

- **Spec-first:** ACs and architecture decided up front, then build.
- **Prototype-first:** Iterate runnable artifact, then reverse-engineer ACs, derive spec/plan, disposition (`in-place` vs `rebuild`) by size/risk.
- **Express (XS):** One-pass lane; tests as spec; light gates.

### TIED

- Change entry via CITDP + checklist scenarios in [`client-development-index.md`](../../tied/docs/client-development-index.md) (new REQ, change, TIED-first repair, bug fix, fidelity research, feature onboarding).
- No single “prototype checkpoint”; exploration happens inside implementation with composition/TDD rules, not a formal CP parallel.

---

## 6. Tooling portability

| Capability | TIED | DAE |
| --- | --- | --- |
| Read/write structured intent | TIED YAML MCP + **`tied mcp`** / **`tied-cli.sh`** / bundled **tied-yaml** skill; feature-orchestration MCP for **`tied/features/`** | Skills + `dae_resolve.py` |
| Validate without LLM | **`tied yaml`** (canonicalize/lint), `tied_validate_consistency`, `pseudocode_validate`, checklist gate validate, test adequacy / quality-evidence collectors (profile-dependent), `validate_tokens.sh` | All `dae_*.py` with `test_*.py` siblings (483+ tests in upstream README) |
| Host binding | **Dual harness:** Cursor (`.cursor/mcp.json`) + Claude Code (repo-root `.mcp.json`, `TIED_MCP_HARNESS`); **`TIED_BASE_PATH`** wrong-repo risk documented in **AGENTS** | `host-capabilities.md` required vs optional capabilities |
| Orchestrated multi-turn | **`tied agentstream`** (**TypeScript**, Node ≥18) + Authoritative Tracker YAML; **`--harness cursor`** (reference) or **`--harness claude`** (fixture + live operator gate) | `atdd-team`, parallelism, worktrees |
| Operator install | **`tied bootstrap`** / `copy_files.sh` installs skills + MCP config preservation | Plugin marketplace install |

What **cannot** be enforced without an LLM in DAE: domain-language quality, “does this AC cover the outcome?”, architecture soundness — same class as TIED steps that remain judgment in `consistency-check` / authoring slugs.

**Runtime contrast (updated):** DAE stays **stdlib Python** per feature repo. TIED’s **source-repo operator stack** is now **all-Node** (no Go/Ruby checklist driver on the default path), which improves portability for CI and cross-platform bootstrap while keeping **project** validation language-agnostic (tests + YAML + pseudo-code tools).

---

## 7. Verification philosophy

### TIED order ([`PROC-TIED_DEV_CYCLE`](../../tied/docs/processes.md), core seven)

1. Complete IMPL pseudo-code (block token comments).
2. Unit RED → GREEN; **`sub-leap-micro-cycle`** on divergence.
3. **Composition/integration** for bindings before UI wiring.
4. E2E only with documented platform constraint.
5. **`verification-gate`:** suite, lint, consistency, optional adversarial inquiry under `working/{REQ}/`.

Mutation is **not** central in core seven; quality/evidence tooling is documented separately (evidence chain profiles, test adequacy, composition coverage).

### DAE order (checkpoints 3–8)

| Layer | Question |
| --- | --- |
| Acceptance tests | **WHAT** — external behavior |
| Unit tests | **HOW** — internal structure |
| Mutation (CP8) | **REAL?** — tests catch bugs |
| Change-risk on diff (CP7; upstream CRAP metric) | Complexity × coverage gap on changed files |
| `arch-check` | Charter layering, cycles, size |
| Gauntlet | Subjective bar when `gauntlet:` declared in `plan.md` |

DAE distinguishes **IR mutator** (acceptance wiring) vs **source mutator** (unit hardening) in `spec-ir.md`.

### Panel vs adversarial inquiry

| | DAE | TIED |
| --- | --- | --- |
| Pre-build challenge | Adviser + advocate on ACs and plan | CITDP + optional adversarial pass |
| Findings storage | Handoff `panel_findings` | `obligation-report.json`, etc. (non-canonical YAML) |
| LEAP trigger | Edits to specs/plan/code paths | Observed inquiry findings **do not** auto-trigger LEAP |

---

## 8. Operational UX

| Need | DAE | TIED |
| --- | --- | --- |
| What should I pick up? | `/engineer.next` | Next checklist **slug** on Authoritative Tracker (`working/{REQ}/checklist-tracker.yaml`) |
| Where am I in the pipeline? | `dae_progress.py` | **`tied agentstream`** checklist render / tracker preview; Tracker dispositions + gate JSON receipts |
| New feature | `feature-init`, `discuss` | **REQ path:** Prompt Composer (`/plan-new-feature`, …) · **FEAT path:** `tied init` + feature-orchestration MCP (see [`feature-orchestration.md`](../../tied/vocab/feature-orchestration.md)) |
| Bootstrap | Plugin marketplace install | **`tied bootstrap`** / `copy_files.sh` — Cursor + Claude skills, `.cursor/mcp.json` create-if-absent, Claude **`.mcp.json`** safe-merge |
| Claude-only client | Same plugin model | `node tools/bootstrap/new-tied-client.mjs --disposable --harness claude` or `test-new-claude-tied-client` (see multi-harness plan) |

**Do not conflate:** Interactive **`/build-plan`** in Claude or Cursor is **not** the same as automated **`tied agentstream`** checklist turns; the client-development-index **operating modes** table defines acceptable evidence for each.

---

## 9. When to lean which way

**Lean TIED** when you need durable **token traceability** across modules and repos, **IMPL pseudo-code** as the agent’s primary logic surface, **persisted CITDP** change records, and (optionally) **one checklist driver** on Cursor or Claude with MCP-backed gates.

**Lean DAE** when you want **productized ATDD + mutation + charter arch-check** on Claude Code (or a host that maps `host-capabilities.md`), with **minimal dependencies** (stdlib Python gates per `.engineer/` feature).

**Use both consciously** only with an explicit integration design (REQ token ↔ feature folder, LEAP on divergence); neither upstream ships that merge. TIED’s Claude path does **not** substitute DAE’s mutation/change-risk (CP7) pipeline—it adds a **second host** for the same TIED vocabulary and YAML MCP.

---

## References (quick links)

| Topic | TIED path | DAE path (in engineer repo) |
| --- | --- | --- |
| Routing / bootstrap | `tied/vocab/routing.md`, `tied/docs/client-development-index.md` (multi-harness matrix) | README, `engineer/skills/onboard/SKILL.md` |
| Handoffs / gates | `tied/docs/agent-req-implementation-checklist.md`, `tied/docs/request-evidence-envelope.md` | `engineer/references/handoff-summary.md`, `dae_handoff.py` |
| Behavior spec | `tied/docs/pseudocode-writing-and-validation.md` | `engineer/references/spec-ir.md`, `atdd` plugin |
| Change analysis | `tied/docs/citdp-policy.md` | `discuss`, `feature-init`, `consistency-check` |
| LEAP / resync | `tied/docs/LEAP.md`, `processes.md` § PROC-LEAP | `refine`, `feature-edit`, re-run verify |
| Operator CLI / harness | `mcp-server/packages/agentstream/README.md`, `docs/comparisons/claude-code-tied-multi-harness-plan.md`, `working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md` | — |
| DAE patterns → TIED gaps (coordinator) | [`dae-mechanisms-for-tied-improvement.md`](dae-mechanisms-for-tied-improvement.md) | — |
| DAE incorporation program (execution) | [`working/REQ-TIED_DAE_INCORPORATION/PLAN.md`](../../working/REQ-TIED_DAE_INCORPORATION/PLAN.md) | — |

---

*This file lives under `docs/comparisons/` (gitignored local analysis). Refresh when either methodology version changes materially.*
