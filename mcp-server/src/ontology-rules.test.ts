/**
 * [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — W5a ontology_rules on ARCH cycle fixture.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, beforeEach } from "node:test";
import yaml from "js-yaml";

import { validateConsistency } from "./consistency-validator.js";
import { runOntologyRules } from "./ontology-rules.js";
import { clearBasePathCache } from "./yaml-loader.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cycleFixture = path.join(
  repoRoot,
  "working/REQ-TIED_DAE_INCORPORATION/fixtures/graph/arch-cycle-minimal.yaml",
);

beforeEach(() => {
  clearBasePathCache();
});

function writeMinimalTiedWithArchCycle(dir: string): void {
  const fixture = yaml.load(fs.readFileSync(cycleFixture, "utf8")) as {
    architecture: Record<string, unknown>;
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "architecture-decisions.yaml"),
    yaml.dump(fixture.architecture),
    "utf8",
  );
  fs.writeFileSync(path.join(dir, "requirements.yaml"), "{}\n", "utf8");
  fs.writeFileSync(path.join(dir, "implementation-decisions.yaml"), "{}\n", "utf8");
  fs.writeFileSync(path.join(dir, "semantic-tokens.yaml"), "{}\n", "utf8");
}

describe("ontology-rules [REQ-TIED_DAE_INCORPORATION]", () => {
  it("fails ok on ARCH depends_on cycle (fixture)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-ontology-cycle-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      writeMinimalTiedWithArchCycle(dir);
      const ontology = runOntologyRules();
      assert.equal(ontology.ok, false);
      assert.ok(
        ontology.issues.some((issue) => issue.kind === "dependency_cycle"),
      );
      const report = validateConsistency({
        ontology_rules: true,
        include_detail_files: false,
        include_pseudocode: false,
        require_detail_record: false,
      });
      assert.equal(report.ok, false);
      assert.ok(report.ontology_issues?.some((i) => i.kind === "dependency_cycle"));
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports disjoint verifier mismatch when ledger supplied", () => {
    const ledger = {
      implementer_session_id: "sess-a",
      verifier_session_id: "sess-a",
    };
    const ontology = runOntologyRules({ adherence_ledger: ledger });
    assert.ok(
      ontology.issues.some((i) => i.kind === "disjoint_verifier_same_session"),
    );
    assert.equal(ontology.ok, true);
  });
});
