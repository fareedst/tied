# Open Ontologies × TIED — refined plan (pass 1)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-OPEN-ONTOLOGIES-COMPARISON` (outreach doc bundle; **no REQ mint**) |
| **Refined** | 2026-10-23 |
| **Source plan** | [open_ontologies_comparison_aecff69f.plan.md](/Users/fareed/.cursor/plans/open_ontologies_comparison_aecff69f.plan.md) |
| **Target evidence** | Local read-only inspection of `/Users/fareed/Downloads/open-ontologies-main` — **target-repo-observed**; upstream [fabio-rovai/open-ontologies](https://github.com/fabio-rovai/open-ontologies) (**Tesseract-reported** in README/docs) |
| **Process** | [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) — **Wave 1 + Wave 2** |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |
| **Sibling pattern** | [Heimsbakk ontology × TIED](../../../docs/comparisons/veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) (meaning ownership); [AI-SDLC factory × TIED](../../../docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md) (executable spec / evidence); [LangChain](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) / [Traefik](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) (harness/platform seam) |

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD (session):** [tied-methodology.md](../../../tied-project/vocab/tied-methodology.md), [quality-assurance.md](../../../tied-project/vocab/quality-assurance.md) (proof boundaries), [sponsor-agent-relationship.md](../../../tied-project/vocab/sponsor-agent-relationship.md), [pseudocode-and-citdp.md](../../../tied-project/vocab/pseudocode-and-citdp.md).

| Open Ontologies / target term | TIED canonical term | Layer | Notes |
| --- | --- | --- | --- |
| **Plan / enforce / apply / monitor / drift / rollback** (Terraform-style ontology ops) | CITDP + checklist gates + LEAP; **not** IaC state files | Process | **Composable** metaphor — TIED changes are REQ/ARCH/IMPL + tests, not RDF plans |
| **Semantic impact preview** (before apply) | `tied_plumb_diff_impact_preview`, scoped analysis, impact discovery | Harness-adjacent | **Recommendation-only** exploration in analysis |
| **Lean 4 certificates** | Independent evidence / claims-evidence review; **not** universal verifier | Evidence | Certs prove derivations vs recorded inputs/rules — **target-repo-observed** limits in `lean-certificates.md` |
| **Oxigraph + SQLite engine** | — | **Defer** | TIED is not an RDF triple store methodology |
| **122-tool MCP surface** (docs vs `Cargo.toml` drift) | Bounded MCP tool profiles ([REQ-TIED_TOOL_INPUT_COMPATIBILITY](../../../tied-project/requirements/REQ-TIED_TOOL_INPUT_COMPATIBILITY.yaml) context) | Platform | Record **version/tool-count inconsistency** as observed doc drift, not stdd fact |
| **SHACL / OWL / reasoner** | Vocab layer SKOS-adjacent; **no reasoner** | Methodology | Cross-link Heimsbakk **non-OWL** boundary |
| **Session-scoped plan/apply identity** | Request evidence envelope, gate receipts, working folders | Evidence | **Partial align** — different artifact shapes |
| **CI skip visibility** | Verification-gated mode, skipped gate states in checklists | Quality | **Composable** operator visibility theme |
| **Adversarial / differential testing** | `[REQ-TIED_ADVERSARIAL_INQUIRY]` at integrated depth | Quality | Target CI gates vs TIED adversarial inquiry — **Tension** (different proof objects) |
| **Lineage / drift** | Git + LEAP + source graph tooling | Traceability | **Composable** without claiming RDF lineage equivalence |
| **Domain truth from validation green** | Anti-pattern: `tied_validate_consistency` ≠ domain correctness | Proof | Align with target’s own certificate scope limits |
| **Studio / browser try-it** | Harness-adjacent demos | Outreach | **Defer** product evaluation — doc cites entry points only |

**Ambiguity cleared:** Scope is **Wave 1 repository capture + Wave 2 analysis + `.gitignore` allowlist** only. No TIED YAML, vocab **RECORD**, target test execution, or Wave 3 REQ from comparison prose.

**Adversarial / depth:** `profile_depth: **minimal**` — doc-only outreach; local external repo read; no stdd auth/network/persistence behavior change. Integrated inquiry **Defer**.

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| Publish Wave 1 + Wave 2 + git allowlist | Reversible | Proceed at **build-plan** |
| Cross-link Heimsbakk / factory / harness siblings | Reversible | Proceed |
| Bundle doc subsection (e.g. vocabulary-layer FAQ link) | Reversible | **Defer** — keep blast radius to `docs/comparisons/` unless sponsor expands |
| [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) row | Costly | **Defer** |
| Wave 3 REQ (semantic impact preview productization, cert import) | Costly | **Defer** — list in analysis § phased recommendations |
| Project vocab RECORD (`ontology plan apply`, `Lean certificate`) | Costly | **Defer** unless sponsor asks |

**Distinct from Heimsbakk:** Heimsbakk owns **essay-level meaning ownership** for LLM-generated OWL; this bundle owns **executable ontology lifecycle engine** (plan/apply, certs, MCP/CLI, CI gates) mapped to TIED **agent-management and traceability**—compose both in Related documents, do not merge scopes.

**Gate (refine-plan):** Record `pre_implementation` at **build-plan** with [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml); refine pass does not write comparison deliverables.

**Gate state (2026-10-23):** `tied_checklist_gate_validate` → `allowed: false` (sparse outreach tracker; missing integrated adversarial slugs). Same honest limitation as [DOC-AI-SDLC-FACTORY-COMPARISON](../DOC-AI-SDLC-FACTORY-COMPARISON/PLAN-refine-pass2.md) — **not** a signal to add integrated inquiry to doc-only outreach. Do not claim gate success; do not block **build-plan** on forcing a full feature CITDP for two markdown files.

---

## Plan (CITDP-lite)

**Change class:** Methodology outreach — **two comparison markdown files** under `docs/comparisons/` (**no** project REQ/ARCH/IMPL index mutation).

**Impact:**

| Area | Blast radius |
| --- | --- |
| `docs/comparisons/open-ontologies-repository.md` | New Wave 1 capture (repo-as-source) |
| `docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md` | New Wave 2 analysis |
| `.gitignore` | Two new `!docs/comparisons/open-ontologies-*.md` lines after AI-SDLC allowlist |
| `tied-project/` YAML, vocab, methodology | **Unchanged** |

**Risk:** (1) Treating Lean certificate success as TIED effectiveness — mitigated by proof boundary + **not_measured**. (2) Implying RDF/Terraform semantics replace CITDP — mitigated by non-adoptions + authority mermaid. (3) Stale tool counts from target docs — mitigated by **target-repo-observed** + cite conflicting sources explicitly.

**LEAP / CITDP persist:** **Defer** — no `tied-project/citdp/CITDP-*.yaml` until Wave 3 behavior.

**Out-of-scope capture:** Wave 3 candidates in analysis phased table; optional `tied_feedback_operational_add` after commit (**Defer**).

---

## Test strategy (doc-only)

1. **Token grep:** `rg '\[REQ-[A-Z0-9_]+\]|\[ARCH-[A-Z0-9_]+\]|\[IMPL-[A-Z0-9_]+\]' docs/comparisons/open-ontologies-*.md` — expect **no newly minted project tokens** in body (references to existing stdd tokens in prose OK if labeled reference-only).
2. **Claim labels:** Manual pass — engine counts, benchmark numbers, star badges → **Tesseract-reported** or **target-repo-observed**; TIED capability → **TIED-existing**; suggestions → **Recommendation-only**; Wave 3 → **Defer**; effectiveness → **not_measured**.
3. **Links:** Wave 1 ↔ Wave 2 sibling metadata; analysis → Heimsbakk, AI-SDLC factory, LangChain, Traefik, template, `AGENTS.md`, checklist resolve from `docs/comparisons/`.
4. **Section parity:** Wave 2 file contains all **14** template sections in order (see Implement Phase 2).
5. **Wave 1 exit:** Metadata table, TL;DR, observation boundary, proof limits from target docs (`lean-certificates.md`, `ci-gates.md`), no duplicated README chrome.
6. **Evidence boundary:** Both docs state target **cargo test / Lean / MCP** were **not** re-run from stdd in this wave.
7. **Lint:** No `lint_yaml` (no TIED YAML changed). Optional markdown link check.

---

## Implement (execution order — sponsor runs **build-plan**)

### Phase 0 — Git allowlist

Add to [`.gitignore`](../../../.gitignore) after the AI-SDLC line:

```gitignore
!docs/comparisons/open-ontologies-repository.md
!docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md
```

Do not revert or reorder unrelated working-tree changes.

### Phase 1 — Wave 1 repository capture

Create [docs/comparisons/open-ontologies-repository.md](../../../docs/comparisons/open-ontologies-repository.md):

| Block | Content |
| --- | --- |
| Metadata table | **Source** GitHub URL + local path + **Captured** date; **Purpose** read-only repo summary; **Analysis (sibling)** link placeholder → filled in Phase 2 |
| TL;DR | 5–7 bullets: Rust binary, plan/apply ontology ops, Oxigraph/SQLite, Lean certs, MCP `io.github.fabio-rovai/open-ontologies`, CLI/Studio/Python lite |
| What it is | Architecture from `docs/architecture.md`; surfaces (data/clinical/alignment); tests/fixtures/benchmarks |
| How it is used | `docs/lifecycle.md`, `SKILL.md`, entry points (CLI, MCP, Studio, Docker, Python) |
| Observation boundary | **target-repo-observed**; document `Cargo.toml` vs SKILL/tool-doc count mismatches without picking a winner |
| Target proof limits | From `docs/lean-certificates.md`, `docs/ci-gates.md`: certs ≠ domain truth; parser/engine/fragment/skip limits |
| Notes for stdd readers | Link to Wave 2 analysis; cross-link Heimsbakk for **meaning** vs this doc for **engine** |

**Grounding files (read-only, no test run):** `README.md`, `docs/architecture.md`, `docs/lifecycle.md`, `docs/lean-certificates.md`, `docs/ci-gates.md`, `SKILL.md`, representative `crates/` / test paths cited by path only.

### Phase 2 — Wave 2 analysis

Create [docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md](../../../docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md) with **required sections in order**:

1. **Metadata table** — Purpose, Audience, Source (GitHub + local path), **Repository capture (sibling)**, Status, Executable follow-up (Wave 3), **Distinct from** (Heimsbakk meaning essay; factory executable-spec; harness seam docs), TIED anchors
2. **Executive summary** — Open Ontologies COG (ontology change planning, cert-checked derivations, MCP tool surface) vs TIED COG (REQ→ARCH→IMPL, CITDP, checklist gates, sponsor ladder); compose-don’t-replace paragraph + optional COG table
3. **Source summary (target claims only)** — Bullets from Wave 1; metrics **Tesseract-reported** / **target-repo-observed**
4. **Relationship to sibling comparisons** — Ownership table: this doc owns **ontology engine / evidence / plan-apply**; Heimsbakk owns **LLM ontology meaning**; factory owns **protected spec + run records**; LangChain/Traefik own harness seams
5. **Harness lessons → TIED agent management** — Thematic subsections + mapping tables (`External pattern | TIED surface | Notes`)
6. **Touchpoint 1 — RESOLVE** — Vocabulary disposition + claim labeling key
7. **Primary capability matrix** (~12–15 rows — see draft below)
8. **Authority boundary** — Mermaid: external ontology loop → harness-adjacent (preview, tool profiles) → TIED core (gates, MCP YAML, verify, sponsor costly choices)
9. **Anti-patterns** — e.g. cert green = domain truth; 122-tool surface without profile; plan/apply without sponsor intent
10. **Compose-don’t-replace table**
11. **Bounded operator recommendations (Recommendation-only)** — semantic pre-change impact preview; portable evidence bindings; session plan/apply identity; tool-surface profiles; visible skipped validation states — mark **TIED-existing** vs **Gap** vs **not_measured**
12. **Phased recommendations** — Phase 0 = this doc commit; Phase 1+ Wave 3 **Defer** defaults
13. **Explicit non-adoptions** — RDF/OWL/SHACL as TIED core; universal Lean verifier; Terraform semantics for all TIED changes; 122-tool ontology MCP as TIED default; domain correctness from `tied_validate_consistency`
14. **Proof boundary** + **Related documents**

**Back-links:** Update Wave 1 metadata **Analysis (sibling)** → analysis path.

### Phase 3 — Verification

Run test strategy §1–6; update [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md) with results.

**Skip:** `tied_validate_consistency` (no project YAML touched). **Skip:** target `cargo test`, Lean checker, network MCP calls.

---

## Wave 2 — Primary capability matrix (draft rows for analysis)

| Concern | TIED COG | Disposition | One-line rationale |
| --- | --- | --- | --- |
| Pre-change impact preview | `tied_plumb_diff_impact_preview`, CITDP impact | **Partial align** | Different artifact (RDF plan vs REQ graph) |
| Plan / apply / rollback narrative | Checklist + LEAP + git | **Composable** | Metaphor useful; not equivalent semantics |
| Lean derivation certificates | Claims-evidence, gate receipts | **Composable** | Proof object differs from TIED consistency |
| Independent cert verification | Sponsor/reviewer person branch | **Align** | Both reject “trust the author” |
| Lineage + drift detection | Git, source graph, LEAP | **Tension** | RDF drift ≠ code drift without adapter |
| Bounded MCP tool surface | Tool input compatibility, profiles | **Partial align** | TIED already bounds MCP; target scales to many tools |
| CI gate skip visibility | Verification-gated, checklist evidence | **Gap** → doc recommendation | Make skipped/not-measured visible in operator UX |
| Adversarial / differential tests | `[REQ-TIED_ADVERSARIAL_INQUIRY]` | **Tension** | Target CI vs TIED inquiry artifacts |
| SHACL / OWL validation | Pseudocode validate, vocab discipline | **Tension** | Validates specs, not alien RDF intent |
| Meaning ownership before mint | Vocab RESOLVE/RECORD | **Align** | Cross-link Heimsbakk |
| Terraform for all changes | — | **Defer** | Non-adoption |
| `tied_validate_consistency` = domain truth | — | **Align** (anti-pattern) | Match target cert scope limits |
| Executable spec factory run records | AI-SDLC comparison | **Composable** | Evidence shape crosswalk only |

---

## Proof boundary (unchanged)

Open Ontologies proves **derivations relative to recorded rules/inputs**, not that an ontology matches the world. TIED proves **traceability and gate-enforced implementation consistency** in this repo, not RDF domain correctness. Wave 3 behavior change requires scoped **add-feature** / **build-plan** with REQ/ARCH/IMPL, tests, and gates—not comparison prose alone.

---

## Sponsor next step

| Action | When |
| --- | --- |
| **build-plan** on this working folder | Write deliverables + run Phase 3 verification |
| **git commit** | Sponsor-owned after review |
| **close-out** | Optional envelope sync only if sponsor explicitly requests |
| Promote any recommendation to TIED YAML/MCP | New scoped TIED workflow (**costly**) |

**Refine-plan status:** Complete (pass 1, 2026-10-23). **Build-plan status:** Complete (2026-10-23); see [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md).
