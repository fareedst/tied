import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

import { allTools } from "../tools/index.js";
import { getBasePath } from "../yaml-loader.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function handler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`MCP tool not registered: ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function body(result: TextContent): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

describe("evidence_chain_profile_generate MCP binding [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
  it("wires generate through a UI-free handler at both depths", async () => {
    // [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE]
    // Compose depth-gated adapters into one read-only profile without first-slice side effects.
    const tiedBasePath = getBasePath();
    const projectRoot = path.resolve(tiedBasePath, "..");
    const generate = handler("evidence_chain_profile_generate");

    const integrated = body(
      await generate({
        project_root: projectRoot,
        tied_base_path: tiedBasePath,
        profile_depth: "integrated",
        run_metadata: { run_id: "mcp-int", commit: "abc" },
      }),
    );
    const human = body(
      await generate({
        project_root: projectRoot,
        tied_base_path: tiedBasePath,
        profile_depth: "human_research",
        run_metadata: { run_id: "mcp-hr", commit: "abc" },
      }),
    );

    assert.equal(integrated.ok, true);
    assert.equal(human.ok, true);
    const integratedProfile = integrated.profile as { identity?: { schema_version?: string }; change_fidelity?: { status?: string } };
    const humanProfile = human.profile as { change_fidelity?: { status?: string }; identity?: { schema_version?: string } };
    assert.equal(integratedProfile.identity?.schema_version, "evidence-chain-profile.v1");
    assert.equal(humanProfile.change_fidelity?.status, "not_measured");
  });

  it("fails closed when tied_base_path does not match getBasePath", async () => {
    const generate = handler("evidence_chain_profile_generate");
    const result = body(
      await generate({
        project_root: "/tmp/wrong-client",
        tied_base_path: "/tmp/wrong-client/tied",
        profile_depth: "integrated",
      }),
    );
    assert.equal(result.ok, false);
    assert.equal(result.error, "WrongTiedBasePath");
  });
});
