# JSON slice 2 — build-plan evidence

**Date:** 2026-10-23  
**Parent:** [PLAN-refine-pass2.md](../PLAN-refine-pass2.md) § JSON slice 2  
**REQ:** [REQ-TIED_YAML_CANONICALIZATION](../../../requirements/REQ-TIED_YAML_CANONICALIZATION.yaml)

## Scope delivered

- Added `prettyCanonicalJson()` to [storage-dump.ts](../../../../mcp-server/src/storage-dump.ts) (pretty JSON without trailing newline).
- Migrated MCP main tool surface [tools/index.ts](../../../../mcp-server/src/tools/index.ts) to `prettyCanonicalJson` / `safeStringifyJson`.
- Migrated disk/CLI/hash paths including bounded-composition reports, envelope serialize/normalize/backfill, feature store lock/fingerprints, adherence JSONL, plumb audit, leap proposal queue, source-graph index, and bundled MCP tool modules (context-adaptive, process-certification, JEV, project-operations, etc.).
- Aligned [content-hash.ts](../../../../mcp-server/src/bounded-composition/content-hash.ts) with `stableJsonForHash`.
- Codemod helper: [migrate-json-slice2-safe.py](../../../../mcp-server/scripts/migrate-json-slice2-safe.py).

## Intentional exclusions (~40 files still reference `JSON.stringify`)

- Internal canonicalizer / equality-only paths (`yaml-canonicalizer.ts`, `consistency-validator.ts`).
- Error-message diagnostics (`validation-suite.ts`).
- Codegen embeds (`yaml-client-formatter.ts`).
- HTTP wire payloads (`jev/client.ts`, benchmarks).
- Session-export text extraction (non-storage) in leap proposal queue.

## Tests

- `npx tsx --test src/storage-dump.test.ts src/yaml-canonicalizer.test.ts` — **31 pass, 0 fail** (2026-10-23).
- `npm run build` in `mcp-server/` — **pass**.
- `npm test` in `mcp-server/` — **1757 + 7 pass, 0 fail** (2026-10-23, post hash fixture sync).

## Close-out

**Complete (2026-10-23)** — unified close-out `run_id=close-out-plan-data-file-ordering-slice2-2026-10-23` (`merged_decision.allowed=true`, envelope `blocking_gap_count=0`, reconcile band **A**). Receipt: [closeout-run-close-out-gates-slice2-2026-10-23.json](./closeout-run-close-out-gates-slice2-2026-10-23.json).
