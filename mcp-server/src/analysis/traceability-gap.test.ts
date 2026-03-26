/**
 * Unit tests for traceability gap classification helpers.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  isTestFilePath,
  isMethodologyContentPath,
  mergeTestFileConfig,
} from "./traceability-gap.js";

describe("traceability gap: test file classification", () => {
  it("detects __tests__ paths", () => {
    const cfg = mergeTestFileConfig(undefined);
    assert.strictEqual(isTestFilePath("src/__tests__/foo.ts", cfg), true);
  });

  it("detects .test.ts basename", () => {
    const cfg = mergeTestFileConfig(undefined);
    assert.strictEqual(isTestFilePath("src/foo.test.ts", cfg), true);
  });

  it("treats normal source as non-test", () => {
    const cfg = mergeTestFileConfig(undefined);
    assert.strictEqual(isTestFilePath("src/lib/foo.ts", cfg), false);
  });
});

describe("traceability gap: methodology paths", () => {
  it("detects tied/methodology content", () => {
    assert.strictEqual(isMethodologyContentPath("tied/methodology/requirements/REQ-X.yaml"), true);
  });

  it("allows custom markers", () => {
    assert.strictEqual(
      isMethodologyContentPath("vendor/included/foo.ts", ["vendor/included/"]),
      true
    );
  });
});
