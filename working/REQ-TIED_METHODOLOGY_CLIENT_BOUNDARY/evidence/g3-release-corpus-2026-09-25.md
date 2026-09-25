# G3 release corpus evidence — methodology bundle pack

| Field | Value |
| --- | --- |
| REQ | REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY |
| Slice | build-plan G3 |
| Date | 2026-09-25 |
| depth_tier | minimal |
| TIED_BASE_PATH (MCP) | `/Users/fareed/Documents/dev/chatgpt/stdd/tied` |

## pre_implementation gate

```text
tied gate check --request-token REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY --phase pre_implementation
allowed: true, exit_code: 0
tracker: working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/checklist-tracker.yaml
citdp: tied/citdp/CITDP-REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml
```

## Tests (RED → GREEN)

Commands:

```bash
cd mcp-server
npm run build
node --test dist/methodology-bundle-pack.test.js dist/bundled-methodology-read.test.js
node --test test/tied-cli-bundled-methodology-pilot.test.cjs
npm run methodology-bundle:pack
npm test
```

Result: all pass (full `npm test` green after G3 addition).

## verification gate

```text
tied gate check phase=verification
allowed: true, exit_code: 0
```

## tied_validate_consistency

`ok: true` (post-change).

## Artifacts

- `mcp-server/src/methodology-bundle-pack.ts` — pack + manifest validation
- `mcp-server/src/cli/methodology-bundle-pack.ts` — release CLI
- `mcp-server/src/methodology-bundle-pack.test.ts`
- `npm run methodology-bundle:pack` in `mcp-server/package.json`
- `mcp-server/methodology-bundle/README.md` — operator layout (`corpus/` + manifest)
- `.gitignore` excludes generated `corpus/` and manifest from git
