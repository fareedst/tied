# R2 W2d post–manifest runner — binding evidence

| Field | Value |
| --- | --- |
| Slice | R2 / RISK-DAE-009 |
| Date | 2026-09-24 |
| Integration locus | **`mcp-server/src/quality-evidence-collection.ts`** — after successful manifest build and optional envelope patch, calls **`runOptionalDiffScopedCrapAfterManifest`** from **`mcp-server/src/diff-scoped-crap-hook.ts`**, which composes **`writeDiffScopedCrapReport`** / **`buildDiffScopedCrapReport`** in **`mcp-server/src/diff-scoped-crap.ts`**. |
| MCP surface | **`quality_evidence_collect_manifest`** in **`mcp-server/src/tools/index.ts`** — spreads manifest fields and adds **`diff_scoped_crap_hook`** outcome when hook runs; optional **`diff_scoped_crap_hook`** input overrides envelope-derived context. |
| Default | CITDP **`diff_scoped_crap: false`** — hook returns **`skipped: true`, `reason: diff_scoped_crap_disabled`**. |
| Diff paths | **`listGitDiffPathsInRepo`** (git name-only staged+unstaged) unless hook supplies **`diff_paths`**. |
