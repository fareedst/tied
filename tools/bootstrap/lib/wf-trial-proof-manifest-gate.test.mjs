/**
 * [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  discoverManifestPath,
  runProofManifestGate,
  validateMinManifestShape,
} from "./wf-trial-proof-manifest-gate.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function minimalManifest(promptId) {
  return {
    schema_version: "proof-facet-manifest.v1",
    prompt_id: promptId,
    proof_boundary: "descriptive only",
    files: [{ path: "src/alpha.test.ts", proof_facet: "unit", proof_subtype: "unit.default" }],
  };
}

describe("wf-trial-proof-manifest-gate.mjs", () => {
  it("validateMinManifestShape accepts minimal row [SC-RPM-05]", () => {
    const v = validateMinManifestShape(minimalManifest("PROMPT-WF-03"), "PROMPT-WF-03");
    assert.equal(v.ok, true);
  });

  it("rejects prompt_id mismatch", () => {
    const v = validateMinManifestShape(minimalManifest("PROMPT-WF-09"), "PROMPT-WF-03");
    assert.equal(v.ok, false);
  });

  it("runProofManifestGate missing manifest fails [SC-RPM-02]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-rpm-gate-"));
  try {
      const r = runProofManifestGate({ workspace: tmp, wfId: "WF-03", repoRoot: REPO_ROOT });
      assert.equal(r.ok, false);
      assert.equal(r.errors?.[0]?.code, "MANIFEST_MISSING");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("runProofManifestGate valid primary path passes [SC-RPM-05]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-rpm-gate-"));
    try {
      const rel = "tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json";
      const abs = path.join(tmp, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.mkdirSync(path.join(tmp, "src"), { recursive: true });
      fs.writeFileSync(path.join(tmp, "src/alpha.test.ts"), "// stub\n");
      fs.writeFileSync(abs, JSON.stringify(minimalManifest("PROMPT-WF-10")));
      assert.equal(discoverManifestPath(tmp), rel);
      const r = runProofManifestGate({ workspace: tmp, wfId: "WF-10", repoRoot: REPO_ROOT });
      assert.equal(r.ok, true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("runProofManifestGate FILE_EXISTS fails when path missing [SC-RPM-09]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-rpm-gate-"));
    try {
      const rel = "tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json";
      const abs = path.join(tmp, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, JSON.stringify(minimalManifest("PROMPT-WF-10")));
      const r = runProofManifestGate({ workspace: tmp, wfId: "WF-10", repoRoot: REPO_ROOT });
      assert.equal(r.ok, false);
      assert.ok(r.errors?.some((e) => e.code === "FILE_EXISTS"));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("runProofManifestGate FILE_COVERAGE fails when manifest rows < test files [SC-RPM-10]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-rpm-gate-"));
    try {
      const rel = "tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json";
      const abs = path.join(tmp, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      const testDir = path.join(tmp, "src");
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, "a.test.ts"), "// stub\n");
      fs.writeFileSync(path.join(testDir, "b.test.ts"), "// stub\n");
      const manifest = minimalManifest("PROMPT-WF-10");
      manifest.files = [
        { path: "src/a.test.ts", proof_facet: "unit", proof_subtype: "unit.default" },
      ];
      fs.writeFileSync(abs, JSON.stringify(manifest));
      const r = runProofManifestGate({ workspace: tmp, wfId: "WF-10", repoRoot: REPO_ROOT });
      assert.equal(r.ok, false);
      assert.ok(r.errors?.some((e) => e.code === "FILE_COVERAGE"));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("runProofManifestGate passes when files exist and coverage matches [SC-RPM-09/10]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-rpm-gate-"));
    try {
      const rel = "tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json";
      const abs = path.join(tmp, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      const testDir = path.join(tmp, "src");
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, "a.test.ts"), "// stub\n");
      const manifest = minimalManifest("PROMPT-WF-10");
      manifest.files = [
        { path: "src/a.test.ts", proof_facet: "unit", proof_subtype: "unit.default" },
      ];
      fs.writeFileSync(abs, JSON.stringify(manifest));
      const r = runProofManifestGate({ workspace: tmp, wfId: "WF-10", repoRoot: REPO_ROOT });
      assert.equal(r.ok, true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
