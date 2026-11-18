/**
 * [REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3] Opt-in implement-complete receipt validator.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { validateEnrolledCloseout } from "./implement-complete-receipt-contract.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const fixturesRoot = path.join(repoRoot, "tools", "bootstrap", "fixtures", "receipt-contract");
const defaultEnrollment = path.join(
  repoRoot,
  "tied-bundle",
  "docs",
  "schemas",
  "implement-complete-receipt-enrollment.v1.json",
);

describe("implement-complete receipt contract [REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3]", () => {
  it("enrolled REQ closed with manifest and handoff references passes", () => {
    const fixtureRoot = path.join(fixturesRoot, "pass-closed");
    const enrollment = path.join(fixtureRoot, "enrollment.v1.json");
    const result = validateEnrolledCloseout(fixtureRoot, enrollment);
    assert.equal(result.ok, true, JSON.stringify(result));
  });

  it("enrolled REQ closed without manifest fails", () => {
    const fixtureRoot = path.join(fixturesRoot, "fail-missing-manifest");
    const enrollment = path.join(fixtureRoot, "enrollment.v1.json");
    const result = validateEnrolledCloseout(fixtureRoot, enrollment);
    assert.equal(result.ok, false);
    assert.ok(result.violations?.length > 0, "expected violations");
  });

  it("non-enrolled REQ closed without manifest is skipped", () => {
    const fixtureRoot = path.join(fixturesRoot, "skip-non-enrolled");
    const enrollment = path.join(fixtureRoot, "enrollment.v1.json");
    const result = validateEnrolledCloseout(fixtureRoot, enrollment);
    assert.equal(result.ok, true, JSON.stringify(result));
  });

  it("open plan_phase passes regardless of manifest", () => {
    const fixtureRoot = path.join(fixturesRoot, "open-plan-phase");
    const enrollment = path.join(fixtureRoot, "enrollment.v1.json");
    const result = validateEnrolledCloseout(fixtureRoot, enrollment);
    assert.equal(result.ok, true, JSON.stringify(result));
  });

  it("default enrollment schema exists and includes HOC REQ", () => {
    assert.ok(fs.existsSync(defaultEnrollment), `missing schema: ${defaultEnrollment}`);
    const parsed = JSON.parse(fs.readFileSync(defaultEnrollment, "utf8"));
    assert.equal(parsed.schemaVersion, "implement-complete-receipt-enrollment.v1");
    assert.ok(
      parsed.enrolled_request_tokens?.includes("REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3"),
    );
  });
});