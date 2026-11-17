# Goal Engineering: How to Design Goals

| Field | Value |
| --- | --- |
| **Source** | [LangChain blog](https://www.langchain.com/blog/goal-engineering) — full article text is **not** stored in this repository |
| **Authors** | Harrison Chase; Mihir Garimella (Actively AI); Anshul Gupta (Actively AI) (**LangChain-reported**) |
| **Published** | November 14, 2026 (**LangChain-reported**, page metadata) |
| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |
| **Captured** | 2026-11-17 (summary for analysis); full-text capture **withdrawn** per sponsor (do not commit article body) |
| **Analysis (sibling)** | [langchain-goal-engineering-vs-tied-agent-management.md](langchain-goal-engineering-vs-tied-agent-management.md) |
| **Related analysis (sibling)** | [langchain-harness-engineering-vs-tied-agent-management.md](langchain-harness-engineering-vs-tied-agent-management.md) (trace/middleware — distinct subject) |
| **Plan (working)** | [PLAN-refine-pass1.md](../../tied-project/working/DOC-LANGCHAIN-GOAL-ENGINEERING-COMPARISON/PLAN-refine-pass1.md) |

---

## Why this file has no article body

The post was used to author the sibling analysis, but the **full article is not kept in-repo**. This stub retains metadata, **TL;DR**, and pointers. Read the post at the **Source** link; do not paste the LangChain blog body back into this repository.

**Off-repo read:** [Goal Engineering: How to Design Goals](https://www.langchain.com/blog/goal-engineering)

---

## TL;DR

Summarizes themes used in the sibling analysis (**LangChain-reported**; read off-repo for wording; not independently verified here).

- **Trajectory:** Agents toward **open-ended goals** and metric-driven setups; **Hone** mentioned as an example product direction.
- **Goal engineering:** Scope agents so **human feedback** within that scope is as easy as possible.
- **Context split:** Written context (docs, APIs) vs **tacit** expert context (taste, brand, aggressiveness) delivered via feedback—central to subjective work.
- **Review UX:** Bottleneck is learning from feedback; invest in review surfaces.
- **Actively case study:** Shift from per-**account** agents to cross-account **motions** (JTBD); background agents for written account context (**LangChain-reported** narrative).
- **Closing thesis:** **Goal engineering** persists even if prompt/context engineering fade—align goals to what humans can review efficiently.

---

## Notes for stdd readers

- Claims above are **summary-only** for comparison traceability. They are **not** independently verified in Wave 1–2 and must not be treated as TIED methodology proof.
- Wave 2 maps themes to TIED **harness/platform** and **sponsor–agent** surfaces—not adoption of LangChain sales products.
- Pair with [langchain-harness-engineering-vs-tied-agent-management.md](langchain-harness-engineering-vs-tied-agent-management.md) for **harness/trace** tuning (different center of gravity).
- Effectiveness of goal-engineering practices in TIED clients is **`not_measured`** unless an evaluation cohort is enrolled.
- **Wave 2:** [langchain-goal-engineering-vs-tied-agent-management.md](langchain-goal-engineering-vs-tied-agent-management.md) — goal engineering × TIED agent management (**reference only**).
- **Wave 3 Phase 1:** [goal-engineering-feedback-scope-compose.md](../../tied-bundle/docs/goal-engineering-feedback-scope-compose.md) — operator compose guide ([REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3](../../tied-project/requirements/REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3.yaml)).