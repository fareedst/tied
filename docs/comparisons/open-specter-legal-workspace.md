# Open Specter — legal AI workspace (read-only capture)

| Field | Value |
| --- | --- |
| **Source** | [QuanteraAI/OpenSpecter](https://github.com/QuanteraAI/OpenSpecter) (AGPL-3.0) · local path `/Users/fareed/Documents/dev/legal/OpenSpecter` @ `b29bdf9e` |
| **Maintainer** | Quantera.ai (**OpenSpecter-reported**) |
| **Fork lineage** | [Mike](https://github.com/willchen96/mike) / [mikeoss.com](https://mikeoss.com/) (**OpenSpecter-reported**) |
| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |
| **Captured** | 2026-11-17 |
| **Analysis (sibling)** | [open-specter-legal-workspace-vs-tied-agent-management.md](open-specter-legal-workspace-vs-tied-agent-management.md) |
| **Plan (non-tied)** | [PLAN.md](../../tied-project/non-tied-plans/open-specter-legal-workspace-vs-tied/PLAN.md) |

---

## Why this file has no article body

The source was used to author the sibling analysis, but the **full text is not kept in-repo**. This stub retains metadata, **TL;DR**, and pointers. Read at the **Source** link; do not paste vendor prose back into this repository.

---

## TL;DR

- **Product** — Open-source **legal team workspace**: projects (matters), document upload/versioning, assistant chat with citations, **tabular reviews** over document batches, reusable **workflows**, activity timeline, keyboard shortcuts, voice input (**OpenSpecter-reported** in README).
- **Stack** — Next.js 16 / React 19 frontend, Express TypeScript API, Supabase Auth + Postgres + RLS, R2/S3 storage (local disk fallback), multi-provider LLMs (Gemini, Anthropic, OpenRouter), optional LegalDataHunter + Vaquill legal research APIs (**OpenSpecter-reported**).
- **Dual tree** — Active UI at repo-root `frontend/`; primary API at `open-specter-main/backend/`; root `backend/server.py` is a **FastAPI proxy** to the Node server (**target-repo-observed**).
- **Workflow library** — Large `builtinWorkflows.ts` in frontend (**24** system workflow ids — **target-repo-observed**); practices include Corporate, Litigation, Finance, Privacy/Data, Real Estate, etc.
- **LLM tools** — Chat backend exposes tools such as **`generate_docx`**, **`read_document`**, **`edit_document`** with system instructions requiring document-grounded answers and citation discipline (**target-repo-observed** in `chatTools.ts`).
- **License** — AGPL-3.0 with distribution/hosting obligations (**target-repo-observed**).
- **Evidence mode** — This capture is **`static_only`** from stdd; no live legal API calls or runtime verification.

---

## Notes for stdd readers

- Claims above are **summary-only** for comparison traceability (open-reported / target-repo-observed as labeled).
- Wave 2 sibling analysis holds the TIED mapping — **reference only**; effectiveness not_measured unless enrolled.
