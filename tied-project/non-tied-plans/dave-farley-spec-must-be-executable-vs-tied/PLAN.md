# Plan: Dave Farley “Spec Must Be Executable” × TIED (Wave 1–2)

**Slug:** `dave-farley-spec-must-be-executable-vs-tied`  
**Track:** `non-tied-refine` (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [The Spec Must Be Executable](https://www.linkedin.com/pulse/spec-must-executable-dave-farley-jrnxe/) (Dave Farley, **2026-10-25** — **Farley-reported** publish date on post)  
**Skill:** [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md)  
**Template:** [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 1 stub + Wave 2 (14 sections)

---

## Scope

Doc-only **Wave 1 stub + Wave 2 comparison**: map Farley’s **executable specification / ATDD** advocacy (industry convergence on verifiable behavioral intent for agent-written code; markdown SDD insufficiency; four-layer WHAT/HOW separation; human-owned red acceptance scenarios; protect tests from agents) to TIED **agent-management** surfaces (REQ→ARCH→IMPL, **`essence_pseudocode`**, [PROC-TIED_DEV_CYCLE](../../../tied-bundle/docs/processes.md), checklist gates, **`tied_verify`**, sponsor **consequence ladder**)—**not** adopting Farley’s commercial ATDD course/skill, Cucumber/Gherkin as TIED’s authoritative artifact, or mutation-testing gates as methodology core.

| Boundary | Choice |
| --- | --- |
| Wave 1 | `docs/comparisons/dave-farley-spec-must-be-executable.md` — **stub only** (link + TL;DR; **no article body**) |
| Wave 2 | `docs/comparisons/dave-farley-spec-must-be-executable-vs-tied-agent-management.md` |
| Publish | Git allowlist — two `!docs/comparisons/…` lines in root `.gitignore` |
| Parallel working | `tied-project/working/DOC-FARLEY-EXECUTABLE-SPEC-COMPARISON/` — outreach tracker; **no REQ mint** |
| Article text in repo | **Forbidden** — no pasted LinkedIn prose or long Gherkin blocks; `evidence/url-fetch-receipt.md` theme bullets only |
| Matrix §2 new row | **Defer**; cross-link AI-SDLC factory, Persante, Persante/markdown SDD critiques, degree competency grid |
| Wave 3 | **Defer** — doc/skill compose (acceptance vs IMPL pseudo-code); protected acceptance suite playbook unless sponsor scopes **`add-feature`** |
| Execution policy | **`static_only`** — URL fetch / sponsor context only; **no** Farley course checkout, **no** ATDD skill repo inspection unless sponsor adds path later |

---

## Refine outcomes (Touchpoint 1 — RESOLVE)

**PRELOAD (read-only):** [quality-assurance.md](../../vocab/quality-assurance.md), [pseudocode-and-citdp.md](../../vocab/pseudocode-and-citdp.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [tied-methodology.md](../../vocab/tied-methodology.md). **No vocab RECORD** on this non-tied refine pass.

| Term | Resolved meaning |
| --- | --- |
| **Executable specification** | Problem-language scenario that **runs** against the real system and fails until behavior exists; success criterion co-located with the example (**Farley-reported** / ATDD canon) |
| **Spec-driven (markdown tools)** | Spec Kit / Kiro / Tessl-style **prose** intent files — diagnose right, **medium wrong** when nothing goes red (**Farley-reported** attributions to Adzic, Böckeler, Eberhardt) |
| **Four-layer model** | Test cases → DSL → protocol drivers → SUT; WHAT at top, technical coupling at bottom (**Farley-reported**; LMAX lineage **Farley-reported**) |
| **Three hard problems** | Specify precisely, verify you got it, small steps to detect drift — AI speeds codegen only (**Farley-reported**) |
| **Red-first acceptance** | One scenario before agent; red proves spec can catch wrong answers; not waterfall big-bang markdown (**Farley-reported**) |
| **Protected acceptance contract** | Tests out of agent edit reach or human-approved contract changes (Beck/Bache **Farley-reported** anecdotes) |
| **Harness-adjacent** | BDD/acceptance discipline, mutation testing pairing, agent constraint swarms — tune delivery, not replace tokens |
| **Platform-adjacent proof** | TIED **`[REQ-*]`/`[ARCH-*]`/`[IMPL-*]`**, MCP project YAML, **`tied_checklist_gate_validate`**, **`tied_validate_consistency`**, gate receipts |

**Analytical center (this bundle):** *practitioner essay on verification bottleneck + executable behavioral specs for agents* vs TIED *semantic intent stack + layered TDD and gates*—**not** primary subject: AI-SDLC factory repo mechanics, Persante wiki task DAG, formal verification (Anthropic), or harness trace telemetry (LangChain/Cursor).

**Gate:** Slug, stub Wave 1, sibling boundaries (especially AI-SDLC factory), commercial course **cite-only**, Wave 3 **Defer**, matrix **Defer** — ambiguity cleared from sponsor URL + planning pass.

**Recorded depth:** `depth_tier: minimal`, `gate_policy: advisory`, `profile_depth: not_measured`, `change_class: comparisons_doc_only`.

---

## Deliverables (`@non-tied-build`)

| Artifact | Path | Required |
| --- | --- | --- |
| Wave 1 stub | `docs/comparisons/dave-farley-spec-must-be-executable.md` | Yes |
| Wave 2 analysis (14 sections) | `docs/comparisons/dave-farley-spec-must-be-executable-vs-tied-agent-management.md` | Yes |
| Git allowlist | `.gitignore` | Yes |
| Sibling backlinks | AI-SDLC factory, Persante SDD, degree grid, well-known methodologies, Persante/markdown SDD tension | Yes |
| Skill examples row | `tools/bundled-prompt-type-skills/external-service-comparison/examples.md` | Yes |
| DOC working | `tied-project/working/DOC-FARLEY-EXECUTABLE-SPEC-COMPARISON/*` | Yes |
| Matrix header sibling link | `docs/comparisons/methodology-composition-matrix.md` **Sibling docs** | Optional (one-line) |

---

## Distinct from

| Sibling | Owns | This plan owns |
| --- | --- | --- |
| [AI-SDLC factory × TIED](../../../docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md) | Protected `spec/`, Gherkin, `run-all.js` tree hash, PetClinic factory | **Essay-level** ATDD rules + four-layer pedagogy + markdown-SDD critique |
| [Persante SDD × TIED](../../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md) | Wiki `spec.md` + `tasks.json` in product repos | Farley: **running** examples as contract—not markdown FR/AC folders alone |
| [TIED vs well-known methodologies](../../../docs/comparisons/tied-vs-well-known-methodologies.md) | Broad methodology map | Single **executable spec for agents** lens |
| [Software engineering degree × TIED](../../../docs/comparisons/software-engineering-degree-vs-tied.md) | Graduate competency alignment grid | Practitioner **convergence narrative** + operator rules |
| [Anthropic FV × TIED](../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md) | Checker-backed proof | Empirical acceptance + TDD — different proof plane |
| [HackerNoon observability contract × TIED](../../../docs/comparisons/hackernoon-observability-contract-ci-vs-tied-agent-management.md) | Ops intent/runtime CI gates | **Behavioral** spec before codegen; cross-link “green without observability” ↔ “green without intent” analogy only |

**Do not duplicate** AI-SDLC protected-tree / run-record matrix rows; **cross-link** where Farley rule (2) aligns with factory GUARD patterns.

**Commercial tail:** Farley-reported ATDD course + bundled agent “ATDD skill” — URL/coupon in Wave 1/2 **Farley-reported** only; **not_measured**; no skill adoption claims.

---

## Wave 2 content checklist (for build)

Executive summary: center-of-gravity table (Farley acceptance plane vs TIED token+pseudo-code plane); **compose-don’t-replace** one-liner; optional mermaid (see refined planning pass).

| § | Section | Build notes |
| --- | --- | --- |
| 1 | Executive summary | Verification bottleneck; consensus quotes **Farley-reported** only |
| 2 | Source summary | Hard problems, markdown SDD failure mode, four layers, three rules, objections — **Farley-reported**; **no article paste** |
| 3 | Sibling comparisons | Table above expanded |
| 4 | Harness lessons → TIED | Red before agent ↔ unit/composition TDD; protected tests ↔ sponsor agency; small steps ↔ checklist slices |
| 5 | Touchpoint 1 — RESOLVE | Executable spec vs IMPL contract; Gherkin vs pseudo-code; RESOLVE charter vs specifier role |
| 6 | Primary capability matrix | ~10–12 rows: behavioral spec, protected contract, trace graph, gates, markdown SDD, mutation testing, four-layer harness |
| 7 | Authority boundary | Acceptance suite **product-adjacent**; TIED YAML + gates **methodology authority** |
| 8 | Anti-patterns | Paste LinkedIn body; course outcomes as TIED proof; agent-written tests as sole intent; `[REQ-*]` replaced by features alone |
| 9 | Compose-don’t-replace | Borrow executable-discipline literacy; keep MCP + token graph |
| 10 | Bounded recommendations | Recommendation-only: dual artifacts in clients (BDD + TIED stack) |
| 11 | Phased recommendations | Phase 0 doc-only; Wave 3 **Defer** |
| 12 | Explicit non-adoptions | Farley skill as TIED core; Gherkin as REQ substitute; mutation gate as `tied_verify` |
| 13 | Proof boundary | Q1–Q6 **not_measured**; no REQ mint in body |
| 14 | Related documents | [pseudocode-writing-and-validation.md](../../../tied-bundle/docs/pseudocode-writing-and-validation.md), AI-SDLC sibling, [agent-req-implementation-checklist.md](../../../tied-bundle/docs/agent-req-implementation-checklist.md) |

**Evaluation charter:** subsection with cohort **`not_measured`** per [tied-methodology-evaluation-framework.md](../../../docs/tied-methodology-evaluation-framework.md).

---

## Forbidden

- Pasting or committing LinkedIn article text or long vendor Gherkin fences from the post
- Project REQ/ARCH/IMPL YAML mutations from comparison prose
- Methodology composition matrix **§2 data row** without scoped REQ
- Farley course pricing / enrollment outcomes as TIED effectiveness proof
- Substituting acceptance green for **`tied_checklist_gate_validate`** / **`tied_validate_consistency`**
- Inspecting or vendoring Farley ATDD skill without separate sponsor scope
- Automatic git stage, commit, or push

---

## Plan execution steps

1. [x] Refine PLAN + CITDP + test-strategy (`non-tied-refine`)
2. [x] Create DOC working folder + refine tracker + `evidence/url-fetch-receipt.md` (themes only)
3. [x] Author Wave 1 stub capture
4. [x] Author Wave 2 analysis (14 template sections)
5. [x] Update `.gitignore`, sibling links, `examples.md`
6. [x] Verification grep (labels, links, section parity, no REQ mint, stub marker, no article body)
7. [x] Update `evidence/session-handoff.md`; hand off paths to sponsor (`@non-tied-build`)

**Do next:** Optional **`@non-tied-close`** when sponsor requests git commit.