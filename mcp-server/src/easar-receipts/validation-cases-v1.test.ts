import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  VALIDATION_CASES_V1_SCHEMA,
  VALIDATION_GRADERS,
  parseValidationCasesYaml,
  validateValidationCasesDocument,
} from "./validation-cases-v1.js";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS]
describe("validation-cases.v1 [REQ-TIED_EASAR_RECOVERY]", () => {
  it("rejects invalid grader", () => {
    const result = validateValidationCasesDocument({
      schema_version: VALIDATION_CASES_V1_SCHEMA,
      request_token: "REQ-TIED_EASAR_RECOVERY",
      cases: [
        {
          task_id: "t1",
          prompt: "p",
          grader: "llm_judge",
          inputs: {},
          expected: {},
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "invalid_grader");
  });

  it("accepts all grader enum values", () => {
    for (const grader of VALIDATION_GRADERS) {
      const result = validateValidationCasesDocument({
        schema_version: VALIDATION_CASES_V1_SCHEMA,
        request_token: "REQ-TIED_EASAR_RECOVERY",
        cases: [
          {
            task_id: `t-${grader}`,
            prompt: "p",
            grader,
            inputs: {},
            expected: {},
          },
        ],
      });
      assert.equal(result.ok, true);
    }
  });

  it("enforces minimum case count", () => {
    const yaml = `
schema_version: validation-cases.v1
request_token: REQ-TIED_EASAR_RECOVERY
cases:
  - task_id: only-one
    prompt: p
    grader: symbol_ref
    inputs: { file_path: "a.ts" }
    expected: { symbol: "foo" }
`;
    const result = parseValidationCasesYaml(yaml, { min_cases: 8 });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "insufficient_cases");
  });
});
