# Privacy review — client 1787461685 observation packet

**Scope:** v1 observation artifacts under `working/REQ-DEFERRED_STATS_ROADMAP/v1-observation/`

## Confirmed

- **project_id** is a 16-hex SHA-256 digest (`33f7e345569cd47b`), not a raw filesystem path or configured string.
- **artifact_ref** in report outputs uses basename only (`include_absolute_paths: false`).
- Profile JSON contains `identity_source: path_fallback` on client samples (env `TIED_MCP_PROJECT_ID` unset during collection).
- Committed observation copies contain no API keys, credentials, or personal data.
- Client-scoped metrics JSONL (`tied-mcp-metrics-client-1787461685.jsonl`) contains hashed `project_id`, tool names, duration, and redacted `args_summary` — no raw base paths in committed extract.

## Notes

- External client root path appears only in this observation record metadata, not in committed report YAML/MD (copied from client with basename refs).
- Metrics extract includes `tied-cli` rows (18) from local stdd cross-invocation; primary client tag `1787461685` dominates (67 rows).

**Reviewer:** sponsor  
**Date:** 2026-08-23
