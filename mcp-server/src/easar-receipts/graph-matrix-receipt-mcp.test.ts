import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { buildEasarCodeGraphMatrixReceipt } from "./graph-matrix-receipt-mcp.js";
import { CODE_GRAPH_RECEIPT_SCHEMA } from "./graph-matrix-link.js";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS]
describe("buildEasarCodeGraphMatrixReceipt MCP [REQ-TIED_EASAR_RECOVERY]", () => {
  it("binds matrix row 4 to source-graph freshness on store repo", async () => {
    const projectRoot = path.resolve(process.cwd(), "..");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easar-cg-"));
    const outRel = path.join("tmp-evidence", "code-graph-matrix-receipt.v1.json");
    const result = await buildEasarCodeGraphMatrixReceipt({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      project_root: projectRoot,
      repo_root: projectRoot,
      matrix_row_number: 4,
      row: {
        source_type: "code_graph",
        location: "mcp-server/src/source-graph/source-graph-composition.test.ts",
        disposition: "observed",
      },
      graph_freshness_run_id: "easar-sg-freshness-test-slice2",
      graph_trace_id: "n/a-composition-only",
      output_path: path.join(tmp, outRel),
    });
    assert.equal(result.ok, true);
    assert.equal(result.schema_version, CODE_GRAPH_RECEIPT_SCHEMA);
    assert.equal(result.receipt.matrix_row_number, 4);
    assert.equal(result.receipt.graph_freshness_run_id, "easar-sg-freshness-test-slice2");
    assert.ok(result.receipt.index_path?.includes("source-graph-index"));
    assert.ok(result.written_path);
    const raw = JSON.parse(fs.readFileSync(path.join(tmp, outRel), "utf8"));
    assert.equal(raw.schema_version, CODE_GRAPH_RECEIPT_SCHEMA);
    assert.equal(raw.source_type, "code_graph");
  });
});
