# Open Specter — legal AI workspace (read-only capture)

| Field | Value |
| --- | --- |
| **Source** | [QuanteraAI/OpenSpecter](https://github.com/QuanteraAI/OpenSpecter) (AGPL-3.0) · local path `/Users/fareed/Documents/dev/legal/OpenSpecter` @ `b29bdf9e` |
| **Maintainer** | Quantera.ai (**OpenSpecter-reported**) |
| **Fork lineage** | [Mike](https://github.com/willchen96/mike) / [mikeoss.com](https://mikeoss.com/) (**OpenSpecter-reported**) |
| **Purpose** | Read-only repository summary for comparison and architecture reference — **external content**; this document does not mint REQ/ARCH/IMPL tokens. |
| **Captured** | 2026-11-17 |
| **Analysis (sibling)** | [open-specter-legal-workspace-vs-tied-agent-management.md](open-specter-legal-workspace-vs-tied-agent-management.md) |
| **Plan (non-tied)** | [PLAN.md](../../tied-project/non-tied-plans/open-specter-legal-workspace-vs-tied/PLAN.md) |

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

## What it is

Open Specter is an **enterprise-style AI workspace for legal professionals**: organize matters, run AI-assisted review over client documents, extract structured answers in tables, and reuse prompt templates tagged by legal practice area. It is **not** an IDE agent methodology; it is a **hosted legal application** operators self-deploy with their own Supabase, storage, and AI keys.

Quantera’s README emphasizes additions over the Mike fork: grayscale enterprise UI, guest/anonymous auth with cleanup, **10+** additional legal workflow templates, and **LegalDataHunter** integration for jurisdiction-scoped case law and legislation with inline citations across **178** jurisdictions (**OpenSpecter-reported**).

---

## Repository layout (operator-relevant)

| Layer | Location | Role |
| --- | --- | --- |
| UI | `frontend/src/app/` | Next.js App Router — assistant, projects, tabular reviews, workflows |
| API | `open-specter-main/backend/src/` | Express routers: `chat`, `projects`, `documents`, `tabular`, `workflows`, `legal-data`, `vaquill`, `activity`, `download` |
| Proxy | `backend/server.py` | FastAPI forwarder to Node (`OPEN_SPECTER_NODE_BACKEND_PORT`, default 3001) |
| DB | `supabase_open_specter_schema.sql`, `open-specter-main/backend/migrations/` | `projects`, `documents`, `document_versions`, `chats`, `tabular_reviews`, `workflows`, RLS |
| Edge | `supabase/functions/cleanup-anonymous-users/` | Scheduled cleanup for orphaned anonymous users (**OpenSpecter-reported** / **target-repo-observed** path) |
| Design system | `design_guidelines.md` | Monochrome, Space Grotesk + Inter, `data-testid` on interactive elements (**target-repo-observed**) |

Nested `open-specter-main/frontend/` exists; stdd capture treats **root `frontend/`** as authoritative unless a future diff documents drift.

---

## Core product surfaces

### Projects and documents

- **Projects** group documents by matter, client, or workflow (**OpenSpecter-reported**).
- **Document management** supports uploads, **versioning**, and parsing/conversion (LibreOffice for DOC/DOCX — **OpenSpecter-reported**).
- **Sharing** uses `shared_with` on projects and `workflow_shares` (**OpenSpecter-reported** in nested README RLS section).

### Assistant chat

- Context from selected project documents; model selection across configured providers.
- Backend **system prompt** defines Open Specter as a legal assistant with **document citation instructions** and rules for when to use **`generate_docx`** vs **`edit_document`** (**target-repo-observed** in `chatTools.ts`).
- UI: `cite-button`, quote highlighting components (**target-repo-observed**).

### Tabular reviews

- Column-oriented prompts over a document set; formats include text, date, bulleted lists (`columnFormat.ts`, `columnPresets.ts`).
- Cells carry summaries, flags, reasoning, and **citation** fields in API/types (**target-repo-observed**).
- Export to Excel supported in UI utilities (**target-repo-observed**).

### Workflows

- Types: **`assistant`** (single prompt chain) and **`tabular`** (`columns_config` + `prompt_md`) (**target-repo-observed**).
- **Built-in workflows** live in `frontend/src/app/components/workflows/builtinWorkflows.ts` (~2289 lines).
- **Examples (target-repo-observed, abbreviated):**
  - `builtin-cp-checklist` — Conditions Precedent checklist; requires **`generate_docx`** with **`landscape: true`**.
  - `builtin-coc-dd` — Change of control due diligence **tabular** with parties, dates, CoC clauses, consent, termination, put/call columns.
- Users can create, share, hide workflows via REST API (`openSpecterApi.ts`).

### Legal research integrations

- **LegalDataHunter** — countries, search hits, namespaces (**target-repo-observed** in `legalDataApi.ts` + `/legal-data` routes).
- **Vaquill** — US primary law and Indian case law routes (**OpenSpecter-reported** in README; `vaquill.ts` route).
- Boot log in `index.ts` notes each paid API requires **operator-owned keys** — no shared upstream fallback (**target-repo-observed**).

---

## Security and compliance posture (product-level)

`SECURITY.md` describes private disclosure (`security@quantera.ai`), coordinated disclosure timelines, and production hardening themes for legal-sensitive data (**OpenSpecter-reported**). This capture does **not** audit deployment security.

---

## Configuration (summary)

Standard pattern: `backend/.env` + `frontend/.env.local` with Supabase URLs/keys, optional R2, AI provider keys, research API keys (**OpenSpecter-reported** in README). Health endpoint: `GET /health` → `{"ok":true}`.

---

## Fork credits and license

- **Mike** upstream under AGPL; Open Specter retains AGPL-3.0 with copyright Quantera.ai (**target-repo-observed**).
- TIED methodology does **not** embed or distribute Open Specter as part of `tied-install.sh`.

---

## Notes for stdd readers

- **Proof boundary:** Vendor/README claims are **OpenSpecter-reported** unless re-observed in the cloned tree (**target-repo-observed**). Legal accuracy, citation correctness, and research completeness are **`not_measured`** in this wave.
- **Comparison:** Wave 2 maps product patterns to TIED harness and proof surfaces — [sibling analysis](open-specter-legal-workspace-vs-tied-agent-management.md).
- **Execution:** stdd did **not** run Open Specter locally, call legal APIs, or execute Supabase migrations during capture.
- **No token mint:** This file does not create or modify `[REQ-*]` / `[ARCH-*]` / `[IMPL-*]` records.