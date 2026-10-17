# Path-scoped review guidance (`REVIEW.md`)

**Audience:** Client operators and agents reviewing or changing code under specific subtrees (Loop 1–2 — **client-owned** review context).

**Traceability:** [REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE](../../tied-project/requirements/REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE.yaml) · Claude comparison [learning #2](../../docs/comparisons/claude-code-team-code-review-vs-tied.md#learnings-worth-composing-not-wholesale-adopt)

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Optional **path-scoped** review prose (what to scrutinize, local commands, non-goals) | New MCP gate authority or PR-bot products as TIED truth |
| **`tied-project/review/`** index and/or **`REVIEW.md`** files adjacent to modules | Replacing [AGENTS.md](../../AGENTS.md), [routing.md](../../tied-project/vocab/routing.md), or REQ→ARCH→IMPL |
| Compose with [pre-handoff charter](pre-handoff-verification-charter.md) and [review convergence policy](review-convergence-policy.md) | Mandatory org-wide review automation |

Guidance files are **client project data** under `tied-project/` (or repo paths the client owns). Methodology ships **patterns and examples** under `tied-bundle/` only.

---

## Why path-scoped guidance

Anthropic-style Layer 1 review uses concise project context plus **optional path-scoped rules** so agents and humans focus attention without rereading the entire repository. TIED already centralizes global agent load via **AGENTS.md** and vocabulary **PRELOAD**. Path-scoped **`REVIEW.md`** (or a **`tied-project/review/`** map) adds **local** focus: APIs, security surfaces, migration invariants, or module-specific test commands.

---

## Layout patterns (choose one or combine)

| Pattern | Location | Best for |
| --- | --- | --- |
| **Central map** | `tied-project/review/README.md` (or `index.md`) | Many paths; one table mapping globs → focus + links |
| **Adjacent stub** | `REVIEW.md` next to a module root (e.g. `src/payments/REVIEW.md`) | Stable ownership boundary; reviewers open nearest file |
| **Hybrid** | Map in `tied-project/review/` + short adjacent stubs | Large monorepos |

**Discovery (agents):** Before deep edits under path `P`, read the nearest **`REVIEW.md`** walking up from `P`, else consult **`tied-project/review/`** for a matching glob row. **PRELOAD** global glossaries from [routing.md](../../tied-project/vocab/routing.md) first; path guidance **narrows** review, it does not replace vocabulary or TIED tokens.

---

## What to put in a path-scoped file

Keep each file **short** (one screen). Suggested sections:

1. **Scope** — glob or directory prefix this file covers  
2. **Focus** — correctness themes (auth, money, concurrency, public API stability)  
3. **Executable checks** — commands beyond repo-default lint/test (link [pre-handoff charter](pre-handoff-verification-charter.md))  
4. **Convergence** — round cap / diff-only re-review pointer ([review-convergence-policy.md](review-convergence-policy.md))  
5. **Risk tier** — when to escalate human/sponsor attention ([sponsor-risk-tier-playbook.md](sponsor-risk-tier-playbook.md))  
6. **Non-goals** — what this path must **not** change without a new REQ/CITDP  
7. **Proof boundary** — what reading this file does **not** prove (no substitute for gates or `tied_verify`)

Do **not** duplicate full AGENTS.md checklists or mint REQ tokens inside `REVIEW.md`.

---

## Examples (methodology templates)

Copy into the client tree and edit:

- [path-scoped-REVIEW.v1.example.md](../templates/path-scoped-REVIEW.v1.example.md) — adjacent-module stub  
- [tied-project-review-index.v1.example.md](../templates/tied-project-review-index.v1.example.md) — central map starter  

After copy, rename examples to **`REVIEW.md`** or **`tied-project/review/README.md`** as appropriate. **`tied-install`** does not auto-copy these into `tied-project/`; operators opt in.

---

## Compose with Claude comparison phases

| Phase | Relationship |
| --- | --- |
| 1 Pre-handoff charter | Global executable checks before handoff; path file adds **local** commands |
| 2 Risk-tier playbook | Path file may cite **`depth_tier`** / assurance hints for subtree |
| 3 Review convergence | Path file references round cap and diff-only norms |
| 5 Client DevOps appendix | PR handoff fields remain client CI; path guidance is **pre-PR** context |

---

## Related docs

- [Client development index](client-development-index.md)  
- [Claude Code team code review × TIED](../../docs/comparisons/claude-code-team-code-review-vs-tied.md)  
- [Sponsor–agent relationship](../../tied-project/vocab/sponsor-agent-relationship.md)  

**Last updated:** 2026-10-17
