import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { buildEasarInventoryReceipt } from "./inventory-receipt-mcp.js";
import { INVENTORY_V1_SCHEMA } from "./inventory-v1.js";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS]
describe("buildEasarInventoryReceipt MCP [REQ-TIED_EASAR_RECOVERY]", () => {
  it("builds inventory.v1 from walk_summary on mcp-server/src roots", async () => {
    const projectRoot = path.resolve(process.cwd(), "..");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easar-inv-"));
    const outRel = path.join("tmp-evidence", "inventory.v1.json");
    const result = await buildEasarInventoryReceipt({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      project_root: projectRoot,
      baseline_revision: "test-baseline",
      scoped_analysis_run_id: "scoped-test-run-1",
      roots: ["mcp-server/src/easar-receipts"],
      output_path: path.join(tmp, outRel),
      matrix_row_placeholders: ["1"],
    });
    assert.equal(result.ok, true);
    assert.equal(result.schema_version, INVENTORY_V1_SCHEMA);
    assert.ok(result.inventory.files_scanned >= 1);
    assert.ok(result.written_path);
    const raw = JSON.parse(fs.readFileSync(path.join(tmp, outRel), "utf8"));
    assert.equal(raw.content_hash, result.inventory.content_hash);
  });
});
