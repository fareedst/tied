import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildVerificationEvidenceManifest,
  type VerificationEvidenceInput,
} from "./quality-evidence.js";

describe("BUILD_VERIFICATION_EVIDENCE_MANIFEST [REQ-QUALITY_ASSURANCE_EVIDENCE]", () => {
  it("normalizes and sorts executable evidence without embedding human risk decisions", () => {
    // [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Build a deterministic machine-derived verification evidence manifest while keeping human risk decisions separate.
    const input: VerificationEvidenceInput = {
      run_id: "run-001",
      commit: "abc123",
      environment: { os: "darwin", node: "22.0.0" },
      command_results: [
        {
          id: "unit",
          command: "npm test",
          cwd: "/repo",
          exit_code: 0,
          result: "passed",
          artifacts: ["test-results.json"],
        },
        {
          id: "build",
          command: "npm run build",
          cwd: "/repo",
          exit_code: 0,
          result: "passed",
        },
      ],
      quality_rows: [
        {
          id: "security-input",
          attribute: "external-input-security",
          applicability: "not_applicable",
          rationale: "No external input boundary changed.",
          evidence_method: "review",
          result: "not_applicable",
          owner: "team",
          limitation: "Scope is limited to this change.",
        },
      ],
      covered_tokens: ["IMPL-QUALITY_EVIDENCE_MANIFEST", "REQ-QUALITY_ASSURANCE_EVIDENCE"],
      proof_boundaries: ["TIED artifact integrity only"],
      decision_references: ["RISK-001"],
    };

    const manifest = buildVerificationEvidenceManifest(input);

    assert.deepEqual(
      manifest.command_results.map((row) => row.id),
      ["build", "unit"],
    );
    assert.deepEqual(manifest.covered_tokens, [
      "IMPL-QUALITY_EVIDENCE_MANIFEST",
      "REQ-QUALITY_ASSURANCE_EVIDENCE",
    ]);
    assert.deepEqual(manifest.quality_rows.map((row) => row.id), ["security-input"]);
    assert.deepEqual(manifest.human_decisions, {
      stored_separately: true,
      references: ["RISK-001"],
    });
    assert.deepEqual(manifest.proof_boundaries, ["TIED artifact integrity only"]);
  });

  it("rejects command results without executable identity", () => {
    const input = {
      run_id: "run-invalid",
      commit: "abc123",
      environment: {},
      command_results: [
        {
          id: "unit",
          command: "",
          cwd: "/repo",
          exit_code: 0,
          result: "passed",
        },
      ],
      quality_rows: [],
      covered_tokens: [],
      proof_boundaries: [],
    } as VerificationEvidenceInput;

    assert.throws(
      () => buildVerificationEvidenceManifest(input),
      /INVALID_COMMAND_RESULT/,
    );
  });

  it("rejects an exit code that disagrees with the reported result", () => {
    const input = {
      run_id: "run-invalid-result",
      commit: "abc123",
      environment: {},
      command_results: [
        {
          id: "unit",
          command: "npm test",
          cwd: "/repo",
          exit_code: 1,
          result: "passed",
        },
      ],
      quality_rows: [],
      covered_tokens: [],
      proof_boundaries: [],
    } as VerificationEvidenceInput;

    assert.throws(
      () => buildVerificationEvidenceManifest(input),
      /exit_code and result disagree/,
    );
  });

  it("requires an owned, expiring waiver for accepted risk", () => {
    const input = {
      run_id: "run-risk",
      commit: "abc123",
      environment: {},
      command_results: [],
      quality_rows: [
        {
          id: "security",
          attribute: "external-input-security",
          applicability: "accepted_risk",
          rationale: "Pilot does not expose file access.",
          evidence_method: "review",
          result: "not_applicable",
          owner: "security-owner",
          waiver: {
            required: true,
            reason: "No file boundary in this change.",
            owner: "security-owner",
            expiry: "2026-09-01",
          },
        },
      ],
      covered_tokens: [],
      proof_boundaries: [],
    } as VerificationEvidenceInput;

    assert.equal(buildVerificationEvidenceManifest(input).quality_rows[0]?.applicability, "accepted_risk");
  });

  it("rejects a quality row without an evidence method", () => {
    const input = {
      run_id: "run-invalid-quality",
      commit: "abc123",
      environment: {},
      command_results: [],
      quality_rows: [
        {
          id: "security",
          attribute: "external-input-security",
          applicability: "applicable",
          rationale: "Input boundary changed.",
          evidence_method: "",
          result: "pending",
        },
      ],
      covered_tokens: [],
      proof_boundaries: [],
    } as VerificationEvidenceInput;

    assert.throws(
      () => buildVerificationEvidenceManifest(input),
      /INVALID_QUALITY_ROW/,
    );
  });
});
