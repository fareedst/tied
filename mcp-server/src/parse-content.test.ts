/**
 * Unit tests for parseRecordOrYaml. [IMPL]
 * Verifies JSON and YAML input produce the same record; invalid input returns error.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { parseRecordOrYaml } from "./parse-content.js";

describe("parseRecordOrYaml", () => {
  it("parses valid JSON object", () => {
    const result = parseRecordOrYaml('{"name": "Test", "status": "Planned"}');
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.deepStrictEqual(result.value, { name: "Test", status: "Planned" });
    }
  });

  it("parses valid YAML object", () => {
    const yaml = "name: Test\nstatus: Planned\n";
    const result = parseRecordOrYaml(yaml);
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.deepStrictEqual(result.value, { name: "Test", status: "Planned" });
    }
  });

  it("rejects null", () => {
    const result = parseRecordOrYaml("null");
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.ok(result.error.includes("object"));
  });

  it("rejects array", () => {
    const result = parseRecordOrYaml("[1, 2]");
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.ok(result.error.includes("object"));
  });

  it("rejects invalid JSON and invalid YAML", () => {
    const result = parseRecordOrYaml("not json or yaml {{{");
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.ok(result.error.length > 0);
  });
});
