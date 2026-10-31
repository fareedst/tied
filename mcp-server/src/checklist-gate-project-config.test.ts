/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING]
 * Gate MCP path must not fail closed on identity config key (DOC-STDD gap G6).
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { clearBasePathCache } from "./yaml-loader.js";
import { allTools } from "./tools/index.js";

describe("checklist gate + project config [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

  it("tied_checklist_gate_validate does not throw Unknown project config key identity", async () => {
    clearBasePathCache();
    process.env.TIED_CLIENT_PROJECT_PATH = path.join(repoRoot, "tied-project");
    process.env.TIED_CLIENT_BUNDLE_PATH = path.join(repoRoot, "tied-bundle");
    delete process.env.TIED_BASE_PATH;

    const tool = allTools.find((t) => t.name === "tied_checklist_gate_validate");
    assert.ok(tool);

    const result = await tool.handler({
      phase: "pre_implementation",
      project_root: repoRoot,
      tracker_path:
        "tied-project/working/REQ-TIED_CORPUS_COMPREHENSION/checklist-tracker-pre-implementation.yaml",
      citdp: {
        record_identity: { change_request_id: "REQ-TIED_CORPUS_COMPREHENSION" },
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            gate_policy: "advisory",
            profile_depth: "minimal",
          },
        },
      },
    });

    const text = (result as { content: Array<{ text: string }> }).content[0]?.text ?? "{}";
    const payload = JSON.parse(text) as { ok?: boolean; error?: string; allowed?: boolean };
    if (typeof payload.error === "string") {
      assert.ok(
        !payload.error.includes("Unknown project config key: identity"),
        `unexpected config rejection: ${payload.error}`,
      );
    }
    assert.equal(typeof payload.allowed, "boolean");
  });
});
