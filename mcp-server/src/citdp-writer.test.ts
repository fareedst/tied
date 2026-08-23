/**
 * CITDP writer tests. [IMPL]
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import yaml from "js-yaml";
import { clearBasePathCache } from "./yaml-loader.js";
import { writeCitdpRecord } from "./citdp-writer.js";
import { stableHash } from "./checklist-validator.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("writeCitdpRecord", () => {
  it("rejects path segments in filename", () => {
    const r = writeCitdpRecord({
      filename: "../evil/CITDP-X.yaml",
      record: { a: 1 },
    });
    assert.strictEqual(r.ok, false);
  });

  it("rejects flat adversarial depth and requires the nested contract", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-citdp-contract-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const flat = writeCitdpRecord({
        filename: "CITDP-REQ-FLAT.yaml",
        record: { risk_analysis: { depth_tier: "minimal" } },
      });
      assert.equal(flat.ok, false);
      if (!flat.ok) assert.match(flat.error, /adversarial CITDP/);

      const nested = writeCitdpRecord({
        filename: "CITDP-REQ-NESTED.yaml",
        record: {
          risk_analysis: {
            adversarial_inquiry: {
              depth_tier: "minimal",
              counterexamples: ["empty input"],
              falsification_questions: ["Can empty input pass?"],
              disconfirming_observations: ["empty input rejected"],
              evidence_references: ["test-1"],
            },
          },
        },
      });
      assert.equal(nested.ok, true);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("validates activation nested under completion criteria", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-citdp-activation-"));
    const expected = {
      request_token: "REQ-ACTIVATION",
      project_id: "project-1",
      run_id: "run-1",
      phase: "verification" as const,
      scope: ["block-1"],
      scope_hash: stableHash(["block-1"]),
    };
    const artifactNames = [
      "obligation-report.json",
      "finding-ledger.jsonl",
      "gate-result.json",
      "evidence-provenance.json",
    ];
    const artifacts = Object.fromEntries(artifactNames.map((name) => [name, {
      valid: true,
      ...expected,
      hash: `${name}-hash`,
    }]));
    const activation = {
      receipt: {
        ...expected,
        success: true,
        tool: "tied_adversarial_inquiry_run",
        artifact_hashes: Object.fromEntries(
          artifactNames.map((name) => [name, `${name}-hash`]),
        ),
      },
      artifacts,
      expected,
    };
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const result = writeCitdpRecord({
        filename: "CITDP-REQ-ACTIVATION.yaml",
        record: {
          risk_analysis: {
            adversarial_inquiry: {
              depth_tier: "integrated",
            },
          },
          completion_criteria: { activation },
        },
      });
      assert.equal(result.ok, true);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("writes tied/citdp/CITDP-*.yaml with safe top-level key", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-citdp-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const w = writeCitdpRecord({
        filename: "CITDP-REQ-UNIT_TEST.yaml",
        record: { change_definition: { current_behavior: "x" } },
      });
      assert.strictEqual(w.ok, true);
      const p = (w as { ok: true; path: string }).path;
      assert.ok(fs.existsSync(p));
      const data = yaml.load(fs.readFileSync(p, "utf8")) as Record<string, unknown>;
      assert.ok(data["CITDP-REQ-UNIT_TEST"]);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});
