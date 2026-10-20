/**
 * Unit tests for parseRecordOrYaml and normalizeRecordPayload.
 * [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY]
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeRecordPayload, parseRecordOrYaml } from "./parse-content.js";

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

describe("normalizeRecordPayload", () => {
  const sample = { name: "Test", status: "Planned" };

  it("passes through plain objects", () => {
    const result = normalizeRecordPayload(sample);
    assert.strictEqual(result.ok, true);
    if (result.ok) assert.deepStrictEqual(result.value, sample);
  });

  it("delegates valid JSON strings to parseRecordOrYaml", () => {
    const result = normalizeRecordPayload(JSON.stringify(sample));
    assert.strictEqual(result.ok, true);
    if (result.ok) assert.deepStrictEqual(result.value, sample);
  });

  it("rejects null", () => {
    assert.strictEqual(normalizeRecordPayload(null).ok, false);
  });

  it("rejects arrays", () => {
    assert.strictEqual(normalizeRecordPayload([1]).ok, false);
  });

  it("rejects number primitives", () => {
    assert.strictEqual(normalizeRecordPayload(42).ok, false);
  });

  it("rejects boolean primitives", () => {
    assert.strictEqual(normalizeRecordPayload(true).ok, false);
  });

  it("rejects undefined", () => {
    assert.strictEqual(normalizeRecordPayload(undefined).ok, false);
  });
});
