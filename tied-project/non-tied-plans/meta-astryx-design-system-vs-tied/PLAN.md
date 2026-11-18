# Plan: Meta Astryx design system × TIED (Wave 1–2)

**Slug:** `meta-astryx-design-system-vs-tied`  
**Track:** `non-tied-refine` (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [github.com/meta/astryx](https://github.com/meta/astryx) (MIT, beta; homepage [astryx.atmeta.com](http://astryx.atmeta.com))  
**Skill:** [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md)  
**Template:** [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 1 + Wave 2 (14 sections)

---

## Scope

Doc-only **Wave 1 repo capture + Wave 2 comparison**: map Meta **Astryx** (open design system, **agent-ready** CLI/docs/`AGENTS.md`, knowledge records with `current` authority, **vibe tests** for instruction quality) to TIED **agent-management** surfaces (canonical `AGENTS.md`, bundled skills, checklist gates, REQ→ARCH→IMPL, MCP `tied-project/` writes)—**not** adopting Astryx components, themes, or vibe-test harness as TIED methodology core, and **not** UI/design-system enforcement in this repo.

| Boundary | Choice |
| --- | --- |
| Wave 1 | `docs/comparisons/meta-astryx-design-system.md` — **repo summary** (metadata + TL;DR; **no README dump**) |
| Wave 2 | `docs/comparisons/meta-astryx-design-system-vs-tied-agent-management.md` |
| Publish | Git allowlist — two `!docs/comparisons/…` lines in root `.gitignore` |
| Parallel working | `tied-project/working/DOC-META-ASTRYX-DESIGN-SYSTEM-COMPARISON/` — outreach tracker; **no REQ mint** |
| Vendor source in repo | **Forbidden** — no pasted README/`AGENTS.md`; `evidence/target-repo-receipt.md` themes only |
| Matrix §2 new row | **Defer**; cross-link Google Agent Skills, Persante, Cursor/LangChain harness, Open Ontologies in Distinct from |
| Wave 3 | **Defer** — optional vocab/doc cross-links (`harness-platform-taxonomy`) unless sponsor scopes **`add-feature`** |

---

## Refine outcomes (Touchpoint 1 — RESOLVE)

**PRELOAD (read-only):** [harness-platform-taxonomy.md](../../vocab/harness-platform-taxonomy.md), [quality-assurance.md](../../vocab/quality-assurance.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [tied-methodology.md](../../vocab/tied-methodology.md) (client `agent-inject` / install-managed `AGENTS.md`). **No vocab RECORD** on this non-tied refine pass.

| Term | Resolved meaning |
| --- | --- |
| **Design system (Astryx)** | React 19+ UI kit, themes, patterns; StyleX internal; consumer uses CSS + typed components (**Meta-reported** / **target-repo-observed**) |
| **Agent-ready (Astryx)** | Shared API/docs/CLI so people and assistants build the same way: `astryx init` **agent blocks**, global skill `~/.agents/skills/astryx/SKILL.md`, short CLI output (**target-repo-observed**) |
| **Knowledge record** | Markdown spec under `docs/specs/` with `authority: draft\|current\|archived`; only **`current`** governs implementation (**target-repo-observed**) |
| **`pnpm specs:for`** | Path→record lookup for contributors/agents; complements component review receipts — not TIED MCP traceability |
| **Vibe test** | Offline probes whether `AGENTS.md` helps LLMs emit correct component code (`internal/vibe-tests`) — **earned by measurement** literacy |
| **Harness-adjacent** | Instruction surfaces, init blocks, vibe-tests — tune agent behavior on **product UI** repos |
| **Platform-adjacent proof** | TIED REQ/ARCH/IMPL, **`tied_checklist_gate_validate`**, **`tied_verify`**, LEAP, sponsor **consequence ladder** |

**Analytical center (this bundle):** *design-system agent ergonomics + knowledge authority for UI repos* vs TIED *software-delivery intent stack and gates*—**not** primary subject: harness session telemetry, RDF ontologies, wiki SDD task graphs, or multi-org skill catalog CI at Google scale.

**Gate:** Slug, repo capture (not article stub), git publish, sibling boundaries, Wave 3 **Defer**, matrix **Defer** — ambiguity cleared from sponsor URL + prior planning pass.

**Recorded depth:** `depth_tier: minimal`, `gate_policy: advisory`, `profile_depth: not_measured`, `change_class: comparisons_doc_only`.

---

## Deliverables (`@non-tied-build`)

| Artifact | Path | Required |
| --- | --- | --- |
| Wave 1 capture | `docs/comparisons/meta-astryx-design-system.md` | Yes |
| Wave 2 analysis (14 sections) | `docs/comparisons/meta-astryx-design-system-vs-tied-agent-management.md` | Yes |
| Git allowlist | `.gitignore` | Yes |
| Sibling backlinks | Google Agent Skills, Persante SDD, LangChain/Cursor harness, Open Ontologies, afurmanov profiler | Yes |
| Skill examples row | `tools/bundled-prompt-type-skills/external-service-comparison/examples.md` | Yes |
| DOC working | `tied-project/working/DOC-META-ASTRYX-DESIGN-SYSTEM-COMPARISON/*` | Yes |
| Matrix header sibling link | `docs/comparisons/methodology-composition-matrix.md` **Sibling docs** | Optional (one-line) |

---

## Distinct from

| Sibling | Owns | This plan owns |
| --- | --- | --- |
| [Google Agent Skills × TIED](../../../docs/comparisons/google-agent-skills-vs-tied-agent-management.md) | Catalog CI, per-skill semver, eval suites on PR | **Product-repo DS** agent init/docs; single upstream skill file |
| [Persante SDD × TIED](../../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md) | Wiki `spec.md` + task DAG in product repos | **Component API predictability** + repo `AGENTS.md`; not feature wiki |
| [LangChain / Cursor harness × TIED](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) | Live harness traces, benchmarks | **Static** AGENTS.md + offline vibe-tests |
| [Open Ontologies × TIED](../../../docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md) | RDF/OWL engine + MCP lifecycle | Human **markdown records** + UI specs — no triple store |
| [afurmanov harness-profiler × TIED](../../../docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md) | Session JSONL orchestration profile | Astryx **instruction-quality** probes for DS codegen |
| [Persante / Google EGM / Open Governance] | (other planes) | **OutOfScope** — do not duplicate their narratives |

---

## Wave 2 content checklist (for build)

Executive summary: center-of-gravity table (Astryx UI+agent docs vs TIED intent+gates); **compose-don’t-replace** one-liner; optional mermaid **DS instruction plane vs TIED token plane**.

| § | Section | Build notes |
| --- | --- | --- |
| 1 | Executive summary | Meta-reported scale (**13k+ apps**) labeled; beta/MIT noted |
| 2 | Source summary | Packages, init/skill, AGENTS.md, records, vibe-tests, principles — **Meta-reported** / **target-repo-observed** only |
| 3 | Sibling comparisons | Table above expanded |
| 4 | Harness lessons → TIED | AGENTS.md canonical surface; init blocks vs `tied-install`; CLI brevity vs MCP JSON; vibe-tests vs skill e2e |
| 5 | Touchpoint 1 — RESOLVE | `current` record vs REQ token; specs:for vs PRELOAD/CITDP; agent block vs skills/MCP |
| 6 | Primary capability matrix | ~10–12 rows: instruction, knowledge authority, conventions, measurement, delivery proof, UI **OutOfScope** |
| 7 | Authority boundary | DS records govern components; TIED gates govern methodology YAML |
| 8 | Anti-patterns | Paste README; vibe pass as `tied_verify`; adopt DS as TIED core |
| 9 | Compose-don’t-replace | Literacy table |
| 10 | Bounded recommendations | Recommendation-only: dual-plane in product repos using both stacks |
| 11 | Phased recommendations | Phase 0 doc-only; Wave 3 **Defer** |
| 12 | Explicit non-adoptions | Astryx npm packages in stdd core; vibe harness as gate substitute |
| 13 | Proof boundary | Q1–Q6 **not_measured**; no REQ mint in body |
| 14 | Related documents | evaluation framework, siblings, [client-development-index.md](../../../tied-bundle/docs/client-development-index.md) |

**Evaluation charter:** subsection with cohort **`not_measured`** per [tied-methodology-evaluation-framework.md](../../../docs/tied-methodology-evaluation-framework.md).

---

## Forbidden

- Committing vendor README, `AGENTS.md` body, or source trees under `docs/`
- Project REQ/ARCH/IMPL YAML mutations from comparison prose
- Methodology composition matrix **§2 data row** without scoped REQ
- Meta vibe-test pass rates or internal scale metrics as TIED effectiveness proof
- Substituting Astryx knowledge records for **`tied_validate_consistency`** / gate receipts
- Running target repo `pnpm install` / tests in stdd without separate scope
- Automatic git stage, commit, or push

---

## Plan execution steps

1. [x] Refine PLAN + CITDP + test-strategy (`non-tied-refine`)
2. [x] Create DOC working folder + refine tracker + `evidence/target-repo-receipt.md` (themes only)
3. [x] Author Wave 1 repo capture
4. [x] Author Wave 2 analysis (14 template sections)
5. [x] Update `.gitignore`, sibling links (light touch), `examples.md`
6. [x] Verification grep (labels, links, section parity, no REQ mint, no README dump)
7. [x] Update `evidence/session-handoff.md`; hand off paths to sponsor (`@non-tied-build`)

**Do next:** Optional **`@non-tied-close`** when sponsor requests git commit.