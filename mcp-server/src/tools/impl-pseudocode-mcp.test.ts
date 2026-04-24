/**
 * [IMPL] impl_detail_set_essence_pseudocode: inline vs path, XOR, path under TIED base.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, beforeEach } from "node:test";
import { clearBasePathCache } from "../yaml-loader.js";
import { allTools } from "./index.js";
import { getImplPseudocodeSidecarPath } from "../detail-loader.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function parseMcpJson(res: TextContent): Record<string, unknown> {
  const text = res.content[0]?.text;
  assert.equal(typeof text, "string");
  return JSON.parse(text as string) as Record<string, unknown>;
}

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const t = allTools.find((x) => x.name === name);
  if (!t) throw new Error(`MCP tool not registered: ${name}`);
  return t.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

describe("impl_detail_set_essence_pseudocode (MCP)", () => {
  const handler = toolHandler("impl_detail_set_essence_pseudocode");

  beforeEach(() => {
    clearBasePathCache();
  });

  it("returns error when neither essence_pseudocode nor essence_pseudocode_path is set [IMPL]", async () => {
    process.env.TIED_BASE_PATH = process.cwd() + path.sep + "tied-missing-" + Date.now();
    try {
      clearBasePathCache();
      const res = await handler({ token: "IMPL-X" });
      const body = parseMcpJson(res);
      assert.equal(body.ok, false);
      assert.match(String(body.error), /exactly one of essence_pseudocode/);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
    }
  });

  it("returns error when both essence_pseudocode and essence_pseudocode_path are set [IMPL]", async () => {
    process.env.TIED_BASE_PATH = process.cwd() + path.sep + "tied-missing-2";
    try {
      clearBasePathCache();
      const res = await handler({ token: "IMPL-X", essence_pseudocode: "a", essence_pseudocode_path: "b" });
      const body = parseMcpJson(res);
      assert.equal(body.ok, false);
      assert.match(String(body.error), /not both/);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
    }
  });

  it("writes the same sidecar content from essence_pseudocode_path as from inline [IMPL]", async () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "tied-impl-ep-"));
    try {
      const id = "IMPL_PSEUDOCODE_MCP_TEST";
      const token = `IMPL-${id}`;
      const sub = path.join(base, "implementation-decisions");
      fs.mkdirSync(sub, { recursive: true });
      const yamlPath = path.join(sub, `${token}.yaml`);
      const stub = `\
${token}:
  name: Test
`;
      fs.writeFileSync(yamlPath, stub, "utf8");
      const pathBody = path.join(sub, "draft-essence.md");
      const text = "INPUT line one\n# [REQ-TEST] block\n";
      fs.writeFileSync(pathBody, text, "utf8");

      process.env.TIED_BASE_PATH = base;
      clearBasePathCache();

      const r1 = await handler({
        token,
        essence_pseudocode: text,
      });
      const body1 = parseMcpJson(r1) as { ok: boolean; error?: string };
      assert.equal(body1.ok, true);

      const side = getImplPseudocodeSidecarPath(yamlPath, token);
      const first = fs.readFileSync(side, "utf8");
      assert.equal(first, text);

      fs.writeFileSync(side, "x", "utf8");

      const r2 = await handler({
        token,
        essence_pseudocode_path: "implementation-decisions/draft-essence.md",
      });
      const body2 = parseMcpJson(r2) as { ok: boolean; error?: string };
      assert.equal(body2.ok, true);
      assert.equal(fs.readFileSync(side, "utf8"), text);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("rejects essence_pseudocode_path outside TIED_BASE_PATH [IMPL]", async () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "tied-impl-ep-2-"));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "tied-impl-ep-2out-"));
    try {
      const sub = path.join(base, "implementation-decisions");
      fs.mkdirSync(sub, { recursive: true });
      const id = "IMPL_PSEUDOCODE_MCP_OOB";
      const token = `IMPL-${id}`;
      fs.writeFileSync(path.join(sub, `${token}.yaml`), `${token}:\n  name: X\n`, "utf8");
      const bad = path.join(outside, "nope.md");
      fs.writeFileSync(bad, "y", "utf8");
      process.env.TIED_BASE_PATH = base;
      clearBasePathCache();
      const res = await handler({ token, essence_pseudocode_path: bad });
      const body = parseMcpJson(res);
      assert.equal(body.ok, false);
      assert.match(String(body.error), /TIED_BASE_PATH|essence_pseudocode_path/);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(base, { recursive: true, force: true });
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});
