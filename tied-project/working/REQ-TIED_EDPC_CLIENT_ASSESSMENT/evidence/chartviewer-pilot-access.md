# Chart Viewer pilot — sponsor access grant

**Date:** 2026-10-19  
**Repository:** `/Users/fareed/Documents/persante/repos/261016/chartviewer`  
**Engagement REQ:** `REQ-CHARTVIEWER-BROWNFIELD_EDPC_COMPREHENSION`

## Grant

Sponsor authorized agent read/write for **H0** (EDPC authority / receipt audit), **H2** (CAM + technical summary handoff), and related Workflow H pilot work in the Chart Viewer client repository.

## H0 refresh (2026-10-19)

| Check | Result |
| --- | --- |
| Publish manifest `receipt_refs` (18) | All paths exist under chartviewer repo |
| Prior audit | [assessment-audit-2026-10-19.md](file:///Users/fareed/Documents/persante/repos/261016/chartviewer/tied-project/working/REQ-CHARTVIEWER-BROWNFIELD_EDPC_COMPREHENSION/evidence/reports/assessment-audit-2026-10-19.md) |
| Platform validate/compose | `mcp-server/scripts/dogfood-chartviewer-cam.mjs` after `npm run build` |

## H2 artifacts (client repo)

| Artifact | Path |
| --- | --- |
| Charter / context | `evidence/reports/assessment-charter.v1.yaml`, `assessment-context.v1.yaml` |
| Consultant summary | `evidence/reports/technical-summary.v1.md` |
| Handoff copy | `docs/assessments/chartviewer-edpc-assessment-2026-10.md` |
| Manifest | `evidence/reports/assessment-manifest.v1.json` |
| CAM (platform-generated) | `evidence/reports/assessment-model.v1.yaml` |
| Platform render (compare-only) | `evidence/reports/technical-summary-platform-render.v1.md` |

**Note:** The committed consultant narrative in `technical-summary.v1.md` remains the primary handoff; platform render is for **SC-CAM-RENDER** dogfood diff, not a replacement without sponsor review.
