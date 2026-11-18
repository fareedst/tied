/**
 * [REQ-TIED_AS_OPERATED_BASELINE] [IMPL-TIED_AS_OPERATED_BASELINE]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import yaml from "js-yaml";

import {
  readAsOperatedBaseline,
  validateAsOperatedBaselineFacetShape,
  validateAsOperatedBaselineProgression,
} from "./facet.js";
import { validateSnapshotA, validateSnapshotB } from "./snapshot-minimums.js";

function writeRegistry(root: string, name: string, records: Record<string, unknown>[]): void {
  const dir = path.join(root, "registry");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), yaml.dump({ engagement: "fixture", records }));
}

function writeSnapshotA(root: string): void {
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(
    path.join(root, "00-mission-boundary-and-assumptions.md"),
    "# mission\n\nGit revision: abc123\n\nPhases 8–11 deferred.\n",
  );
  writeRegistry(root, "actors.yaml", [{ id: "ACT-001" }]);
  writeRegistry(root, "capabilities.yaml", [
    { id: "CAP-001" },
    { id: "CAP-002" },
    { id: "CAP-003" },
  ]);
  writeRegistry(root, "contracts.yaml", [
    { id: "CON-001", status: "observed" },
    { id: "CON-002", status: "observed" },
    { id: "CON-003", status: "observed" },
    { id: "CON-004", status: "observed" },
    { id: "CON-005", status: "observed" },
  ]);
  writeRegistry(root, "integrations.yaml", [{ id: "INT-001" }, { id: "INT-002" }]);
  writeRegistry(root, "topology.yaml", [{ id: "TOP-1" }]);
  writeRegistry(root, "data.yaml", [{ id: "DAT-001" }]);
  writeRegistry(root, "evidence.yaml", [
    { id: "EV-001" },
    { id: "EV-002" },
    { id: "EV-003" },
  ]);
}

function writeSnapshotB(root: string): void {
  writeSnapshotA(root);
  const artifacts = [
    "01-users-outcomes-and-domain.md",
    "02-capabilities-and-workflows.md",
    "03-contracts-and-observed-behavior.md",
    "04-as-built-and-as-operated.md",
    "05-data-state-and-integrations.md",
    "06-quality-operations-security.md",
    "07-failure-risk-and-historical-decisions.md",
    "08-verification-and-characterization.md",
    "09-evidence-uncertainties-and-questions.md",
  ];
  for (const name of artifacts) {
    fs.writeFileSync(path.join(root, name), `# ${name}\n`);
  }
  const caps = Array.from({ length: 10 }, (_, i) => ({ id: `CAP-${String(i + 1).padStart(3, "0")}` }));
  writeRegistry(root, "capabilities.yaml", caps);
  const cons = Array.from({ length: 15 }, (_, i) => ({ id: `CON-${String(i + 1).padStart(3, "0")}`, status: "observed" }));
  writeRegistry(root, "contracts.yaml", cons);
  writeRegistry(root, "outcomes.yaml", [
    { id: "OUT-001" },
    { id: "OUT-002" },
    { id: "OUT-003" },
    { id: "OUT-004" },
    { id: "OUT-005" },
  ]);
  writeRegistry(root, "actors.yaml", [{ id: "ACT-001" }, { id: "ACT-002" }, { id: "ACT-003" }]);
  writeRegistry(root, "workflows.yaml", [{ id: "WF-001" }]);
  writeRegistry(root, "quality.yaml", [{ id: "QUA-001" }]);
  writeRegistry(root, "failures.yaml", [{ id: "FAIL-001" }]);
  writeRegistry(root, "gaps.yaml", [{ id: "GAP-001" }]);
  writeRegistry(root, "verification.yaml", [{ id: "VER-001" }]);
}

describe("as_operated_baseline snapshot minimums [REQ-TIED_AS_OPERATED_BASELINE]", () => {
  it("validateSnapshotA passes minimal fixture", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aob-a-"));
    const proj = fs.mkdtempSync(path.join(os.tmpdir(), "aob-proj-"));
    const tree = path.join(root, "replacement-discovery");
    writeSnapshotA(tree);
    const receipt = path.join(proj, "receipt-a.json");
    fs.writeFileSync(receipt, "{}");
    const result = validateSnapshotA(tree, proj, receipt);
    assert.equal(result.ok, true, result.diagnostics.join(","));
  });

  it("validateSnapshotB passes extended fixture", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aob-b-"));
    const proj = fs.mkdtempSync(path.join(os.tmpdir(), "aob-proj2-"));
    const tree = path.join(root, "replacement-discovery");
    writeSnapshotB(tree);
    const receipt = path.join(proj, "receipt-b.json");
    fs.writeFileSync(receipt, "{}");
    const result = validateSnapshotB(tree, proj, receipt);
    assert.equal(result.ok, true, result.diagnostics.join(","));
  });
});

describe("as_operated_baseline facet [REQ-TIED_AS_OPERATED_BASELINE]", () => {
  it("readAsOperatedBaseline returns mode active", () => {
    const facet = readAsOperatedBaseline({ as_operated_baseline: { mode: "active" } });
    assert.equal(facet?.mode, "active");
  });

  it("rejects invalid mode", () => {
    const result = validateAsOperatedBaselineFacetShape({
      as_operated_baseline: { mode: "broken" },
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("invalid_as_operated_mode"));
  });

  it("follow_up_only skips snapshot enforcement at verification", () => {
    const result = validateAsOperatedBaselineProgression({
      tracker: { as_operated_baseline: { mode: "follow_up_only" } },
      phase: "verification",
      projectRoot: "/tmp",
    });
    assert.equal(result.ok, true);
  });
});