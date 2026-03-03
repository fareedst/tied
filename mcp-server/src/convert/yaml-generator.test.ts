/**
 * Unit tests for IMPL YAML record shape (TIED v2.2.0).
 * [IMPL] Validates implementationToYamlRecord output against canonical schema from implementation-decisions.md.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { implementationToYamlRecord } from "./yaml-generator.js";
import type { ParsedImplementationDecision } from "./parser.js";

const STATUS_VALUES = new Set(["Active", "Deprecated", "Template", "Superseded"]);
const DETAIL_FILE = "implementation-decisions/IMPL-TEST.yaml";

function minimalParsedImpl(overrides: Partial<ParsedImplementationDecision> = {}): ParsedImplementationDecision {
  return {
    token: "IMPL-TEST",
    title: "Test Implementation",
    body: "",
    arch_refs: ["ARCH-FOO"],
    req_refs: ["REQ-BAR"],
    ...overrides,
  };
}

describe("implementationToYamlRecord", () => {
  it("returns object with required v2.2.0 top-level keys", () => {
    const record = implementationToYamlRecord(minimalParsedImpl(), DETAIL_FILE);
    const required = [
      "name",
      "status",
      "cross_references",
      "rationale",
      "implementation_approach",
      "code_locations",
      "traceability",
      "related_decisions",
      "detail_file",
      "metadata",
    ];
    for (const key of required) {
      assert(key in record, `missing required key: ${key}`);
    }
  });

  it("status is one of Active, Deprecated, Template, Superseded", () => {
    const record = implementationToYamlRecord(minimalParsedImpl(), DETAIL_FILE);
    assert(STATUS_VALUES.has(record.status as string), `status must be one of ${[...STATUS_VALUES]}, got ${record.status}`);
  });

  it("implementation_approach has only summary and details", () => {
    const record = implementationToYamlRecord(minimalParsedImpl(), DETAIL_FILE);
    const approach = record.implementation_approach as Record<string, unknown>;
    assert(approach !== null && typeof approach === "object");
    assert(typeof approach.summary === "string");
    assert(Array.isArray(approach.details));
    assert(approach.details.every((d: unknown) => typeof d === "string"));
    const keys = Object.keys(approach).sort();
    assert.deepStrictEqual(keys, ["details", "summary"], "implementation_approach must only have summary and details");
  });

  it("code_locations.files is array of objects with path", () => {
    const record = implementationToYamlRecord(minimalParsedImpl(), DETAIL_FILE);
    const codeLocations = record.code_locations as Record<string, unknown>;
    assert(Array.isArray(codeLocations.files));
    for (const entry of codeLocations.files as Array<Record<string, unknown>>) {
      assert(typeof entry === "object" && entry !== null);
      assert("path" in entry && typeof entry.path === "string");
    }
  });

  it("code_locations.functions is array of objects", () => {
    const record = implementationToYamlRecord(minimalParsedImpl(), DETAIL_FILE);
    const codeLocations = record.code_locations as Record<string, unknown>;
    assert(Array.isArray(codeLocations.functions));
  });

  it("related_decisions includes depends_on, supersedes, see_also, composed_with", () => {
    const record = implementationToYamlRecord(minimalParsedImpl(), DETAIL_FILE);
    const related = record.related_decisions as Record<string, unknown>;
    assert(Array.isArray(related.depends_on));
    assert(Array.isArray(related.supersedes));
    assert(Array.isArray(related.see_also));
    assert(Array.isArray(related.composed_with));
  });

  it("rationale has why, problems_solved, benefits", () => {
    const record = implementationToYamlRecord(minimalParsedImpl(), DETAIL_FILE);
    const rationale = record.rationale as Record<string, unknown>;
    assert(typeof rationale.why === "string");
    assert(Array.isArray(rationale.problems_solved));
    assert(Array.isArray(rationale.benefits));
  });

  it("parsed.location produces one file entry with path", () => {
    const record = implementationToYamlRecord(
      minimalParsedImpl({ location: "src/impl.ts" }),
      DETAIL_FILE
    );
    const files = (record.code_locations as Record<string, unknown>).files as Array<Record<string, unknown>>;
    assert.strictEqual(files.length, 1);
    assert.strictEqual(files[0].path, "src/impl.ts");
  });

  it("STDD extra fields appear at root not inside implementation_approach", () => {
    const record = implementationToYamlRecord(
      minimalParsedImpl({
        location: "pkg/foo.ts",
        population: "On success",
        availability: "Always",
      }),
      DETAIL_FILE
    );
    assert.strictEqual(record.location, "pkg/foo.ts");
    assert.strictEqual(record.population, "On success");
    assert.strictEqual(record.availability, "Always");
    const approach = record.implementation_approach as Record<string, unknown>;
    assert(!("location" in approach));
    assert(!("population" in approach));
    assert(!("availability" in approach));
  });

  it("status Implemented is mapped to Active", () => {
    const record = implementationToYamlRecord(minimalParsedImpl({ status: "Implemented" }), DETAIL_FILE);
    assert.strictEqual(record.status, "Active");
  });
});
