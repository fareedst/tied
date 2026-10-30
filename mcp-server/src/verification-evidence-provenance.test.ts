/**
 * [REQ-TIED_VERIFICATION_EVIDENCE_PROVENANCE] [IMPL-TIED_VERIFICATION_EVIDENCE_PROVENANCE]
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  isVerifyManifestProvenanceEnforced,
  validateVerifyManifestProvenance,
} from "./verification-evidence-provenance.js";
import { clearBasePathCache } from "./yaml-loader.js";

beforeEach(() => {
  clearBasePathCache();
});

function tempTiedProject(configBody: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-prov-root-"));
  const tied = path.join(root, "tied-project");
  fs.mkdirSync(tied, { recursive: true });
  fs.writeFileSync(path.join(tied, "config.yaml"), configBody, "utf8");
  fs.writeFileSync(path.join(tied, "requirements.yaml"), "{}\n", "utf8");
  return tied;
}

function writeMinimalManifest(
  dir: string,
  coveredTokens: string[],
  opts?: { commit?: string; failedCommand?: boolean },
): string {
  const manifestPath = path.join(dir, "verification-evidence-manifest.v1.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({
      schema_version: "verification-evidence-manifest.v1",
      run_id: "test-run",
      commit: opts?.commit ?? "deadbeef",
      environment: {},
      command_results: [
        {
          id: "unit",
          command: "npm test",
          cwd: dir,
          exit_code: opts?.failedCommand ? 1 : 0,
          result: opts?.failedCommand ? "failed" : "passed",
        },
      ],
      quality_rows: [],
      covered_tokens: coveredTokens,
      proof_boundaries: [],
      human_decisions: { stored_separately: true, references: [] },
    }),
    "utf8",
  );
  return manifestPath;
}

describe("validateVerifyManifestProvenance", () => {
  it("allows promotion when manifest covers passed tokens", () => {
    const tiedBase = tempTiedProject(
      "schema: tied-project-config.v1\nyaml:\n  scalar_style: wrapped\n",
    );
    const manifestPath = writeMinimalManifest(tiedBase, ["REQ-ONE", "IMPL-ONE"]);
    try {
      const result = validateVerifyManifestProvenance({
        tiedBasePath: tiedBase,
        verificationManifestPath: manifestPath,
        passedRequirementTokens: ["REQ-ONE"],
        passedImplTokens: ["IMPL-ONE"],
      });
      assert.equal(result.ok, true);
    } finally {
      fs.rmSync(path.dirname(tiedBase), { recursive: true });
    }
  });

  it("rejects fabricated pass tokens not in manifest covered_tokens (CASE-002)", () => {
    const tiedBase = tempTiedProject(
      "schema: tied-project-config.v1\nyaml:\n  scalar_style: wrapped\n",
    );
    const manifestPath = writeMinimalManifest(tiedBase, ["REQ-ONE"]);
    try {
      const result = validateVerifyManifestProvenance({
        tiedBasePath: tiedBase,
        verificationManifestPath: manifestPath,
        passedRequirementTokens: ["REQ-FABRICATED"],
        passedImplTokens: [],
      });
      assert.equal(result.ok, false);
      assert.ok(result.diagnostics.some((d) => d.startsWith("untrusted_pass_token:")));
    } finally {
      fs.rmSync(path.dirname(tiedBase), { recursive: true });
    }
  });

  it("rejects stale manifest when currentCommit disagrees (CASE-005)", () => {
    const tiedBase = tempTiedProject(
      "schema: tied-project-config.v1\nyaml:\n  scalar_style: wrapped\n",
    );
    const manifestPath = writeMinimalManifest(tiedBase, ["REQ-ONE"], { commit: "oldcommit" });
    try {
      const result = validateVerifyManifestProvenance({
        tiedBasePath: tiedBase,
        verificationManifestPath: manifestPath,
        passedRequirementTokens: ["REQ-ONE"],
        passedImplTokens: [],
        currentCommit: "newcommit",
      });
      assert.equal(result.ok, false);
      assert.ok(result.diagnostics.includes("evidence_stale"));
    } finally {
      fs.rmSync(path.dirname(tiedBase), { recursive: true });
    }
  });

  it("respects verification.require_manifest_provenance: false opt-out", () => {
    const tiedBase = tempTiedProject(
      "schema: tied-project-config.v1\nverification:\n  require_manifest_provenance: false\nyaml:\n  scalar_style: wrapped\n",
    );
    try {
      assert.equal(isVerifyManifestProvenanceEnforced(tiedBase), false);
      const result = validateVerifyManifestProvenance({
        tiedBasePath: tiedBase,
        passedRequirementTokens: ["REQ-NO-MANIFEST"],
        passedImplTokens: [],
      });
      assert.equal(result.ok, true);
    } finally {
      fs.rmSync(path.dirname(tiedBase), { recursive: true });
    }
  });
});
