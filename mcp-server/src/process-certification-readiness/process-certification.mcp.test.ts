/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] MCP tool registration
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allTools } from "../tools/index.js";

const EXPECTED = [
  "tied_certification_spec_validate",
  "tied_certification_conformance_evaluate",
  "tied_certification_capability_evaluate",
  "tied_certification_independent_assess",
  "tied_certification_adaptive_experiment_run",
  "tied_certification_readiness_report_compose",
  "tied_certification_assessor_pack_generate",
];

describe("process-certification MCP tools [REQ-TIED_PROCESS_CERTIFICATION_READINESS]", () => {
  it("registers seven tied_certification_* tools", () => {
    const names = new Set(allTools.map((t) => t.name));
    for (const name of EXPECTED) {
      assert.ok(names.has(name), `missing ${name}`);
    }
  });
});
