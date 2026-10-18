import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

import { VALIDATION_CASES_V1_SCHEMA } from "./validation-cases-v1.js";
import { gradeValidationCase, runEasarValidationSuiteV1 } from "./validation-suite.js";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS]
describe("validation suite [REQ-TIED_EASAR_RECOVERY]", () => {
  const projectRoot = path.resolve(process.cwd(), "..");

  it("grades receipt_field and test_file_assertion on fixtures", () => {
    const receipt = gradeValidationCase(projectRoot, {
      task_id: "inv-schema",
      prompt: "inventory schema",
      grader: "receipt_field",
      inputs: {
        receipt_path:
          "tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/inventory.v1.json",
        field_path: "schema_version",
      },
      expected: { value: "inventory.v1" },
    });
    assert.equal(receipt.pass, true);

    const testFile = gradeValidationCase(projectRoot, {
      task_id: "has-easar-dir",
      prompt: "easar receipts module exists",
      grader: "test_file_assertion",
      inputs: {
        file_path: "mcp-server/src/easar-receipts/inventory-v1.ts",
      },
      expected: { exists: true },
    });
    assert.equal(testFile.pass, true);
  });

  it("runs a two-case suite into validation-results shape", () => {
    const document = {
      schema_version: VALIDATION_CASES_V1_SCHEMA,
      request_token: "REQ-TIED_EASAR_RECOVERY",
      cases: [
        {
          task_id: "reflex-export",
          prompt: "reflexion export_only",
          grader: "receipt_field",
          inputs: {
            receipt_path:
              "tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/reflexion-report.v1.json",
            field_path: "export_only",
          },
          expected: { value: true },
        },
        {
          task_id: "registry-inventory-mcp",
          prompt: "inventory MCP registered",
          grader: "mcp_tool_registry",
          inputs: {},
          expected: { tool_name: "tied_easar_inventory_receipt_build" },
        },
      ],
    };
    const results = runEasarValidationSuiteV1({
      document,
      project_root: projectRoot,
      cases_path: "fixture-cases.yaml",
      git_rev: "test-rev",
      evidence_refs: [],
    });
    assert.equal(results.schema_version, "validation-results.v1");
    assert.equal(results.tasks.length, 2);
    assert.equal(results.fail_count, 0);
    assert.ok(results.content_hash.length > 0);
  });
});
