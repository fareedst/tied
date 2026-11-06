# Plan: Persante SDD skills summary and TIED comparison docs

**Slug:** `persante-sdd-vs-tied`  
**Track:** non-tied-plan → **non-tied-refine** (this revision) → `@non-tied-build` → optional `@non-tied-close`

---

## Refined sponsor constraints (locked)

| Constraint | Value |
| --- | --- |
| **Primary sources** | Persante skills under **developer machine path** `/Users/fareed/Documents/persante/repos/ticketing-platform/.claude/skills/persante-*/` (not vendored in this repo); [artifact-contract.md](file:///Users/fareed/Documents/persante/repos/ticketing-platform/.claude/skills/persante-sdd-workflow/references/artifact-contract.md) is the contract anchor |
| **Deliverables** | Two Markdown files under **this repository:** `docs/comparisons/persante-sdd-skills.md` and `docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md` |
| **TIED scope** | Comparison uses **existing** TIED docs ([AGENTS.md](../../AGENTS.md), [tied-bundle/docs/processes.md](../../../tied-bundle/docs/processes.md), [tied-bundle/docs/LEAP.md](../../../tied-bundle/docs/LEAP.md)); **no** new project REQ/ARCH/IMPL tokens unless sponsor later promotes this to full TIED lane |
| **Style** | Match sibling comparisons: metadata table, executive summary, complementarity, Touchpoint 1 RESOLVE table, primary matrix with disposition key, proof boundary, sibling cross-links ([methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md), [tied-vs-well-known-methodologies.md](../../../docs/comparisons/tied-vs-well-known-methodologies.md)) |
| **Honesty** | External path and fork note (“forked from Michael Duddy’s dev-environment skills”, per Persante `persante-sdd-workflow` skill) stated explicitly; no claim that this repo ships Persante artifacts |

---

## RESOLVE (Touchpoint 1)

Task keywords matched **client** [tied-project/vocab/routing.md](../../vocab/routing.md) → PRELOAD [tied-methodology.md](../../vocab/tied-methodology.md) (methodology layout, traceability) and [quality-assurance.md](../../vocab/quality-assurance.md) (proof boundaries, comparison / review-convergence context). **Non-tied track:** no vocab RECORD pass in `tied-project/vocab/` for this refine ([non-tied-boundary.md](../../../tools/bundled-prompt-type-skills/prompt-shared/non-tied-boundary.md) plan track allows deferral of RECORD).

| Term | Resolved meaning |
| --- | --- |
| **Persante SDD** | **Spec-driven development** gated by repo-local **artifact contract**: `wiki/specs/NNN-<slug>/` with `spec.md`, `solution.md`, `tasks.json`, `evidence/*`; phase skills (`persante-spec`, `persante-solution`, `persante-align`, `persante-implement`, `persante-validate`, `persante-triage`, `persante-ship`) plus support (`persante-sdd-workflow`) and infra adjuncts (`persante-naming-lint`, `persante-whatif-review`, `persante-deploy`) |
| **TIED** | Methodology enforced in this repo: semantic **REQ/ARCH/IMPL** registry, **[PROC-LEAP]**, **[PROC-TIED_DEV_CYCLE]**, MCP-first YAML where applicable, **IMPL `essence_pseudocode`** token discipline — see [AGENTS.md](../../AGENTS.md) |
| **Compose-don’t-replace** | Document stance: map centers of gravity; do **not** assert Persante subsumes TIED or the reverse |
| **Proof boundary** | Analysis is anchored to **read** skill text + contract at the external path; if that repo moves or skills change, the summary may drift until refreshed |

---

## Deliverables

| File | Role |
| --- | --- |
| [PLAN.md](PLAN.md) | This plan (refined) |
| [test-strategy.md](test-strategy.md) | Pre-close QA checklist (`@non-tied-build` / `@non-tied-close`) |
| [CITDP-persante-sdd-vs-tied.yaml](CITDP-persante-sdd-vs-tied.yaml) | Plan-folder CITDP draft · `tied_tokens_new: []` (materialized in **@non-tied-build**) |
| [docs/comparisons/persante-sdd-skills.md](../../../docs/comparisons/persante-sdd-skills.md) | Standalone methodology summary (**done**) |
| [docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md](../../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md) | Comparison vs TIED (**done**) |

---

## `persante-sdd-skills.md` — outline

1. Metadata table (purpose, audience, source path, status: analysis-only, last updated date at build time).
2. Executive summary: wiki replaces issue tracker; interview + confirmed `spec.md`; solution + task DAG; alignment cap **5**; implement with optional parallel worktrees; independent reviewer for validate; triage; ship opens **Bitbucket** PR with `verify-pr` summary (no merge in skill).
3. Mermaid `flowchart` (node IDs without spaces): `spec` → `solution` → `align` → `implement` → `validate` → `triage` → `ship` (with repair loop edges as notes or subgraph).
4. Table: each `persante-*` skill → one-line responsibility; separate short subsection for infra adjuncts (dev-only deploy, naming lint, what-if).
5. Artifacts and IDs table: `US-*`, `FR-*`, `NFR-*`, `AC-*`, `V-*`, `T###`, `RF-*`, events, `verify-pr`.
6. Governance: alignment attempts ≤ 5; review cycles ≤ 5; deferral rules for `RF-*`; frozen feature folder after ingest (per contract).
7. Proof boundary and fork note.

---

## `persante-sdd-skills-vs-tied-agent-management.md` — outline

1. Metadata table consistent with [qmm-kaizen-vs-tied.md](../../../docs/comparisons/qmm-kaizen-vs-tied.md) / [claude-code-team-code-review-vs-tied.md](../../../docs/comparisons/claude-code-team-code-review-vs-tied.md).
2. Executive summary: Persante vs TIED center of gravity; **compose-don’t-replace** one paragraph.
3. Complementarity table (requirements capture, planning, alignment, implementation, review, evidence, CI/delivery, methodology loops).
4. **Touchpoint 1 — RESOLVE:** Persante artifact or term → TIED analogue (explicit **non-1:1** rows for IMPL pseudo-code vs `solution.md`).
5. **Primary phase matrix:** Persante phase × loop × disposition (Align | Composable | Tension | Gap | Defer) + one-line rationale.
6. Honest gaps (Bitbucket-specific verification; mandatory second agent vs depth-gated inquiry; YAML+MCP consistency vs markdown/json contract).
7. Sibling docs footer.

---

## Optional follow-up (sponsor opt-in)

- Add a **Persante** row to [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) after both docs exist.

---

## Handoff

- **@non-tied-build status:** Delivered `docs/comparisons/persante-sdd-skills.md`, `docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md`, and [CITDP-persante-sdd-vs-tied.yaml](CITDP-persante-sdd-vs-tied.yaml). Proceed to [test-strategy.md](test-strategy.md) then **`@non-tied-close`** if desired.
- **Not in scope for build unless requested:** TIED REQ/ARCH/IMPL writes; copying Persante skills into this repo.
