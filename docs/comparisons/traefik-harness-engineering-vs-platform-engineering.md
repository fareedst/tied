# Harness Engineering vs Platform Engineering: A Mental Model for How Both Win

| Field | Value |
| --- | --- |
| **Source** | [Traefik blog](https://traefik.io/blog/harness-engineering-vs-platform-engineering-a-mental-model-for-how-both-win) |
| **Authors** | Sudeep Goswami, Immánuel Fodor |
| **Published** | May 7, 2026 |
| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |
| **Captured** | 2026-10-20 |
| **Related capture (sibling)** | [langchain-improving-deep-agents-harness-engineering.md](langchain-improving-deep-agents-harness-engineering.md) |
| **Analysis (sibling)** | [Traefik harness vs platform × TIED — agent management lens](traefik-harness-platform-vs-tied-agent-management.md) |

---

## Why this file has no article body

The post was used to author the sibling analysis, but the **full article is not kept in-repo**. This stub retains metadata, **TL;DR**, and pointers. Read at the **Source** link; do not paste vendor prose back into this repository.

---

## TL;DR

Summarizes themes used in the sibling analysis (**Traefik-reported**; read off-repo for wording).

- **Harness** owns task/model-specific wrapper concerns inside an agent process (prompt, tools, middleware, session loop).
- **Platform** owns cross-agent enterprise concerns (identity, policy, routing, shared observability seams).
- Industry narrative in early 2026 cites LangChain harness gains and Cursor harness practices as **composable lessons**, not substitutes for platform engineering (**Traefik-reported**).

---

## Notes for stdd readers

- Claims above are **summary-only** for comparison traceability.
- Wave 2: [traefik-harness-platform-vs-tied-agent-management.md](traefik-harness-platform-vs-tied-agent-management.md) — **reference only**; effectiveness **`not_measured`** unless enrolled.