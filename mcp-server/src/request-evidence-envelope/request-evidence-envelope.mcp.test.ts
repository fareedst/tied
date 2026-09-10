import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
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

describe("request_evidence_envelope MCP tools [REQ-REQUEST_EVIDENCE_ENVELOPE]", () => {
  it("registers build and validate handlers", () => {
    assert.ok(allTools.some((tool) => tool.name === "request_evidence_envelope_build"));
    assert.ok(allTools.some((tool) => tool.name === "request_evidence_envelope_validate"));
  });

  it("build returns envelope JSON read-only", async () => {
    const build = handler("request_evidence_envelope_build");
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-mcp-"));
    const requestToken = "REQ-MCP-ENVELOPE-TEST";
    const working = path.join(tempRoot, "working", requestToken);
    mkdirSync(working, { recursive: true });
    writeFileSync(
      path.join(working, "agent-req-implementation-checklist.yaml"),
      "execution_evidence:\n  request: REQ-MCP-ENVELOPE-TEST\n",
      "utf8",
    );
    const tiedBasePath = getBasePath();
    const result = body(
      await build({
        request_token: requestToken,
        project_root: tempRoot,
        tied_base_path: tiedBasePath,
      }),
    );
    assert.equal(result.ok, true);
    const envelope = result.envelope as { schema_version?: string };
    assert.equal(envelope.schema_version, "request-evidence-envelope.v1");
  });

  it("validate rejects malformed envelope path", async () => {
    const validate = handler("request_evidence_envelope_validate");
    const result = body(
      await validate({
        envelope_path: "/tmp/does-not-exist/request-evidence-envelope.v1.json",
        project_root: "/tmp",
      }),
    );
    assert.equal(result.ok, false);
    assert.ok((result.diagnostics as string[]).length > 0);
  });
});
