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
import { stableHash, validateChecklistGate } from "./checklist-validator.js";

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

  it("allows minimal-to-integrated upgrade before inquiry when prior_depth_tier is minimal", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-citdp-upgrade-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const minimal = writeCitdpRecord({
        filename: "CITDP-REQ-UPGRADE.yaml",
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
      assert.equal(minimal.ok, true);

      const upgraded = writeCitdpRecord({
        filename: "CITDP-REQ-UPGRADE.yaml",
        record: {
          risk_analysis: {
            adversarial_inquiry: {
              depth_tier: "integrated",
              prior_depth_tier: "minimal",
              gate_policy: "advisory",
            },
          },
        },
      });
      assert.equal(upgraded.ok, true);
      const data = yaml.load(fs.readFileSync((upgraded as { ok: true; path: string }).path, "utf8")) as Record<string, unknown>;
      const inner = data["CITDP-REQ-UPGRADE"] as Record<string, unknown>;
      const section = (inner.risk_analysis as Record<string, unknown>).adversarial_inquiry as Record<string, unknown>;
      assert.equal(section.depth_tier, "integrated");
      assert.equal(section.prior_depth_tier, "minimal");
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("rejects minimal-to-integrated upgrade without prior_depth_tier minimal", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-citdp-upgrade-missing-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      assert.equal(writeCitdpRecord({
        filename: "CITDP-REQ-UPGRADE-MISSING.yaml",
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
      }).ok, true);

      const upgraded = writeCitdpRecord({
        filename: "CITDP-REQ-UPGRADE-MISSING.yaml",
        record: {
          risk_analysis: {
            adversarial_inquiry: {
              depth_tier: "integrated",
              gate_policy: "advisory",
            },
          },
        },
      });
      assert.equal(upgraded.ok, false);
      if (!upgraded.ok) {
        assert.match(upgraded.error, /depth_upgrade_requires_prior_depth_tier:minimal/);
      }
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("preserves prior_depth_tier on overwrite when incoming omits it", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-citdp-preserve-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      assert.equal(writeCitdpRecord({
        filename: "CITDP-REQ-PRESERVE.yaml",
        record: {
          risk_analysis: {
            adversarial_inquiry: {
              depth_tier: "integrated",
              prior_depth_tier: "minimal",
              gate_policy: "advisory",
            },
          },
        },
      }).ok, true);

      const updated = writeCitdpRecord({
        filename: "CITDP-REQ-PRESERVE.yaml",
        record: {
          change_definition: { current_behavior: "updated" },
          risk_analysis: {
            adversarial_inquiry: {
              depth_tier: "integrated",
              gate_policy: "advisory",
            },
          },
        },
      });
      assert.equal(updated.ok, true);
      const data = yaml.load(fs.readFileSync((updated as { ok: true; path: string }).path, "utf8")) as Record<string, unknown>;
      const section = ((data["CITDP-REQ-PRESERVE"] as Record<string, unknown>).risk_analysis as Record<string, unknown>)
        .adversarial_inquiry as Record<string, unknown>;
      assert.equal(section.prior_depth_tier, "minimal");
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("rejects malformed supplied activation at integrated depth", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-citdp-malformed-activation-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const result = writeCitdpRecord({
        filename: "CITDP-REQ-MALFORMED-ACTIVATION.yaml",
        record: {
          risk_analysis: {
            adversarial_inquiry: {
              depth_tier: "integrated",
              gate_policy: "advisory",
            },
          },
          completion_criteria: {
            activation: {
              receipt: {
                request_token: "REQ-MALFORMED",
                project_id: "project-1",
                run_id: "run-1",
                phase: "verification",
                scope: ["block-1"],
                scope_hash: stableHash(["block-1"]),
                success: true,
                tool: "tied_adversarial_inquiry_run",
              },
            },
          },
        },
      });
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.match(result.error, /partial_activation:receipt_artifacts_mismatch/);
      }
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("keeps verification gate blocked for integrated depth without activation pairing", () => {
    const citdp = {
      risk_analysis: {
        adversarial_inquiry: {
          depth_tier: "integrated",
          prior_depth_tier: "minimal",
          gate_policy: "advisory",
        },
      },
    };
    const result = validateChecklistGate({
      phase: "verification",
      tracker: {
        steps: [
          { slug: "risk-assessment", disposition: "completed", evidence_refs: ["citdp"] },
          { slug: "sub-adversarial-inquiry-pass", disposition: "completed", evidence_refs: ["inquiry"] },
          { slug: "verification-gate", disposition: "completed", evidence_refs: ["tests"] },
        ],
      },
      citdp,
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("integrated_depth_requires_pairing"));
    assert.ok(result.diagnostics.includes("missing_completion_activation"));
  });
});
