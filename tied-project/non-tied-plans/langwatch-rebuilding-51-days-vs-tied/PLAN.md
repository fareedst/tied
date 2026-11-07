# Plan: LangWatch 51-day rebuild × TIED — agent management (Wave 2, local-only)

**Slug:** `langwatch-rebuilding-51-days-vs-tied`  
**Track:** `@non-tied-refine` (this plan) → `@non-tied-build` → optional `@non-tied-close`  
**Wave 1 slug (sibling):** [`langwatch-rebuilding-51-days-capture`](../langwatch-rebuilding-51-days-capture/PLAN.md)  
**Source:** [Refactoring at AI speed, without the AI slop](https://langwatch.ai/blog/rebuilding-langwatch-in-51-days); capture [`docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md`](../../../docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md)  
**Template:** [`tied-bundle/docs/external-service-three-wave-comparison-template.md`](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 2 (14 sections)  
**Evaluation charter:** [`docs/tied-methodology-evaluation-framework.md`](../../../docs/tied-methodology-evaluation-framework.md) — primary lens for Q1–Q6 mapping; **not** comparable-arms proof without cohort data

## Scope

Doc-only **Wave 2 comparison**: map LangWatch’s **multi-agent refactor methodology** (module contracts, lint/enforcer, ADR record, trace-driven harness tuning, merge suspicion, simulator-backed verification) to TIED **agent management and evaluation** surfaces in this repo—not adopting LangWatch product, haven, or lane-agent code as TIED core.

| Boundary | Choice |
| --- | --- |
| Wave 2 deliverable | `docs/comparisons/langwatch-rebuilding-51-days-vs-tied-agent-management.md` |
| Publish | **Local only** — `docs/comparisons/*` |
| Wave 3 | **Defer** — doc/skill compose candidates only in §11 |
| Build inputs | Wave 1 capture required; second full blog read only if capture gap found |

## Refine outcomes (Touchpoint 1 — RESOLVE)

| Term (LangWatch) | Wave 2 mapping intent (TIED lens) |
| --- | --- |
| **Module contract** | Bounded change surface → `[REQ-MODULE_VALIDATION]`, binding inventory compose |
| **Architecture enforcer** | Cross-tree import policy → scoped analysis + vocab drift (dormant adapters) compose |
| **Architecture record** | Single layout truth → `tied-bundle/` read-only methodology vs `tied-project/` intent; not one 3k-line app ADR |
| **Trace review (11 Sep)** | Session cost / re-read ratio → MCP metrics JSONL, conversation-analysis-tools, harness trace skills |
| **Lane coordinator** | Parallel agents with bounded assignments → Task subagents; sponsor ladder for costly choices |
| **Owed-ports list** | Named merge defects → evaluation control samples + historical defect proxy (**human_decision**), not TIED confirmed finding |
| **Dogfood observability** | LangWatch on own traces → **Composable** with REQ-MCP_USAGE_METRICS / external product **Defer** |

**Gate:** Wave 2 builds after Wave 1; evaluation-framework Q-table is mandatory in executive material; local-only publish matches Wave 1.

## Evidence inputs (read-only)

| Role | Path |
| --- | --- |
| Wave 1 capture | `docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md` |
| Sibling analyses | `langchain-harness-engineering-vs-tied-agent-management.md`, `cursor-harness-engineering-vs-tied-agent-management.md`, `traefik-harness-platform-vs-tied-agent-management.md`, `claude-code-team-code-review-vs-tied.md` |
| TIED anchors | `AGENTS.md`, `docs/tied-methodology-evaluation-framework.md`, `docs/tied-value-proposition-matrix.md`, `docs/leap-tied-citdp-costs-and-benefits.md`, `tied-bundle/docs/evidence-chain-profile.md`, `docs/conversation-analysis-tools.md`, `tied-project/vocab/quality-assurance.md`, `tied-project/vocab/fidelity-research.md`, `tied-project/vocab/sponsor-agent-relationship.md`, `tied-bundle/docs/agent-req-implementation-checklist.md` |

## Deliverables (`@non-tied-build`)

| Artifact | Path |
| --- | --- |
| Wave 2 analysis | `docs/comparisons/langwatch-rebuilding-51-days-vs-tied-agent-management.md` |
| Capture back-link | Update Wave 1 **Analysis (sibling)** to Wave 2 relative path |
| Plan folder | `tied-project/non-tied-plans/langwatch-rebuilding-51-days-vs-tied/` |

**Optional (Defer):** `methodology-composition-matrix.md` row; cross-edit LangChain/Cursor **Distinct from** only if collision found.

## Center-of-gravity (compose-don’t-replace)

**LangWatch (reported):** **Codebase structure + machine-checked rules** as the primary agent constraint; **observability on harness sessions** to tune parallelism and context; **behavioral equivalence** vs main via diff tools and agent-driven UI test drive.

**TIED (stdd):** **Intent traceability** REQ → ARCH → IMPL, checklist gates, MCP project YAML, evidence-chain **proof boundaries**, fidelity/adversarial inquiry for **confirmed** findings, evaluation charter **separate Q1 arms**.

**Compose:** Borrow **trace-informed harness tuning**, **explicit merge defect ledger**, **simulator-first verification**, **lint message fix hints**, and **cost denominators** for agent work. Keep **token graph authority**, **`tied_verify`**, **sponsor ladder**, and **LEAP proposal queue** on the TIED plane.

## Analysis contract

1. **14 template sections** in order (Executive summary → Related documents).
2. **Executive summary** must include **evaluation questions Q1–Q6 mapping table** (disposition per cell) + compose-don’t-replace paragraph.
3. **§3 sibling table** — own **large-scale refactor + lint/ADR agent constraint + dogfooded LLM ops**; defer LangChain **benchmark trace loop**, Cursor **online evals**, Traefik **fleet egress seam** detail.
4. **§4 Harness lessons** — minimum **nine** thematic subsections with mapping tables:
   - Module contracts vs monolith reachability
   - Lint/enforcer vs ADR record vs skills proliferation
   - Trace-driven coordination (11 Sep) → context economics
   - Lane coordinator / handovers / shared verify queue
   - Main merge + owed-ports vs silent loss
   - haven + simulators + shared browser vs composition tests
   - apidiff/visualdiff + agent test drive vs adversarial inquiry / fidelity pilot
   - Typecheck/modular build speed (developer cost) vs Q5 checklist cost
   - Production misses after green checks → Q1 proof-boundary lesson
5. **§6 matrix** — 12–15 rows; dispositions only: Align / Composable / Tension / Gap / Defer.
6. **§7 mermaid** — LangWatch trace/lint loop → harness-adjacent → TIED core (gates, MCP, verify, sponsor ladder).
7. **§11 phased recommendations** — Wave 3 rows default **Defer** (evaluation corpus narrative row note, harness-trace doc cross-link, incident-revert corpus compose).
8. All LangWatch metrics **LangWatch-reported**; TIED outcomes **not_measured**.

## Distinct from (scope ownership)

| Sibling | LangWatch owns |
| --- | --- |
| LangChain harness × TIED | Empirical **benchmark** middleware loop (Terminal Bench) |
| Cursor harness × TIED | Production evals, Keep Rate, online A/B |
| Traefik × TIED | Harness/platform/targets **seam** vocabulary (reference only) |
| Claude code review × TIED | PR review automation comparison |

## Forbidden

REQ/ARCH/IMPL mint in analysis body; claiming LangWatch verification stack proves TIED cohort superiority; universal maturity score; conflating **historical defect proxy** with **confirmed finding**; `.gitignore` allowlist without sponsor opt-in.

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).
