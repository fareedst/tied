# Slice C — claims-evidence review (Chart Viewer fixture)

**Date:** 2026-10-19  
**Run id:** `edpc-slice-c-chartviewer-cer-20261019`  
**EDPC request:** `REQ-TIED_EDPC_COMPREHENSION`  
**Target repo:** `/Users/fareed/Documents/persante/repos/261016/chartviewer`  
**Source comprehension program:** `REQ-CHARTVIEWER-BROWNFIELD_EASAR_RECOVERY`

## Fixture (frozen claim surface)

| Artifact | Path (on chartviewer) |
| --- | --- |
| Claim surface | `tied-project/working/REQ-CHARTVIEWER-BROWNFIELD_EASAR_RECOVERY/evidence/claim-surface-easar.v1.json` |
| Evidence stubs | `tied-project/working/REQ-CHARTVIEWER-BROWNFIELD_EASAR_RECOVERY/evidence/evidence-stubs.json` |

Four material claims from EASAR slice 3 choreography (AUTH_ORG BBCE, ARCH binding, fidelity gap fid-002, CHART_VIEWING ColdFeed static graph).

## Tool invocation

```bash
tied-cli.sh tied_claims_evidence_review_run '{
  "tied_base_path": "/Users/fareed/Documents/persante/repos/261016/chartviewer/tied-project",
  "project_root": "/Users/fareed/Documents/persante/repos/261016/chartviewer",
  "request_token": "REQ-TIED_EDPC_COMPREHENSION",
  "fixture_root": ".../REQ-CHARTVIEWER-BROWNFIELD_EASAR_RECOVERY/evidence",
  "claim_surface_path": ".../claim-surface-easar.v1.json",
  "output_dir": ".../stdd/tied-project/working/REQ-TIED_EDPC_COMPREHENSION/evidence/claims-evidence-review/slice-c",
  "execution_policy": "static_only",
  "run_id": "edpc-slice-c-chartviewer-cer-20261019"
}'
```

## Result

| Metric | Value |
| --- | --- |
| **ok** | true |
| **shown** | 4 |
| **unsettled** | 0 |
| **not_examined** | 0 |

**Outputs (stdd working root):**

- [claims-evidence-review/slice-c/receipt.v1.json](./claims-evidence-review/slice-c/receipt.v1.json) — EDPC publish cross-ref
- [claim-review-report.v1.json](./claims-evidence-review/slice-c/claim-review-report.v1.json)
- [claim-review-provenance.v1.json](./claims-evidence-review/slice-c/claim-review-provenance.v1.json)
- [claim-review-ledger.v1.jsonl](./claims-evidence-review/slice-c/claim-review-ledger.v1.jsonl)

**Republish:** `tied_edpc_publish_build` → [edpc/edpc-publish-manifest.v1.json](./edpc/edpc-publish-manifest.v1.json) **`gaps: []`**.

## Progression note

Chart Viewer comprehension remains authoritative in its own `tied-project/`; this run **does not mutate** chartviewer YAML. It demonstrates EDPC workflow **C** composing existing brownfield/EASAR claim surfaces on a **separate target** while artifacts land under the TIED store EDPC program folder.
