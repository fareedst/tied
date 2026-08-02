import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { collectVerificationEvidence } from "./quality-evidence-collection.js";

describe("COLLECT_VERIFICATION_EVIDENCE [IMPL-QUALITY_EVIDENCE_COLLECTION] [REQ-QUALITY_ASSURANCE_EVIDENCE]", () => {
  it("builds a manifest from observed command results", async () => {
    // [IMPL-QUALITY_EVIDENCE_COLLECTION] [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Connect declared command execution to deterministic verification manifest generation.
    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-evidence-collection-"));
    const manifest = await collectVerificationEvidence({
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
