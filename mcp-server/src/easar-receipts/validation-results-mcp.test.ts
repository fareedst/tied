import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { runEasarValidationSuiteMcp } from "./validation-results-mcp.js";
import { VALIDATION_RESULTS_V1_SCHEMA } from "./validation-results-v1.js";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS]
describe("runEasarValidationSuiteMcp [REQ-TIED_EASAR_RECOVERY]", () => {
  it("writes validation-results.v1 under output path", () => {
    const projectRoot = path.resolve(process.cwd(), "..");
    const casesPath =
      "tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/validation-cases.v1.yaml";
    if (!fs.existsSync(path.join(projectRoot, casesPath))) {
      return;
    }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easar-val-"));
    const result = runEasarValidationSuiteMcp({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      cases_path: casesPath,
      project_root: projectRoot,
      min_cases: 8,
      output_path: path.join(tmp, "validation-results.v1.json"),
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.schema_version, VALIDATION_RESULTS_V1_SCHEMA);
    assert.equal(result.results.pass_count, result.results.tasks.length);
    assert.ok(result.written_path?.includes("validation-results.v1.json"));
  });
});
