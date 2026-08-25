/**
 * Tests for tied_verify / updateStatusFromPassedTokens.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { updateStatusFromPassedTokens } from "./verify.js";
import { clearBasePathCache } from "./yaml-loader.js";

beforeEach(() => {
  clearBasePathCache();
});

function validChecklistGate() {
  return {
    phase: "verification" as const,
    tracker: {
      steps: [
        {
          slug: "verification-gate",
          disposition: "completed",
          evidence_refs: ["verify.test.ts"],
        },
        {
          slug: "sub-adversarial-inquiry-pass",
          disposition: "not_applicable",
          policy: "minimal-depth-no-inquiry",
          rationale: "Verification status fixture uses minimal depth without inquiry.",
        },
      ],
    },
    citdp: {
      risk_analysis: {
        adversarial_inquiry: {
          depth_tier: "minimal",
          counterexamples: ["missing gate"],
          falsification_questions: ["Can status update without gate evidence?"],
          disconfirming_observations: ["missing gate is rejected"],
          evidence_references: ["verify.test.ts"],
        },
      },
    },
  };
}

describe("updateStatusFromPassedTokens dry_run", () => {
  it("blocks status updates when the shared checklist gate is missing", () => {
    const result = updateStatusFromPassedTokens({
      passed_requirement_tokens: ["REQ-ONE"],
    });
    assert.equal(result.ok, false);
    assert.deepEqual(result.diagnostics, ["missing_checklist_gate"]);
  });

  it("returns would_update without writing when dry_run true", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-verify-"));
    const reqPath = path.join(dir, "requirements.yaml");
    const implPath = path.join(dir, "implementation-decisions.yaml");
    fs.writeFileSync(
      reqPath,
      `REQ-ONE:
  status: Planned
  name: One
REQ-TWO:
  status: Implemented
  name: Two
`,
      "utf8"
    );
    fs.writeFileSync(
      implPath,
      `IMPL-ONE:
  status: Planned
  name: I1
`,
      "utf8"
    );
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();

      const r = updateStatusFromPassedTokens({
        dry_run: true,
        checklist_gate: validChecklistGate(),
        passed_requirement_tokens: ["REQ-ONE", "REQ-TWO"],
        passed_impl_tokens: ["IMPL-ONE"],
      });

      assert.strictEqual(r.ok, true);
      assert.strictEqual(r.dry_run, true);
      assert.ok(Array.isArray(r.would_update));
      const reqOne = r.would_update!.find((c) => c.token === "REQ-ONE");
      assert.ok(reqOne);
      assert.strictEqual(reqOne!.next_status, "Implemented");
      assert.strictEqual(reqOne!.previous_status, "Planned");
      const reqTwo = r.would_update!.find((c) => c.token === "REQ-TWO");
      assert.strictEqual(reqTwo, undefined, "already Implemented — no row");
      const implOne = r.would_update!.find((c) => c.token === "IMPL-ONE");
      assert.ok(implOne);
      assert.strictEqual(implOne!.next_status, "Active");

      const disk = fs.readFileSync(reqPath, "utf8");
      assert.ok(disk.includes("status: Planned"), "disk unchanged");
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("dry_run with empty passed lists returns empty would_update and unchanged disk", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-verify-empty-"));
    const reqPath = path.join(dir, "requirements.yaml");
    fs.writeFileSync(
      reqPath,
      `REQ-ONE:
  status: Planned
  name: One
`,
      "utf8"
    );
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();

      const r = updateStatusFromPassedTokens({
        dry_run: true,
        checklist_gate: validChecklistGate(),
        passed_requirement_tokens: [],
        passed_impl_tokens: [],
      });

      assert.strictEqual(r.ok, true);
      assert.strictEqual(r.dry_run, true);
      assert.deepStrictEqual(r.would_update, []);

      const disk = fs.readFileSync(reqPath, "utf8");
      assert.ok(disk.includes("status: Planned"));
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("A9 dry_run rejects invalid Go writer tracker input with no would_update", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-verify-writer-invalid-"));
    const reqPath = path.join(dir, "requirements.yaml");
    fs.writeFileSync(
      reqPath,
      `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT:
  status: Planned
  name: Gate enforcement
`,
      "utf8",
    );
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const result = updateStatusFromPassedTokens({
        dry_run: true,
        checklist_gate: {
          phase: "verification",
          tracker: {
            execution_evidence: { completed: ["verification-gate"] },
          },
          citdp: {
            risk_analysis: {
              adversarial_inquiry: {
                depth_tier: "integrated",
                gate_policy: "advisory",
                counterexamples: ["sparse tracker"],
                falsification_questions: ["Can status update without step rows?"],
                disconfirming_observations: ["verify revalidates gate input"],
                evidence_references: ["verify.test.ts"],
              },
            },
          },
        },
        passed_requirement_tokens: ["REQ-TIED_CHECKLIST_GATE_ENFORCEMENT"],
      });
      assert.equal(result.ok, false);
      assert.ok(result.diagnostics?.includes("tracker_sparse"));
      assert.strictEqual(result.would_update, undefined);
      const disk = fs.readFileSync(reqPath, "utf8");
      assert.ok(disk.includes("status: Planned"));
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("A9 dry_run accepts valid Go writer gate input and reports would_update only", () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
    const writerFixturePath = path.join(
      repoRoot,
      "tools/agentstream/checklist/testdata/gate-writer-minimal-tracker.yaml",
    );
    const tracker = yaml.load(fs.readFileSync(writerFixturePath, "utf8")) as Record<string, unknown>;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-verify-writer-valid-"));
    const reqPath = path.join(dir, "requirements.yaml");
    fs.writeFileSync(
      reqPath,
      `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT:
  status: Planned
  name: Gate enforcement
`,
      "utf8",
    );
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const result = updateStatusFromPassedTokens({
        dry_run: true,
        checklist_gate: {
          phase: "pre_implementation",
          tracker,
          citdp: validChecklistGate().citdp,
        },
        passed_requirement_tokens: ["REQ-TIED_CHECKLIST_GATE_ENFORCEMENT"],
      });
      assert.equal(result.ok, true);
      assert.strictEqual(result.dry_run, true);
      assert.ok(Array.isArray(result.would_update));
      assert.equal(result.would_update!.length, 1);
      assert.strictEqual(result.would_update![0]!.token, "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT");
      const disk = fs.readFileSync(reqPath, "utf8");
      assert.ok(disk.includes("status: Planned"));
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});
