# Target repo receipt — Open Specter

**Receipt kind:** static_only (no install, no API keys, no test run)  
**Observed:** 2026-11-17  
**Workspace path:** `/Users/fareed/Documents/dev/legal/OpenSpecter`

| Field | Value |
| --- | --- |
| **Remote** | `https://github.com/QuanteraAI/OpenSpecter` |
| **HEAD** | `b29bdf9e6ad99af7cefa61543b254e7d08d352b6` |
| **License** | AGPL-3.0 (**target-repo-observed** in `LICENSE`) |
| **Maintainer** | Quantera.ai (**OpenSpecter-reported** in README) |

## Layout note (dual tree)

| Role | Path | Notes |
| --- | --- | --- |
| Active Next.js UI | `frontend/` | Primary App Router tree used for static capture |
| Express API | `open-specter-main/backend/` | Routes mounted at `/chat`, `/tabular-review`, `/workflows`, `/legal-data`, `/vaquill`, etc. |
| FastAPI proxy | `backend/server.py` | Proxies to Node on `OPEN_SPECTER_NODE_BACKEND_PORT` (default 3001) — **target-repo-observed** |
| Nested snapshot | `open-specter-main/frontend/` | Present; not used as primary UI unless parity gap noted |
| Schema | `supabase_open_specter_schema.sql`, `open-specter-main/backend/migrations/` | RLS + core tables |
| Supabase functions | `supabase/functions/cleanup-anonymous-users/` | Guest cleanup — **target-repo-observed** |

## Key evidence paths read

- `README.md`, `SECURITY.md`, `design_guidelines.md`
- `frontend/src/app/components/workflows/builtinWorkflows.ts` (~2289 lines; **24** `builtin-*` workflow ids — **target-repo-observed** count)
- `frontend/src/app/lib/legalDataApi.ts`
- `open-specter-main/backend/src/index.ts`, `src/lib/chatTools.ts` (system prompt + tool schemas)
- `open-specter-main/backend/src/routes/legalData.ts`, `vaquill.ts`

## Fork lineage

Open Specter fork of **Mike** (`willchen96/mike`, AGPL) — **OpenSpecter-reported** in root README.

## Proof boundary

This receipt does not assert legal citation accuracy, research API completeness, or runtime health. No `yarn dev` or Supabase apply was run from stdd.