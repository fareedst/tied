/**
 * [REQ-TIED_METHODOLOGY_BUNDLE_CLOSURE] [REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES] [IMPL-TIED_FILES] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * Minimal-client consistency: empty project indexes + store tied-bundle must validate clean.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";

import { validateConsistency } from "../consistency-validator.js";
import { clearBasePathCache } from "../yaml-loader.js";

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const bundleRoot = path.join(storeRoot, "tied-bundle");

function writeEmptyProjectIndexes(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
  for (const name of [
    "requirements.yaml",
    "architecture-decisions.yaml",
    "implementation-decisions.yaml",
    "semantic-tokens.yaml",
  ]) {
    fs.writeFileSync(path.join(dir, name), "{}\n", "utf8");
  }
}

describe("methodology bundle consistency [REQ-TIED_METHODOLOGY_BUNDLE_CLOSURE]", () => {
  let projectDir: string;
  const prevBase = process.env.TIED_BASE_PATH;
  const prevBundle = process.env.TIED_METHODOLOGY_BUNDLE_PATH;

  beforeEach(() => {
    projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-minimal-client-"));
    writeEmptyProjectIndexes(projectDir);
    process.env.TIED_BASE_PATH = projectDir;
    process.env.TIED_METHODOLOGY_BUNDLE_PATH = bundleRoot;
    clearBasePathCache();
  });

  afterEach(() => {
    if (prevBase === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = prevBase;
    if (prevBundle === undefined) delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
    else process.env.TIED_METHODOLOGY_BUNDLE_PATH = prevBundle;
    clearBasePathCache();
    fs.rmSync(projectDir, { recursive: true, force: true });
  });

  it("validateConsistency ok true for methodology-only client view", () => {
    const report = validateConsistency({
      include_detail_files: true,
      include_pseudocode: true,
    });
    assert.equal(report.ok, true, JSON.stringify(report.detail_files, null, 2));
    for (const detail of Object.values(report.detail_files ?? {})) {
      assert.equal(detail.ref_issues?.length ?? 0, 0, detail.token);
    }
  });

  it("indexes phase-1 QMM and W4 QA stacks in methodology bundle [REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES]", () => {
    const phase1ReqTokens = [
      "REQ-METHODOLOGY-LEARNING-EXPERIMENT",
      "REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING",
      "REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE",
      "REQ-EVIDENCE_CHAIN_REPORT",
      "REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT",
      "REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE",
      "REQ-METHODOLOGY-LEARNING-COHORT-EXPORT",
      "REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES",
    ];
    const reqYaml = fs.readFileSync(path.join(bundleRoot, "requirements.yaml"), "utf8");
    for (const token of phase1ReqTokens) {
      assert.match(reqYaml, new RegExp(`^${token}:`, "m"), `bundle requirements.yaml missing ${token}`);
      assert.ok(
        fs.existsSync(path.join(bundleRoot, "requirements", `${token}.yaml`)),
        `missing detail ${token}.yaml`,
      );
    }
  });
});
