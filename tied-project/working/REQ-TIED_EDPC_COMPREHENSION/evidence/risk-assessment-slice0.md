# Risk assessment — Slice 0 (build-plan)

**Date:** 2026-10-19 · **Ref:** [risk-assessment-refine-pass1.md](./risk-assessment-refine-pass1.md)

| Id | Slice 0 note |
| --- | --- |
| R-EDPC-001 | Access validator shipped in `mcp-server/src/edpc/access-validate.ts`; gate + dogfood envelope still required at close-out. |
| R-EDPC-003 | `easar_full` alias diagnostic in `validateEdpcEngagementFacet`; EASAR receipt tests remain regression target. |
| R-EDPC-002 | Separate claims-ledger vs inquiry ledgers documented in ARCH + vocab. |

**Costly choices (unchanged):** dual engagement fixtures through alias period; no graph DB in v1.
