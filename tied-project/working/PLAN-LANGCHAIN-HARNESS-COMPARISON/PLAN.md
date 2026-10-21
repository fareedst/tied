# LangChain harness engineering × TIED — refined plan (refine-plan)

**Plan ID:** `PLAN-LANGCHAIN-HARNESS-COMPARISON`  
**Linked Cursor plan:** `/Users/fareed/.cursor/plans/langchain_harness_×_tied_9814e00c.plan.md`  
**Deliverable:** `docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md` (+ three cross-link edits)  
**Primary source capture:** [langchain-improving-deep-agents-harness-engineering.md](../../../docs/comparisons/langchain-improving-deep-agents-harness-engineering.md)

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Outreach comparison in the family of [traefik-harness-platform-vs-tied-agent-management.md](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) and [tied-vs-harness2.md](../../../docs/comparisons/tied-vs-harness2.md). **Compose-don’t-replace**; emphasize **agent management** (turn orchestration, context delivery, verification hooks, trace-driven harness tuning). No LangChain product import; no measured TIED outcomes from Terminal Bench.
- **RESOLVE charter:** Section structure and filenames may change; intent authority stays with sponsor comparison goal above.

### RESOLVE — LangChain article → TIED vocabulary

| External term | TIED preferred term / surface | Notes |
| --- | --- | --- |
| **Harness engineering** (LangChain) | **Harness profile** — prompt-type Task, skills, hooks, agentstream turns | Distinct from [Harness²](tied-vs-harness2.md) recursive optimization |
| **Three knobs** (prompt, tools, middleware) | **AGENTS.md** bootstrap, IDE MCP tools, Cursor hooks + opt-in Jev/agentstream preflight | YAML mutations stay on **TIED MCP** seam |
| **Trace Analyzer Skill** | **Kaizen / adherence** observation recipe; future Loop 3 skill (Recommendation-only) | Not `tied_checklist_gate_validate` |
| **LangSmith traces** | **Adherence ledger**, reconcile, optional adversarial inquiry artifacts | Advisory until checklist-owned confirmation |
| **Middleware** (PreCompletion, LocalContext, LoopDetection) | **External examples** → analogs in hooks, PRELOAD, Jev guard | Do not imply class names ship in stdd |
| **Build–verify loop** | `[PROC-TIED_DEV_CYCLE]`, **test-strategy**, **`tied_verify`** | Proof = tests + gates, not model self-read |
| **Self-verification** | **`pseudocode_validate`**, RED/GREEN, **`tied_validate_consistency`** | Composes with harness nudges |
| **Context engineering on behalf of agents** | **PRELOAD** ([routing.md](../../vocab/routing.md)), activation map, **`tied_config_get_base_path`** | Wrong base path = seam defect class |
| **Reasoning sandwich** (xhigh–high–xhigh) | IDE model policy (**Defer**); multi-model handoff Recommendation-only | TIED does not ship reasoning schedulers |
| **Terminal Bench 2.0** | **LangChain-reported** benchmark narrative | **`not_measured`** for TIED effectiveness |
| **Deep Agents / deepagents-cli** | External product; **Deep Agents** open source noted in capture | No adoption claim |

PRELOAD this session: **agentstream**, **prompt-composer**, **quality-assurance**, **working-artifact-placement**. Related seam doc: **Traefik harness/platform × TIED** (defer duplicate three-layer essay).

### Adversarial depth and gate policy

| Field | Value | Rationale |
| --- | --- | --- |
| `depth_tier` | **minimal** | Markdown-only deliverable |
| `gate_policy` | **advisory** | No MCP or checklist authority change |
| `research_profile` | **read-only** | Local capture only |
| `integrated_waiver` | **Accepted (reversible)** | Same class as PLAN-HARNESS2-COMPARISON; re-open integrated if scope adds agentstream code or methodology-surface edits |

### Consequence ladder

| Decision | Ladder | Default |
| --- | --- | --- |
| Doc-only vs pilot trace-analyzer skill in repo | **Costly** | Doc-only |
| Matrix §2 new row | **Costly** | **Defer** — header sibling link only |
| Mint REQ for harness middleware | **Costly** | **Defer** — use REQ-TIED_HARNESS_PLATFORM_SEAM as existing seam REQ |
| Cross-link Traefik + Harness² + capture | **Reversible** | **Do** in same pass |

---

## 2. CITDP

**Record:** [CITDP-PLAN-LANGCHAIN-HARNESS-COMPARISON.yaml](../../citdp/CITDP-PLAN-LANGCHAIN-HARNESS-COMPARISON.yaml)

---

## 3. Plan — document architecture

**Target file:** `docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md`

### Metadata table (required fields)

| Field | Content |
| --- | --- |
| Purpose | Map LangChain empirical harness loop to TIED agent management |
| Audience | Sponsors, harness authors, prompt-type operators, methodology owners |
| Source URL | LangChain blog (Feb 2026) + local capture sibling |
| Status | Outreach snapshot **2026-10-21**; **does not mint tokens** |
| Executable follow-up | [REQ-TIED_HARNESS_PLATFORM_SEAM](../REQ-TIED_HARNESS_PLATFORM_SEAM/PLAN.md), [authority-boundary-operator-checklist](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) |
| Distinct from | Traefik (seam mental model), Harness² (recursive bench harnessing) |

### Section outline (implement in order)

1. **Executive summary** — center-of-gravity table (LangChain optimizes harness on fixed model; TIED optimizes intent proof).
2. **Source summary (LangChain only)** — Terminal Bench setup; three knobs; trace analyzer flow; build–verify; three middleware patterns; reasoning sandwich; five takeaways — all **LangChain-reported** where numeric.
3. **Relationship to Traefik seam (short)** — Point readers to Traefik doc for Layer 1/2/3; this doc owns **how LangChain tuned Layer 1** empirically.
4. **Harness lessons → TIED agent management** — subsections mirroring LangChain article structure:
   - Trace-driven improvement loop
   - Build & self-verify
   - Context delivery (environment, testability, time budget)
   - Doom-loop guardrails
   - Reasoning/compute budgeting
   - Model-specific iteration (Codex vs Claude note in article)
5. **Touchpoint 1 — RESOLVE** — expanded table from §1.
6. **Disposition key** — Align / Composable / Tension / Gap / Defer.
7. **Primary capability matrix** — ≥10 rows (trace loop, knobs, context, self-verify, guardrails, reasoning, benchmarks, memory/skills, subagents, eval honesty).
8. **Authority boundary diagram (mermaid)** — LangSmith → harness hypothesis vs tests/gates/MCP → TIED core (reuse Traefik subgraph labels where possible).
9. **Anti-patterns** — benchmark overfit in skills; self-verify replaces gates; conflate Harness²; cite 66.5% as TIED success.
10. **Compose-don’t-replace table** — harness tune vs platform-adjacent authority (mirror Traefik § compose table; align checklist rows).
11. **Bounded operator recommendations (Recommendation-only)** — 5–7 bullets tied to authority-boundary checklist.
12. **Phased recommendations** — Phase 0 this doc; Phase 1 Kaizen observations from trace review; Phase 2 optional methodology learning experiment; Phase 3 matrix promotion only with sponsor approval.
13. **Proof boundary** — LangChain-reported metrics; TIED-existing anchors; no new tokens in body.
14. **Related documents** — capture, Traefik analysis, Harness², matrix row 13, agentstream README.

### Claim labeling

| Label | Use when |
| --- | --- |
| **LangChain-reported** | Blog/capture metrics and rankings |
| **TIED-existing** | Committed docs/tools behavior |
| **Recommendation-only** | Compose suggestions not implemented |

---

## 4. Cross-link updates (same implement pass)

1. [langchain-improving-deep-agents-harness-engineering.md](../../../docs/comparisons/langchain-improving-deep-agents-harness-engineering.md) — **Analysis (sibling)** → new doc; Traefik stays related.
2. [traefik-harness-platform-vs-tied-agent-management.md](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) — Related → LangChain empirical sibling.
3. [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) — Sibling docs header only.

---

## 5. Test strategy (documentation verification)

1. Scope guard: no `semantic-tokens.yaml` or project index YAML edits.
2. Link integrity from new comparison path.
3. Claim audit: Terminal Bench numbers labeled **LangChain-reported**.
4. Middleware names explicitly **external** with TIED analog column.
5. Disposition audit on matrix rows.
6. Gate: `tied_checklist_gate_validate` `phase: verification` after draft; receipt under `gates/`.

---

## 6. Implement handoff

Run **`/build-plan`** or **`/non-tied-plan`** implement on linked Cursor plan: author comparison + cross-links → §5 verification → update tracker `persist-citdp-record` → commit only if sponsor asks.

**Forbidden:** agentstream middleware implementation; `tied-bundle/` methodology edits; implying LangChain middleware classes exist in-repo.

---

## 7. Gate status (refine-plan)

**`pre_implementation` gate (2026-10-21):** `tied_checklist_gate_validate` → **`allowed: true`**, `depth: minimal`, `gate_policy: advisory`. Receipt: [pre_implementation-2026-10-21T05-13-26-754Z.json](gates/pre_implementation-2026-10-21T05-13-26-754Z.json).

**Build-plan (2026-10-21):** Deliverable written; verification gate **`allowed: true`** — [verification-2026-10-21T05-15-46-603Z.json](gates/verification-2026-10-21T05-15-46-603Z.json). **Close-out deferred** (sponsor commit / machine close-out not requested).

### Session handoff (2026-10-21)

See [evidence/session-handoff.md](evidence/session-handoff.md) — build-plan complete; commit and machine close-out not run.
