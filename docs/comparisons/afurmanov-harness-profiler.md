# What Did My Software Factory Just Do? (harness-profiler)

| Field | Value |
| --- | --- |
| **Source** | [A. Furmanov](https://afurmanov.com/harness-profiler) — full article text is **not** stored in this repository |
| **Product** | [github.com/afurmanov/harness-profiler](https://github.com/afurmanov/harness-profiler) (**target-repo-observed** README) |
| **Authors** | A. Furmanov (**Furmanov-reported**) |
| **Published** | November 15, 2026 (**Furmanov-reported**, page metadata) |
| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |
| **Captured** | 2026-11-17 (summary for analysis); full-text capture **withdrawn** per sponsor (stub policy) |
| **Analysis (sibling)** | [afurmanov-harness-profiler-vs-tied-agent-management.md](afurmanov-harness-profiler-vs-tied-agent-management.md) |
| **Related analysis (sibling)** | [langchain-harness-engineering-vs-tied-agent-management.md](langchain-harness-engineering-vs-tied-agent-management.md) (LangSmith trace loop — distinct subject) |
| **Plan (working)** | [PLAN-refine-pass1.md](../../tied-project/working/DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/PLAN-refine-pass1.md) |

---

## Why this file has no article body

The post and README were used to author the sibling analysis, but the **full article is not kept in-repo**. This stub retains metadata, **TL;DR**, and pointers. Read the post at the **Source** link and the product README on GitHub.

**Off-repo read:** [What Did My Software Factory Just Do?](https://afurmanov.com/harness-profiler)

---

## TL;DR

Summarizes themes used in the sibling analysis (**Furmanov-reported** / **target-repo-observed**; not independently verified here).

- **Motivation:** Large **software factories** (many skills + subagents) are hard to reason about without a post-session **X-ray** (**Furmanov-reported**).
- **Product:** **harness-profiler** — Claude Code plugin (and repo-committed hook) recording each tool call to `.harness-profile/.jsonl` with duration and token fields (**target-repo-observed**).
- **Visualization:** UML-style **sequence diagram** — vertical **bars** = contexts (conversation histories); **diamonds** = skills loaded **inline**; solid/dashed arrows = subagent fork and return (**Furmanov-reported**).
- **Case study:** Two **validation** runs of nearly equal cost; second run re-ran Rails review and tests though only Markdown changed; both reported **PASS** — waste visible only in the profile (**Furmanov-reported** metrics).
- **Deep dive:** `--verbose` / “every tool call” mode includes Bash, Read, Edit, MCP (**target-repo-observed**).
- **Expectation skills:** **`check-trace`** pattern — project skill asserts factory invariants on `tree --verbose` output (**Furmanov-reported** / README).
- **Constraints:** Codex **not supported yet**; requires Node for hooks; Claude Code–centric (**target-repo-observed**).

---

## Notes for stdd readers

- Claims above are **summary-only** for comparison traceability. They are **not** independently verified in Wave 1–2 and must not be treated as TIED methodology proof.
- Wave 2 maps themes to TIED **harness-adjacent** observation (HTOL, feedback capture) vs **platform-adjacent** gates—not adoption of the Claude Code plugin as TIED core.
- Pair with [langchain-harness-engineering-vs-tied-agent-management.md](langchain-harness-engineering-vs-tied-agent-management.md) and [cursor-harness-engineering-vs-tied-agent-management.md](cursor-harness-engineering-vs-tied-agent-management.md) for fleet trace/eval compose (**different center of gravity**).
- Effectiveness of harness-profiler patterns in TIED clients is **`not_measured`** unless an evaluation cohort is enrolled.
- **Wave 2:** [afurmanov-harness-profiler-vs-tied-agent-management.md](afurmanov-harness-profiler-vs-tied-agent-management.md) — factory profiler × TIED agent management (**reference only**).