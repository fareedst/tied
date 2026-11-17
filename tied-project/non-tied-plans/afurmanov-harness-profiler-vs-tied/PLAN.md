# Plan: Furmanov harness-profiler × TIED (Wave 1–2)

**Slug:** `afurmanov-harness-profiler-vs-tied`  
**Track:** `non-tied-refine` (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [What Did My Software Factory Just Do?](https://afurmanov.com/harness-profiler) (2026-11-15; A. Furmanov — **Furmanov-reported**)  
**Product (read-only):** [github.com/afurmanov/harness-profiler](https://github.com/afurmanov/harness-profiler) — **target-repo-observed** via README  
**Skill:** [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md)  
**Template:** [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 1 + Wave 2 (14 sections)  
**plan_phase:** `close-out-ready`

---

## Scope

Doc-only **Wave 1 stub capture + Wave 2 comparison**: map **harness-profiler** (Claude Code hook → `.harness-profile/.jsonl` → UML-style context timeline + token/duration tree; optional **`check-trace`** expectation skill) to TIED **harness-adjacent** observation ([harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md), `@harness-trace-review`, **`tied_feedback_capture_observation`**) and **platform-adjacent** proof—without adopting Claude Code plugin, Furmanov token tables, or PASS-line validators as TIED gate authority.

| Boundary | Choice |
| --- | --- |
| Wave 1 | `docs/comparisons/afurmanov-harness-profiler.md` — **stub** (metadata + TL;DR + off-repo link; sponsor choice) |
| Wave 2 | `docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md` |
| Publish | Git allowlist — two `!docs/comparisons/…` lines in root `.gitignore` |
| Parallel working | `tied-project/working/DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/` — outreach tracker only; **no REQ mint** |
| Matrix §2 new row | **Defer**; cross-link rows **14–15** + HTOL in Wave 2 **Related documents** |
| Wave 3 | **Defer** — HTOL source-study one-liner doc-only unless sponsor scopes doc edit; trace export bridge → **`add-feature`** |

---

## Refine outcomes (Touchpoint 1 — RESOLVE)

**PRELOAD (read-only):** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [agentstream.md](../../vocab/agentstream.md). **No vocab RECORD** on this refine pass.

| Term | Resolved meaning |
| --- | --- |
| **Software factory** | Many cooperating **skills** + **subagents** in one repo/session (**Furmanov-reported** framing) |
| **Context (profiler)** | Conversation history the model reads; vertical **bar** in sequence diagram; forked skill/subagent → new bar (**Furmanov-reported** / README) |
| **Inline skill** | Diamond: instructions merged into caller context; no separate bar (**target-repo-observed**) |
| **check-trace** | Project skill that runs `tree --verbose` and asserts factory invariants (order, fork rules) — harness expectation spec, not gate |
| **Harness-adjacent profile** | Post-session structural/cost visibility; feeds HTOL / Kaizen |
| **Platform-adjacent proof** | REQ/ARCH/IMPL, **`tied_verify`**, **`tied_checklist_gate_validate`**, MCP **`tied-project/`** writes |

**Analytical center (this bundle):** *orchestration structure + hidden duplicate work* (PASS with waste)—**not** LangSmith benchmark loops, Cursor Keep Rate, or goal-engineering review UX.

**Gate:** Slug, stub Wave 1, git publish, sibling boundaries, Wave 3 **Defer**, matrix **Defer** — sponsor-confirmed; ambiguity cleared.

**Recorded depth:** `depth_tier: minimal`, `gate_policy: advisory`, `profile_depth: not_measured`, `change_class: comparisons_doc_only`.

---

## Deliverables (`@non-tied-build`)

| Artifact | Path | Required |
| --- | --- | --- |
| Wave 1 stub | `docs/comparisons/afurmanov-harness-profiler.md` | Yes |
| Wave 2 analysis (14 sections) | `docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md` | Yes |
| Git allowlist | `.gitignore` | Yes |
| Sibling backlinks | LangChain harness, Cursor harness, HTOL optional one-liner | Yes |
| Skill examples row | `tools/bundled-prompt-type-skills/external-service-comparison/examples.md` | Yes |
| DOC working | `tied-project/working/DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/*` | Yes |
| HTOL Source studies line | `tied-bundle/docs/harness-trace-observation-loop.md` | Optional (sponsor; doc-only Phase 1) |

---

## Distinct from

| Sibling | Owns | This plan owns |
| --- | --- | --- |
| [LangChain harness × TIED](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) | LangSmith traces, middleware, Terminal Bench | **Local JSONL** + **context/fork** sequence view for skill factories |
| [Cursor harness × TIED](../../../docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md) | Fleet evals, Keep Rate, tool SLOs | **Single-session** factory post-mortem; duplicate child calls |
| [LangChain goal engineering × TIED](../../../docs/comparisons/langchain-goal-engineering-vs-tied-agent-management.md) | Feedback scope, motions, review UX | **Structural** invariants on call tree |
| [Claude Code team review × TIED](../../../docs/comparisons/claude-code-team-code-review-vs-tied.md) | PR review convergence | **Runtime** orchestration profile (not diff review) |
| [Traefik × TIED](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) | Three-layer seam architecture | Profiler as harness-adjacent instrument at seam |

---

## Wave 2 content checklist (for build)

| § | Section | Build notes |
| --- | --- | --- |
| 1 | Executive summary | Furmanov vs TIED COG table; compose-don’t-replace |
| 2 | Source summary | Plugin, hook JSONL, diagram semantics, double-validation case, check-trace — **Furmanov-reported** / **target-repo-observed** |
| 3 | Sibling comparisons | Table above expanded |
| 4 | Harness lessons → TIED | Inline vs fork → Task/subagent; duplicate validator → HTOL; PASS vs waste → **Tension** with **`tied_verify`** |
| 5 | Touchpoint 1 — RESOLVE | factory/context/check-trace vs PRELOAD/CITDP slug |
| 6 | Primary capability matrix | ~12 rows: viz, hooks, tokens, invariants, Claude-only, agentstream trace, gates, Codex **Defer** |
| 7 | Authority boundary | Mermaid: profiler → HTOL; gates/YAML isolated |
| 8 | Anti-patterns | check-trace as gate; token savings as TIED proof; PASS hides structural waste |
| 9 | Compose-don’t-replace | Harness tune vs platform table |
| 10 | Bounded recommendations | Recommendation-only (3–7) |
| 11 | Phased recommendations | Phase 0 docs; Wave 3 **Defer** |
| 12 | Explicit non-adoptions | Plugin as core; Furmanov metrics as effectiveness |
| 13 | Proof boundary | **not_measured** |
| 14 | Related documents | HTOL, agentstream, siblings |

---

## Forbidden

- Project REQ/ARCH/IMPL YAML mutations from comparison prose
- Methodology composition matrix **§2 data row** without scoped REQ
- Furmanov token/duration tables as TIED effectiveness proof
- `check-trace` / profile PASS-FAIL substituting **`tied_checklist_gate_validate`** / **`tied_verify`**
- Running `npx github:afurmanov/harness-profiler init` in stdd without separate scope
- Automatic git stage, commit, or push

---

## Plan execution steps

1. [x] Refine PLAN + test-strategy (`non-tied-refine`)
2. [x] Create DOC working folder + refine tracker + url-fetch evidence
3. [x] Author Wave 1 stub capture
4. [x] Author Wave 2 analysis (14 template sections)
5. [x] Update `.gitignore`, sibling links, `examples.md`, HTOL source study
6. [x] Verification grep (labels, links, section parity, no REQ mint)
7. [x] Update `evidence/session-handoff.md`; hand off to sponsor

**Do next:** Optional **`@non-tied-close`** for git hygiene preview only. Wave 3 matrix row and trace bridge remain **Defer**.