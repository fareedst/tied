# Session handoff — G7 verify/status boundary

**Date:** 2026-10-31  
**Plan:** `PLAN-EDPC-VERIFY-STATUS-BOUNDARY`  
**Gap:** `comprehension:req_implementation_status_requires_tied_verify`

---

## Delivered

| Item | Path |
| --- | --- |
| Sponsor corpus map | [tied-project-corpus-map.md](../../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/tied-project-corpus-map.md) — REQ status + claims ledger rules |
| Workflow hub | [docs/stdd-workflows.md](../../../../docs/stdd-workflows.md) — Verification gaps § implementation status |
| Vocab `[PROC-EDPC_COMPREHENSION]` | [edpc-comprehension.md](../../../vocab/edpc-comprehension.md) |
| Methodology | [EDPC_Methodology_and_Workflows.md](../../../../tied-bundle/docs/EDPC_Methodology_and_Workflows.md) |
| Publish builder | `COMPREHENSION_REQ_STATUS_GAP` always in `buildEdpcPublishManifest` |
| CAM render footnote | [client-assessment-render.ts](../../../../mcp-server/src/edpc/client-assessment-render.ts) |

**Tests:** `publish-build.test.ts`, `client-assessment-render.test.ts`

---

## Not done

- EDPC publish manifest on disk may still list G7 among other manual backlog gaps until republish via `tied_edpc_publish_build`.
- Traceable commit — sponsor request.

---

## Non-goals (unchanged)

- Batch `tied_verify` for all REQs during comprehension.
