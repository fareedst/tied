# Test strategy — EDPC client assessment (Workflow H)

**Authority:** [CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml](./CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml) · **depth_tier:** `integrated` · **gate_policy:** `advisory`

## Module matrix

| Module | IMPL token | RED focus |
| --- | --- | --- |
| Assessment validate | `IMPL-TIED_EDPC_CLIENT_ASSESSMENT` | Missing domain row; illegal tier wording; publish manifest absent; overlay schema; stale `baseline_revision`; unresolved `receipt_refs` without `refresh_gap` |
| Assessment compose | `IMPL-TIED_EDPC_CLIENT_ASSESSMENT` | Deterministic CAM JSON sort; Evidence→Finding→Significance→Action linkage; `consultant_required` gaps; preserves publish `gaps[]`; does not upgrade claim_class; accepts ledger `text` or `statement` (**SC-CAM-LEDGER-FIELDS**) |
| Assessment render | `IMPL-TIED_EDPC_CLIENT_ASSESSMENT` | Golden MD: five outcomes, 20 domains, findings register, meta-assessment, traceability appendix; stable section order; no invented claims |

**Fixtures:** `mcp-server/test/fixtures/edpc/cam/` — charter + overlay minimal; publish manifest + claims rows cloned from Chart Viewer-shaped structure; OFSM D-lite stub (`observation_window_ref: null`).

## Composition

1. Register three MCP tools with existing EDPC tools in `tools/index.ts`.
2. Fixture chain: `client_assessment_validate` → `client_assessment_compose` → `client_assessment_render` using inline JSON only (no repo paths in handlers).

## Regression

```bash
npm test --prefix mcp-server -- src/edpc
npm run lint:ts --prefix mcp-server
```

## Pilot (Chart Viewer)

- **Repo boundary:** `REQ-CHARTVIEWER-BROWNFIELD_EDPC_COMPREHENSION` — handoff paths only; no stdd test depends on live chartviewer checkout.
- **H0:** Manual audit checklist (freshness, receipt lineage) documented in client `evidence/reports/` before narrative draft.
- **H6:** Regenerate via MCP fixtures first; optional diff against hand-authored pilot after sponsor sync.

## Pseudo-code gate

Layer C `pseudocode_validate` with `gate_mode: true` on:

- `tied-project/implementation-decisions/IMPL-TIED_EDPC_CLIENT_ASSESSMENT-pseudocode.md` (new at build-plan)

Before first RED in `client-assessment-*.ts`.

## Integrated inquiry

Identity-bound run_ids: `edpc-cam-pre-impl-20261019`, `edpc-cam-verify-20261019`, `edpc-cam-closeout-20261019`. Platform RED shipped at **`6577f890`** before pre_impl gate allowed — **retroactive** inquiry required before `@plan-close-out` (refine pass 2). Do not reuse Slice D or comprehension v1 inquiry artifacts.
