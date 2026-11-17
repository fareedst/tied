# Plan: LangChain Goal Engineering × TIED (Wave 1–2)

**Slug:** `langchain-goal-engineering-vs-tied`  
**Track:** `non-tied-refine` (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [Goal Engineering: How to Design Goals](https://www.langchain.com/blog/goal-engineering) (2026-11-14; Harrison Chase, Mihir Garimella, Anshul Gupta — **LangChain-reported**)  
**Skill:** [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md)  
**Template:** [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 1 + Wave 2 (14 sections)  
**Evaluation charter:** [tied-methodology-evaluation-framework.md](../../../docs/tied-methodology-evaluation-framework.md) — Q1–Q6 literacy table in Wave 2; arms **`not_measured`**

---

## Scope

Doc-only **Wave 1 capture + Wave 2 comparison**: map LangChain’s **goal engineering** thesis (scope agents so **human feedback** is easy; tacit taste via review UX; **motions** vs per-entity agents) to TIED **sponsor–agent**, **checklist/CITDP scope**, **`tied_feedback_*`**, and **harness/platform seam**—not adopting Hone, Actively product UI, or business-metric optimization as TIED core.

| Boundary | Choice |
| --- | --- |
| Wave 1 | `docs/comparisons/langchain-goal-engineering.md` |
| Wave 2 | `docs/comparisons/langchain-goal-engineering-vs-tied-agent-management.md` |
| Publish | **Git allowlist** — two `!docs/comparisons/…` lines in root `.gitignore` (same pattern as Open Governance / LangChain harness captures) |
| Parallel working | `tied-project/working/DOC-LANGCHAIN-GOAL-ENGINEERING-COMPARISON/` (`PLAN-refine-pass1.md`, `checklist-tracker-refine.yaml`, `evidence/url-fetch-receipt.md`) — outreach tracker only; **no REQ mint** |
| Matrix §2 row 20 | **Defer** (19-row contract); cross-link from rows **14–15** metadata + new doc **Related documents** |
| Wave 3 | **Defer** — vocab RECORD for “goal-aligned scope”, mandatory review UX in IDE, or KPI loops unless sponsor scopes `add-feature` |

---

## Refine outcomes (Touchpoint 1 — RESOLVE)

**PRELOAD (read-only):** [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [harness-platform-taxonomy.md](../../vocab/harness-platform-taxonomy.md), [feature-orchestration.md](../../vocab/feature-orchestration.md). **No vocab RECORD** on this non-tied refine pass.

| Term | Resolved meaning |
| --- | --- |
| **Goal engineering** | Design **agent goal scope** so experts can give **high-quality feedback** cheaply; tacit context dominates subjective work (**LangChain-reported** thesis) |
| **Motion (Actively)** | Job-to-be-done oriented agent (e.g. outbound) across many accounts—feedback transfers within motion (**LangChain-reported** case study) |
| **Context-gathering agent** | Background assembly of **written** account context; separate from motion that executes work (**LangChain-reported** pattern) |
| **Harness-adjacent scope** | Prompt-type **Task** profiles, skills, CITDP item boundaries—tunes review batching; does not replace gates or MCP YAML |
| **Platform-adjacent proof** | REQ/ARCH/IMPL, **`tied_verify`**, **`tied_checklist_gate_validate`**, sponsor **costly choice** ladder |
| **Compose-don’t-replace** | Borrow feedback-alignment and JTBD-scope literacy; keep token graph and gate authority on platform plane |

**Analytical center (this bundle):** *goal scope ↔ feedback throughput* and *subjective long-horizon work*—**not** trace/middleware/benchmark tuning ([langchain-harness-engineering-vs-tied-agent-management.md](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md)).

**Gate:** Slug, git publish, sibling boundaries, and Wave 3 **Defer** confirmed; no ambiguity on distinct-from harness doc.

---

## Deliverables (`@non-tied-build`)

| Artifact | Path | Required |
| --- | --- | --- |
| Wave 1 capture | `docs/comparisons/langchain-goal-engineering.md` | Yes |
| Wave 2 analysis (14 sections) | `docs/comparisons/langchain-goal-engineering-vs-tied-agent-management.md` | Yes |
| Git allowlist | `.gitignore` (`!docs/comparisons/langchain-goal-engineering.md`, `!…-vs-tied-agent-management.md`) | Yes |
| Sibling backlinks | `langchain-harness-engineering-vs-tied-agent-management.md` (+ optional harness capture related link) | Yes |
| Skill examples row | `tools/bundled-prompt-type-skills/external-service-comparison/examples.md` | Yes |
| DOC working | `tied-project/working/DOC-LANGCHAIN-GOAL-ENGINEERING-COMPARISON/*` | Yes |
| Matrix header sibling link | `docs/comparisons/methodology-composition-matrix.md` **Sibling docs** line | Optional (one-line index) |
| Evaluation charter | `docs/tied-methodology-evaluation-framework.md` | **Defer** (no charter row unless sponsor asks) |

---

## Distinct from

| Sibling | Owns | This plan owns |
| --- | --- | --- |
| [LangChain harness × TIED](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) | LangSmith traces, middleware, Terminal Bench | **Goal scope + review UX** for tacit feedback |
| [Cursor harness × TIED](../../../docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md) | Evals, Keep Rate, online ops | Subjective org workflows vs product telemetry |
| [Ludanyi × TIED](../../../docs/comparisons/andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md) | People/team proxy metrics | **Agent goal design** for feedback |
| [Open Governance × TIED](../../../docs/comparisons/open-governance-cannot-sense-vs-tied-agent-management.md) | Board sensing / odourless harm | Product **feedback alignment**, not governance essay |
| [Traefik × TIED](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) | Harness/platform **seam** architecture | Goal scope as **harness** compose only (cross-link authority boundary) |

---

## Wave 2 content checklist (for build)

Executive summary must include center-of-gravity table and **compose-don’t-replace** one-liner.

| § | Section | Build notes |
| --- | --- | --- |
| 1 | Executive summary | LangChain vs TIED table; Q1–Q6 mapping subsection optional |
| 2 | Source summary | Actively motions, Hone mention, future thesis — **LangChain-reported** only |
| 3 | Sibling comparisons | Table above expanded |
| 4 | Harness lessons → TIED | Feedback-aligned scope → checklist granularity; tacit → sponsor lanes + RECORD gap; motions → prompt-type batching |
| 5 | Touchpoint 1 — RESOLVE | Goal/motion terms vs REQ/CITDP slug |
| 6 | Primary capability matrix | Rows: tacit feedback, review UX, written context, metric optimization, long-horizon goals |
| 7 | Authority boundary | Mermaid optional; gates vs chat review |
| 8 | Anti-patterns | Chat review as gate; goal engineering waiving IMPL; vendor KPI as TIED proof |
| 9 | Compose-don’t-replace | Harness tune vs platform authority table |
| 10 | Bounded recommendations | Recommendation-only numbered list (5–7) |
| 11 | Phased recommendations | Phase 0 doc-only; Wave 3 **Defer** |
| 12 | Explicit non-adoptions | Hone/Actively UI, business metric optimizer, matrix row 20 |
| 13 | Proof boundary | **not_measured**; no REQ mint in body |
| 14 | Related documents | Harness sibling, HTOL, sponsor-two-lane, feedback vocab |

---

## Forbidden

- Project REQ/ARCH/IMPL YAML mutations from comparison prose
- Methodology composition matrix **§2 data row** without scoped REQ (row 20 **Defer**)
- Claiming Actively/Hone outcomes as TIED effectiveness
- Substituting human review loops for **`tied_checklist_gate_validate`** / **`tied_verify`**
- Automatic git stage, commit, or push

---

## Plan execution steps

1. [x] Refine PLAN + CITDP + test-strategy (`non-tied-refine`)
2. [x] Create DOC working folder + refine tracker + url-fetch evidence
3. [x] Author Wave 1 capture (normalized body + TLDR + metadata)
4. [x] Author Wave 2 analysis (14 template sections)
5. [x] Update `.gitignore`, sibling links, `examples.md`
6. [x] Verification grep (labels, links, section parity, no REQ mint)
7. [x] Update `evidence/session-handoff.md`; hand off paths to sponsor (`@non-tied-build`)

**Recorded depth:** `depth_tier: minimal`, `gate_policy: advisory`, `profile_depth: not_measured`, outreach doc-only — **`tied_checklist_gate_validate` not claimed for implement-complete.**