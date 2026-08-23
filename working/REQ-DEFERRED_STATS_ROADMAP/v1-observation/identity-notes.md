# Identity notes — client 1787461685 bare vs reprofile

## Same stable identity

Both profiles share:

- `identity.project_id`: `33f7e345569cd47b`
- `identity.schema_version`: `evidence-chain-profile.v1`
- `scope.profile_depth`: `integrated`
- Report `compatibility_key`: `evidence-chain-profile.v1|integrated`

`client_alias` differs (`1787461685-bare` vs `1787461685-reprofile`) but is display-only and not part of the duplicate key.

## Identity source

- `identity.identity_source`: `path_fallback` on both profiles (no `TIED_MCP_PROJECT_ID` during client collection).
- Pre/post relocation: if `TIED_MCP_PROJECT_ID` is set to a valid trimmed ID before reprofile, `project_id` would change to the configured hash; this sample intentionally holds env unset so bare and reprofile remain comparable under path fallback.

## v2 driver

Same `compatibility_key` but **incompatible denominators** across bare vs reprofile:

| Field path | Bare | Reprofile |
|---|---|---|
| `evidence_chain.graph` | 1 | 2 |
| `evidence_chain.structural` | 1 | 2 |
| `quality.command_results` | not_measured | 1 |

v1 emits residual risks (report.yaml lines 318–321) but still rolls up statistics under one cohort. Gate III approved v2 sub-cohort partition by `denominator_fingerprint`.

**Date:** 2026-08-23
