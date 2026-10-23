# phase-4-consumer-fixes — REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE

## Pairing / conformance demo (runtime local root)

- Pinned fixture: `mcp-server/test/fixtures/methodology-pairing/pre_implementation-gate-result.json`
- Helper: `pairing-demo-fixture.ts` → `METHODOLOGY_PAIRING_DEMO_GATE_RECEIPT_PATH` under `tied-bundle/working/…`
- Tests updated: `pairing-gate.test.ts`, `methodology-conformance-effectiveness-pairing.mcp.test.ts` (8/8 pass)
- CITDP demo ref: `tied-project/citdp/CITDP-REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING.yaml` → `tied-bundle/working/…` path

## Install matrix + verify

- `tied-project/working/REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md` — store asymmetric row + committed working row
- `render-install-resource-matrix.mjs` — requires `COMMITTED WORKING REGENERABLE` + `REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE` tokens (`verify-install-matrix-doc` ok)

## Docs / vocab (completed earlier in build)

- WAP classifier + gray zone ([REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE])
- `client-development-index.md` — store-only pointer to matrix row
- `tied-project/vocab/tied-methodology.md` — committed working regenerable profile

## Intentionally not bulk-edited

- Committed checklist/CITDP prose under other REQ trees that still cite `tied-project/working/…/evidence/gate-*` as **historical envelope strings** (on-disk brownfield copies remain; new writes route to `tied-bundle/working/` via classifier)
