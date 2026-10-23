# Traceable commit evidence — PLAN-DATA-FILE-ORDERING (JSON slice 2)

- **REQ:** [REQ-TIED_YAML_CANONICALIZATION](../../../requirements/REQ-TIED_YAML_CANONICALIZATION.yaml)
- **Plan:** [PLAN-refine-pass2.md](../PLAN-refine-pass2.md) § JSON slice 2
- **Build evidence:** [json-slice2-build-evidence.md](./json-slice2-build-evidence.md)
- **Verify:** `npm test` in `mcp-server/` — 1757 + 7 pass, 0 fail (2026-10-23)
- **Hash churn (RISK-JSON-HASH):** `stableJsonForHash` for EDSE clause hash; `edse-process-spec.v1.yaml` + golden fixture updated
- **Close-out:** slice 1 envelope remains authoritative; slice 2 machine close-out **deferred**
- **Commit SHA:** `6563527323488e74d220dff04287d34402c89dff` (not pushed)
