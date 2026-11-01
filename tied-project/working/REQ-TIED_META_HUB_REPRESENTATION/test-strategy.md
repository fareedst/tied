# Test strategy — REQ-TIED_META_HUB_REPRESENTATION

**Refine pass:** 1 · **2026-11-01** · **RED before production code** per `[PROC-TIED_DEV_CYCLE]`

## Scope

| Module | Location (planned) | Test runner |
| --- | --- | --- |
| CITDP reconcile core | `mcp-server/src/meta-hub-representation/citdp-reconcile.ts` | `mcp-server` vitest |
| Corpus map builder | `mcp-server/src/meta-hub-representation/corpus-map-build.ts` | `mcp-server` vitest |
| CLI wrappers | `tools/meta-hub/*.mjs` | `node --test tools/meta-hub/*.test.mjs` |
| MCP registration | `mcp-server/src/tools/project-operations-mcp.ts` (or dedicated module) | `project-operations-mcp.test.ts` |

## RED fixtures (Slice 1 — reconcile)

Fixture tree under `mcp-server/fixtures/meta-hub-reconcile/`:

| Case | Setup | Expected classification |
| --- | --- | --- |
| `pair-identical` | Working + citdp same SHA | `identical` → delete working on apply |
| `pair-working-newer` | Same basename, working mtime/content newer | `working_newer` → citdp overwrite on apply |
| `pair-canonical-newer` | Canonical mtime/content newer | `canonical_newer` → delete working on apply |
| `pair-conflict` | Same basename, both differ, tie on mtime | `structural_conflict` → **no apply** without `force_disposition` |
| `working-slice-only` | `CITDP-REQ-FOO-sliceS.yaml` in working, no citdp basename | `working_only` → persist to citdp **or** `keep_working` per policy table |

Assertions:

- Ledger YAML schema `citdp-reconcile-ledger.v1` lists every input path with `disposition`, `action`, `sha256_before`.
- Dry-run never mutates disk (tempdir tests).
- Apply uses `writeCanonicalValueAtomic` / `citdp_record_write` path for citdp writes (canonical profile).

## RED fixtures (Slice 2 — corpus map)

Mini hub under fixture: indexes stub, 2 working folders, 1 citdp file.

- Output contains required sections from [edpc-meta-hub-engagement.md](../../../tied-bundle/docs/edpc-meta-hub-engagement.md) §4 (Layers, Agent entry points, Authority rules).
- Scale counts are **Derived** from walk (not hard-coded 247).

## MCP contract tests (Slice 3)

- `tied_citdp_reconcile_run` with `dry_run: true` returns ledger path + row count.
- `tied_corpus_map_build` writes markdown to `out_path`.
- Tools **fail closed** when `hub_path` does not contain `tied-project`.

## Dogfood acceptance (Slice 4)

| Check | Command / tool | Pass |
| --- | --- | --- |
| 35 divergent rows processed | Reconcile dry-run against store | Ledger row count ≥ 35 divergent baselines from [citdp-dedupe-log.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/citdp-dedupe-log.md) § Kept |
| No silent conflict apply | Apply only after zero `structural_conflict` or explicit dispositions | Manual review + git diff |
| Envelope refresh | `build-envelope-corpus-manifest.mjs` + batch collect | Receipt under `evidence/receipts/` |
| EDPC publish | `tied_edpc_publish_build` | Manifest committed; G7 may remain by design |
| Regression | `cd mcp-server && npm test` | Green |

## Out of scope for tests

- Full store `tied_validate_consistency` with all legacy debt (note in handoff only).
- Batch `tied_verify` for all REQs.

## Security / mutation boundary

- Reconcile apply must **not** write `requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, or `semantic-tokens.yaml` except via normal Slice 0 enrollment.
- CITDP writes limited to `tied-project/citdp/` and deletions under `tied-project/working/**/CITDP-*.yaml` per ledger.
