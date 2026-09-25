import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { validateHandoffDocument, validateHandoffYamlFile } from "./handoff-yaml.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W1c schema fixture + reject missing verified_by.

describe("handoff YAML schema v1 [REQ-TIED_DAE_INCORPORATION]", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

  it("accepts program fixture pre_implementation.v1.yaml", () => {
    const fixture = path.join(
      repoRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/handoffs/pre_implementation.v1.yaml",
    );
    const result = validateHandoffYamlFile(fixture);
    assert.equal(result.ok, true);
    assert.equal(result.exit_code, 0);
  });

  it("rejects criterion missing verified_by", () => {
    const result = validateHandoffDocument({
      schema_version: 1,
      request_token: "REQ-X",
      phase: "pre_implementation",
      criteria: [
        {
          id: "x",
          description: "test",
          evidence: {},
        },
      ],
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.includes("verified_by")));
  });
});
