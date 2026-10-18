import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { buildEasarClaimMatrixMap } from "./claim-matrix-map-mcp.js";
import { CLAIM_MATRIX_MAP_SCHEMA, deriveClaimIdFromMatrixClaimText } from "./claim-matrix-map.js";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS]
describe("buildEasarClaimMatrixMap MCP [REQ-TIED_EASAR_RECOVERY]", () => {
  it("writes claim-matrix-map.v1 under working evidence path", () => {
    const projectRoot = path.resolve(process.cwd(), "..");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easar-cmm-"));
    const claimId = deriveClaimIdFromMatrixClaimText(
      "validateEasarEngagementFacet rejects easar_full when BFIE mode is report_only",
    );
    const result = buildEasarClaimMatrixMap({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      project_root: projectRoot,
      entries: [{ claim_id: claimId, matrix_row_number: 1 }],
      output_path: path.join(tmp, "claim-matrix-map.v1.json"),
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.schema_version, CLAIM_MATRIX_MAP_SCHEMA);
    assert.equal(result.map.entries[0]?.claim_id, claimId);
    assert.ok(result.written_path?.includes("claim-matrix-map.v1.json"));
    const raw = JSON.parse(fs.readFileSync(path.join(tmp, "claim-matrix-map.v1.json"), "utf8"));
    assert.equal(raw.schema_version, CLAIM_MATRIX_MAP_SCHEMA);
  });
});
