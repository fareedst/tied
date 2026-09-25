import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { collectVerificationEvidence } from "./quality-evidence-collection.js";

describe("COLLECT_VERIFICATION_EVIDENCE [IMPL-QUALITY_EVIDENCE_COLLECTION] [REQ-QUALITY_ASSURANCE_EVIDENCE]", () => {
  it("builds a manifest from observed command results", async () => {
    // [IMPL-QUALITY_EVIDENCE_COLLECTION] [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Connect declared command execution to deterministic verification manifest generation.
    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-evidence-collection-"));
    const { manifest } = await collectVerificationEvidence({
      run_id: "run-collection",
      commit: "abc123",
      environment: { node: process.version },
      commands: [
        {
          id: "build",
          argv: [process.execPath, "-e", "process.exit(0)"],
          cwd: process.cwd(),
          artifact_dir: artifactDir,
        },
      ],
      quality_rows: [],
      covered_tokens: ["REQ-QUALITY_ASSURANCE_EVIDENCE"],
      proof_boundaries: ["command execution only"],
    });

    assert.equal(manifest.command_results[0]?.result, "passed");
    assert.deepEqual(manifest.human_decisions.references, []);
  });

  describe("diff-scoped change-risk hook [REQ-TIED_DAE_INCORPORATION]", () => {
    let tempRoot = "";

    afterEach(() => {
      if (tempRoot) {
        fs.rmSync(tempRoot, { recursive: true, force: true });
        tempRoot = "";
      }
    });

    it("writes report under working/{REQ}/evidence after manifest when CITDP diff_scoped_crap is true", async () => {
      // [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
      // How: composition binds manifest success to OPTIONAL_DIFF_SCOPED_CRAP_HOOK.
      tempRoot = await mkdtemp(path.join(os.tmpdir(), "tied-r2-hook-"));
      const citdpDir = path.join(tempRoot, "tied", "citdp");
      fs.mkdirSync(citdpDir, { recursive: true });
      const requestToken = "REQ-R2-HOOK-FIXTURE";
      fs.writeFileSync(
        path.join(citdpDir, `CITDP-${requestToken}.yaml`),
        `CITDP-${requestToken}:\n  diff_scoped_crap: true\n  crap_threshold: 30\n`,
        "utf8",
      );
      const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-r2-artifacts-"));
      const { manifest, diff_scoped_crap_hook } = await collectVerificationEvidence({
        run_id: "run-r2-hook",
        commit: "abc123",
        environment: {},
        commands: [
          {
            id: "unit",
            argv: [process.execPath, "-e", "process.exit(0)"],
            cwd: process.cwd(),
            artifact_dir: artifactDir,
          },
        ],
        quality_rows: [],
        covered_tokens: [],
        proof_boundaries: ["command execution only"],
        diff_scoped_crap_hook: {
          request_token: requestToken,
          project_root: tempRoot,
          diff_paths: ["src/example.ts"],
          coverage_by_path: { "src/example.ts": 100 },
        },
      });

      assert.equal(manifest.schema_version, "verification-evidence-manifest.v1");
      assert.equal(diff_scoped_crap_hook?.skipped, false);
      assert.ok(diff_scoped_crap_hook?.report_path?.includes(`working/${requestToken}/evidence/diff-scoped-crap-`));
      assert.ok(fs.existsSync(diff_scoped_crap_hook!.report_path!));
    });

    it("skips hook when CITDP diff_scoped_crap is false (default)", async () => {
      tempRoot = await mkdtemp(path.join(os.tmpdir(), "tied-r2-hook-off-"));
      const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-r2-artifacts-off-"));
      const { diff_scoped_crap_hook } = await collectVerificationEvidence({
        run_id: "run-r2-off",
        commit: "abc123",
        environment: {},
        commands: [
          {
            id: "unit",
            argv: [process.execPath, "-e", "process.exit(0)"],
            cwd: process.cwd(),
            artifact_dir: artifactDir,
          },
        ],
        quality_rows: [],
        covered_tokens: [],
        proof_boundaries: ["command execution only"],
        envelope_patch: {
          request_token: "REQ-TIED_DAE_INCORPORATION",
          project_root: tempRoot,
          manifest_relative_path: "working/REQ-TIED_DAE_INCORPORATION/evidence/manifest.json",
        },
      });

      assert.equal(diff_scoped_crap_hook?.skipped, true);
      assert.equal(diff_scoped_crap_hook?.reason, "diff_scoped_crap_disabled");
    });
  });

  it("rejects an incomplete collection context before running commands", async () => {
    // [IMPL-QUALITY_EVIDENCE_COLLECTION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // How: Reject incomplete collection metadata before invoking bounded command execution.
    await assert.rejects(
      () =>
        collectVerificationEvidence({
          run_id: "",
          commit: "",
          environment: {},
          commands: [],
          quality_rows: [],
          covered_tokens: [],
          proof_boundaries: [],
        }),
      /INVALID_COLLECTION_INPUT/,
    );
  });
});
