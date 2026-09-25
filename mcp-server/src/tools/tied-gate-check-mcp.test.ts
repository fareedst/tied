import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { allTools } from "./index.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — MCP mirror of tied gate check CLI.

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

describe("tied_gate_check MCP [REQ-TIED_DAE_INCORPORATION]", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

  it("registers tied_gate_check and returns exit contract fields", async () => {
    const handler = toolHandler("tied_gate_check");
    const tracker = path.join(
      repoRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/trackers/gate-blocked-minimal.yaml",
    );
    const citdp = path.join(
      repoRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/citdp/w1-gate-check-minimal.yaml",
    );
    if (!fs.existsSync(tracker) || !fs.existsSync(citdp)) {
      console.log("skip: gate check fixtures missing");
      return;
    }
    const result = await handler({
      request_token: "REQ-TIED_DAE_INCORPORATION",
      phase: "pre_implementation",
      tracker_path: tracker,
      citdp_path: citdp,
      project_root: repoRoot,
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      allowed: boolean;
      exit_code: number;
      receipt_path: string | null;
      reasons: string[];
    };
    assert.equal(typeof payload.allowed, "boolean");
    assert.ok([0, 1, 2].includes(payload.exit_code));
    assert.ok(Array.isArray(payload.reasons));
    assert.ok("receipt_path" in payload);
  });

  it("returns exit_code 2 when citdp path is missing", async () => {
    const handler = toolHandler("tied_gate_check");
    const tracker = path.join(
      repoRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/trackers/gate-blocked-minimal.yaml",
    );
    if (!fs.existsSync(tracker)) {
      return;
    }
    const result = await handler({
      request_token: "REQ-TIED_DAE_INCORPORATION",
      phase: "pre_implementation",
      tracker_path: tracker,
      citdp_path: path.join(repoRoot, "missing-citdp-for-gate-mcp.yaml"),
      project_root: repoRoot,
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      exit_code: number;
      reasons: string[];
    };
    assert.equal(payload.exit_code, 2);
    assert.ok(payload.reasons.length > 0);
  });
});
