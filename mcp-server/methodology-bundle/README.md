# MCP methodology bundle (release artifact)

[REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] Phase B pins inherited methodology YAML beside **`@tied/mcp`** for release. Client projects keep a copied tree at `tied/methodology/` refreshed via `./copy_files.sh`. **G4 (2026-09-25):** offline/air-gapped cohorts stay on that path; bundled read is optional — see [offline runbook](../../tied/docs/methodology-client-boundary-offline-runbook.md) and migration gates in `working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/PLAN.md`.

## Layout (G3)

| Path | Role |
| --- | --- |
| `corpus/` | Flat copy of repo `tied/methodology/` (runtime bundle root). Gitignored; populated by pack. |
| `methodology-bundle-manifest.v1.json` | Pinned `@tied/mcp` version, corpus hash, per-file digests. Gitignored when generated locally. |

**Runtime:** set `TIED_METHODOLOGY_BUNDLE_PATH` to the **corpus directory** (same layout as `tied/methodology/`, not the parent `tied/` folder). Methodology **reads** use the bundle when the env var is set; **writes** remain project-only via `detail-loader` / `yaml-loader`.

## Pack (release / CI)

From `mcp-server/` after `npm run build`:

```bash
npm run methodology-bundle:pack
```

This copies `../tied/methodology/` into `methodology-bundle/corpus/` and writes `methodology-bundle-manifest.v1.json`. Options: `node dist/cli/methodology-bundle-pack.js --help`.

**CI:** `npm test` includes `dist/methodology-bundle-pack.test.js` (pack to a temp dir from the real repo corpus). G1/G2 parity tests remain in `dist/bundled-methodology-read.test.js` and `test/tied-cli-bundled-methodology-pilot.test.cjs`.

**Release operator (no dedicated publish workflow in-repo):**

1. `cd mcp-server && npm run build && npm run methodology-bundle:pack`
2. Ship `methodology-bundle/corpus/` + `methodology-bundle-manifest.v1.json` beside the `@tied/mcp` artifact (or tarball the `methodology-bundle/` directory).
3. On clients, `export TIED_METHODOLOGY_BUNDLE_PATH=/path/to/corpus` (see G2 pilot below).

### G2 pilot (bundle-only client)

A client may omit `tied/methodology/` on disk when the bundle env points at a corpus with the usual methodology layout:

```bash
export TIED_BASE_PATH=/abs/path/to/client/tied
export TIED_METHODOLOGY_BUNDLE_PATH=/abs/path/to/methodology-bundle/corpus
export TIED_MCP_BIN=/abs/path/to/mcp-server/dist/index.js
tools/bundled-tied-yaml-skill/scripts/tied-cli.sh yaml_detail_read '{"token":"REQ-TIED_SETUP"}'
```

Automated parity: `mcp-server/test/tied-cli-bundled-methodology-pilot.test.cjs` (migration gate G2).

G1–G4 migration gates are **Met** on PLAN (2026-09-25); do not remove the copied tree org-wide — bundle pilot remains opt-in per offline runbook.
