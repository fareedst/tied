/**
 * Unit tests for traceability gap classification helpers.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  buildTraceabilityGapReport,
  isTestFilePath,
  isMethodologyContentPath,
  mergeTestFileConfig,
} from "./traceability-gap.js";

describe("traceability gap: test file classification [REQ-QUALITY_ASSURANCE_EVIDENCE]", () => {
  it("detects __tests__ paths", () => {
    const cfg = mergeTestFileConfig(undefined);
    assert.strictEqual(isTestFilePath("src/__tests__/foo.ts", cfg), true);
  });

  it("detects .test.ts basename", () => {
    const cfg = mergeTestFileConfig(undefined);
    assert.strictEqual(isTestFilePath("src/foo.test.ts", cfg), true);
  });

  it("detects Go and Ruby test naming conventions", () => {
    const cfg = mergeTestFileConfig(undefined);
    assert.strictEqual(isTestFilePath("pipeline/build_test.go", cfg), true);
    assert.strictEqual(isTestFilePath("lib/parser_test.rb", cfg), true);
  });

  it("classifies the pilot .mjs test and reports no scoped quality gaps", () => {
    // [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Include JavaScript-module pilot tests in scoped traceability evidence.
    const report = buildTraceabilityGapReport({
      projectRoot: process.cwd(),
      perFile: [
        {
          relPosix: "pilot/webhook-inbox/test/webhook-inbox.test.mjs",
          tokens: {
            REQ: ["REQ-QUALITY_ASSURANCE_EVIDENCE"],
            ARCH: ["ARCH-QUALITY_ASSURANCE_PROFILES"],
            IMPL: ["IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK"],
          },
        },
        {
          relPosix: "mcp-server/src/analysis/pseudocode-validator.test.ts",
          tokens: {
            REQ: ["REQ-QUALITY_ASSURANCE_EVIDENCE"],
            ARCH: ["ARCH-QUALITY_ASSURANCE_PROFILES"],
            IMPL: ["IMPL-QUALITY_PSEUDOCODE_VALIDATOR"],
          },
        },
        {
          relPosix: "mcp-server/src/quality-evidence.ts",
          tokens: {
            REQ: ["REQ-QUALITY_ASSURANCE_EVIDENCE"],
            ARCH: ["ARCH-QUALITY_ASSURANCE_PROFILES"],
            IMPL: [],
          },
        },
      ],
      projectConfig: {
        dimensions: {
          req_without_test: true,
          req_without_implementation: true,
          impl_without_test: true,
        },
        strict: true,
      },
      requirementTokens: ["REQ-QUALITY_ASSURANCE_EVIDENCE"],
      implementationTokens: ["IMPL-QUALITY_PSEUDOCODE_VALIDATOR"],
      semanticTokenSet: new Set([
        "REQ-QUALITY_ASSURANCE_EVIDENCE",
        "ARCH-QUALITY_ASSURANCE_PROFILES",
        "IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK",
        "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
      ]),
      discoveredTokensFlat: [
        "REQ-QUALITY_ASSURANCE_EVIDENCE",
        "ARCH-QUALITY_ASSURANCE_PROFILES",
        "IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK",
        "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
      ],
      methodology_only_requirements: [],
      methodology_only_implementation: [],
    });

    assert.equal(report.dimensions.req_without_test.count, 0);
    assert.equal(report.dimensions.req_without_implementation.count, 0);
    assert.equal(report.dimensions.impl_without_test.count, 0);
    assert.equal(report.exit_policy.suggested_exit_code, 0);
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
