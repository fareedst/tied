/**
 * [REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE]
 * [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [SC-PMG-11] [SC-PMG-12] [SC-PMG-13]
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  discoverManifestPath,
  proofSubtypeValidationError,
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

  it("rejects coarse proof_facet as proof_subtype on every files[] row [SC-PMG-11] [SC-PMG-12]", () => {
    const manifest = {
      ...minimalManifest("PROMPT-WF-10"),
      files: [
        { path: "src/csv.test.ts", proof_facet: "unit", proof_subtype: "unit" },
        { path: "src/cli.e2e.test.ts", proof_facet: "composition", proof_subtype: "composition" },
      ],
    };
    const v = validateMinManifestShape(manifest, "PROMPT-WF-10");
    assert.equal(v.ok, false);
    const row0 = v.errors?.find((e) => e.code === "FACET_AS_SUBTYPE" && e.message.includes("files[0]"));
    const row1 = v.errors?.find((e) => e.code === "FACET_AS_SUBTYPE" && e.message.includes("files[1]"));
    assert.ok(row0);
    assert.ok(row1);
    assert.match(row1.message, /proof_facet not proof_subtype/);
    assert.equal(proofSubtypeValidationError(0, "unit").code, "FACET_AS_SUBTYPE");
  });

  it("CLI stderr emits taxonomy and MCP DIAGNOSTICs on FACET_AS_SUBTYPE [SC-PMG-13]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-pmg-cli-"));
    try {
      const rel = "tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json";
      const abs = path.join(tmp, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      const manifest = {
        schema_version: "proof-facet-manifest.v1",
        prompt_id: "PROMPT-WF-10",
        proof_boundary: "descriptive only",
        files: [{ path: "src/x.test.ts", proof_facet: "unit", proof_subtype: "unit" }],
      };
      fs.writeFileSync(abs, JSON.stringify(manifest));
      const gateMjs = path.join(path.dirname(fileURLToPath(import.meta.url)), "wf-trial-proof-manifest-gate.mjs");
      let stderr = "";
      try {
        execFileSync(
          process.execPath,
          [gateMjs, "--workspace", tmp, "--wf-id", "WF-10", "--repo-root", REPO_ROOT],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        );
      } catch (e) {
        stderr = e.stderr ?? "";
        assert.notEqual(e.status, 0);
      }
      assert.match(stderr, /proof-test-label-taxonomy\.md/);
      assert.match(stderr, /tied_wf_proof_manifest_validate/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
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
