# IMPL-TIED_EDPC_CLIENT_ASSESSMENT — essence pseudocode

<!-- [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [ARCH-TIED_EDPC_CLIENT_ASSESSMENT_MODEL] [REQ-TIED_EDPC_CLIENT_ASSESSMENT] Workflow H validate/compose/render; pure JSON-in/JSON-out. -->

## MCP_TIED_EDPC_CLIENT_ASSESSMENT_VALIDATE

```
// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [ARCH-TIED_EDPC_CLIENT_ASSESSMENT_MODEL] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
// Validates charter domain matrix, publish manifest presence, tier-legal overlay, receipt freshness hints.

PROCEDURE MCP_TIED_EDPC_CLIENT_ASSESSMENT_VALIDATE(input)
  Contract: JSON charter + publish_manifest in; validation receipt out; no filesystem I/O.
  INPUT: charter, assessment_context, publish_manifest, receipt_exists_map optional
  PRE: charter.schema_version == "edpc-client-assessment-charter.v1"
  PRE: publish_manifest.schema_version == "edpc-publish-manifest.v1"
  POST: ok false when domain count != 20 or duplicate domain_id
  POST: ok false when aggregate trust/health wording in overlay without evidence_refs[]
  POST: ok false when unresolved receipt_refs and no refresh_gap recorded on charter
  EFFECTS: diagnostics[] stable sort
  OUTPUT: { ok, diagnostics }
  RETURN { ok, diagnostics }
```

## MCP_TIED_EDPC_CLIENT_ASSESSMENT_COMPOSE

```
// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
// Builds deterministic CAM v1 from EDPC artifacts; overlay cannot upgrade claim_class.

PROCEDURE MCP_TIED_EDPC_CLIENT_ASSESSMENT_COMPOSE(input)
  Contract: validated EDPC inputs in; CAM v1 + manifest out; overlay cannot upgrade claim_class.
  INPUT: charter, assessment_context, publish_manifest, claims_ledger[], ofsm_bundle optional, edpc_queues optional
  PRE: MCP_TIED_EDPC_CLIENT_ASSESSMENT_VALIDATE.ok
  DATA_TRANSITION: claims_ledger rows -> findings[] with evidence_ids from claim_id; preserve publish gaps[]
  POST: cam.schema_version == "client-assessment-model.v1"
  POST: cam.provenance includes baseline_revision, tier, receipt_refs copy, publish gaps
  POST: consultant_required domains without overlay significance -> explicit gap entries
  FAILURE_MODES: reject compose when validate would fail
  EFFECTS: stable sort findings by finding_id
  OUTPUT: { ok, cam, manifest, diagnostics }
  RETURN { ok, cam, manifest }
```

## MCP_TIED_EDPC_CLIENT_ASSESSMENT_RENDER

```
// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [ARCH-TIED_EDPC_CLIENT_ASSESSMENT_MODEL] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
// Deterministic Markdown projection from CAM; no invented claims.

PROCEDURE MCP_TIED_EDPC_CLIENT_ASSESSMENT_RENDER(cam)
  Contract: CAM v1 in; deterministic Markdown out; fail-closed on blanket health language.
  INPUT: cam client-assessment-model.v1
  PRE: five decision sections and 20 domain rows present
  POST: identical cam -> identical markdown bytes
  POST: no aggregate healthy/trustworthy sentence unless row-level refs in cam
  EFFECTS: sections Understand, Trust, Protect, Change, Decide, Domains, Findings, Meta, Traceability
  OUTPUT: { ok, markdown, diagnostics }
  RETURN { ok, markdown }
```
