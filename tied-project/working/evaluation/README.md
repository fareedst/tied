# Store evaluation artifacts (`tied-project/working/evaluation/`)

**Scope:** Operator-local cohort reports and corpus manifests for the TIED **store** repo (`stdd`). Not methodology (`tied-bundle/working/`).

## Envelope gap corpus (G5)

| Artifact | Purpose |
| --- | --- |
| [envelope-corpus-manifest.v1.yaml](./envelope-corpus-manifest.v1.yaml) | One batch row per `tied-project/working/*/evidence/request-evidence-envelope.v1.json` |
| [envelope-corpus-manifest-build-summary.v1.json](./envelope-corpus-manifest-build-summary.v1.json) | Row counts + manifest hash from last manifest build |
| [envelope-gap-report.v1.yaml](./envelope-gap-report.v1.yaml) | Output of `request_evidence_envelope_batch_collect` (gap codes + artifact coverage; **no score field**) |

### Refresh (from repository root)

```bash
# 1) Regenerate manifest from working folders (repository root)
node tools/evaluation/build-envelope-corpus-manifest.mjs

# 2) Rebuild MCP if batch CLI changed
npm run build --prefix mcp-server

# 3) Batch collect — run from mcp-server/; yaml-out is relative to --project-root (repo root)
cd mcp-server
npm run request-evidence-envelope-batch-collect -- \
  --manifest ../tied-project/working/evaluation/envelope-corpus-manifest.v1.yaml \
  --yaml-out tied-project/working/evaluation/envelope-gap-report.v1.yaml \
  --project-root ..
```

MCP equivalent: `request_evidence_envelope_batch_collect` with `manifest_path`, `yaml_out`, `project_root`.

### Privacy tier

- Default **`shareable_hashed`**: envelope paths in the gap report stay repo-relative; suitable for committed store evidence.
- Use **`operator_local`** only when `include_absolute_paths: true` is required for local debugging (do not commit those reports without review).

### Interpretation

- **Advisory only** — full-corpus batch does not gate individual REQ close-outs unless sponsor elevates policy.
- Rows with `envelope_require_mode: require_envelope` and a missing file land in `excluded_rows` with `envelope_missing`.
- `validation_errors` (e.g. legacy `WrongTiedBasePath` on inferred builds) indicate row config or envelope identity mismatch — fix `tied_base_path` / `envelope_artifact` in the manifest generator, not by hand-editing hundreds of rows.

## Other evaluation content

Historical phase-1 reports, validator snapshots, and external client corpora remain under this directory; see [evaluation-corpus.v1.yaml](./evaluation-corpus.v1.yaml) for `/dev/test` cohort rows (separate from store full corpus).
