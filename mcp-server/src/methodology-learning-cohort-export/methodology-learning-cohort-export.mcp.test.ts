/**
 * [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT] MCP composition
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { MANIFEST_SCHEMA_VERSION } from "./constants.js";
import { allTools } from "../tools/index.js";

function handler(name: string) {
  const found = allTools.find((t) => t.name === name);
  assert.ok(found, `missing tool ${name}`);
  return found.handler;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const fixtureProfile = path.join(repoRoot, "working/evidence-chain/example-profile.json");

describe("methodology learning cohort export MCP [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]", () => {
  it("registers tied_methodology_learning_cohort_export_run", () => {
    const names = allTools.map((t) => t.name);
    assert.ok(names.includes("tied_methodology_learning_cohort_export_run"));
  });

  it("runs export via MCP handler for shareable_hashed experiment", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mlce-mcp-"));
    const tiedProject = path.join(dir, "tied-project");
    fs.mkdirSync(tiedProject, { recursive: true });
    const experimentId = "mle-demo-mcp-20261010";
    fs.writeFileSync(
      path.join(tiedProject, "methodology-experiments.yaml"),
      yaml.dump({
        experiments: [
          {
            schema_version: "methodology-learning-experiment.v1",
            experiment_id: experimentId,
            production_system_surface: "checklist_step",
            methodology_hypothesis: "MCP cohort export dogfood",
            proof_boundary: "structural only",
            privacy_tier: "shareable_hashed",
            methodology_baseline: { note: "dogfood" },
          },
        ],
      }),
      "utf8",
    );
    const profileName = "example-profile.json";
    fs.copyFileSync(fixtureProfile, path.join(dir, profileName));
    const yamlOut = path.join(dir, "cohort-export.yaml");
    const manifest = {
      schema_version: MANIFEST_SCHEMA_VERSION,
      privacy_tier: "shareable_hashed",
      policy: {
        redaction_owner: "sponsor",
        expiry: "2027-10-10",
        pilot: "stdd",
      },
      report_mode: "partial",
      report_version: "v1",
      experiments: [{ experiment_id: experimentId, profile_paths: [profileName] }],
    };

    const run = await handler("tied_methodology_learning_cohort_export_run")({
      manifest,
      yaml_out: yamlOut,
      base_path: tiedProject,
      cwd: dir,
      project_root: dir,
    } as never);
    const body = JSON.parse(run.content[0].text) as { ok: boolean };
    assert.equal(body.ok, true);
    assert.ok(fs.existsSync(yamlOut));
    const serialized = fs.readFileSync(yamlOut, "utf8");
    assert.ok(!serialized.includes("/Users/"));
  });
});
