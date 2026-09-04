/**
 * [REQ-VOCABULARY_EXPLORER] [ARCH-VOCABULARY_EXPLORER] MCP tool composition tests
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allTools } from "./index.js";
import { clearBasePathCache } from "../yaml-loader.js";

const mcpServerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtureRoot = path.resolve(
  mcpServerRoot,
  "test/fixtures/vocabulary-explorer/mini-project",
);

function tool(name: string) {
  const found = allTools.find((candidate) => candidate.name === name);
  assert.ok(found, `missing MCP tool ${name}`);
  return found;
}

describe("tied_vocabulary_explorer_run MCP [REQ-VOCABULARY_EXPLORER]", () => {
  let origCwd: string;
  let origEnv: string | undefined;

  beforeEach(() => {
    origCwd = process.cwd();
    origEnv = process.env.TIED_BASE_PATH;
    process.chdir(fixtureRoot);
    process.env.TIED_BASE_PATH = path.join(fixtureRoot, "tied");
    clearBasePathCache();
  });

  afterEach(() => {
    process.chdir(origCwd);
    if (origEnv === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = origEnv;
    clearBasePathCache();
  });

  it("returns vocabulary-explorer.v1 envelope without mutating TIED YAML", async () => {
    const tiedBefore = fs.readFileSync(path.join(fixtureRoot, "tied/requirements.yaml"), "utf8");
    const response = await tool("tied_vocabulary_explorer_run").handler({
      min_frequency: 2,
      max_terms: 500,
      identifier_mode: "ast",
    } as never);
    const parsed = JSON.parse(response.content[0].text) as {
      ok: boolean;
      envelope?: { schema: string; terms: { display: string }[] };
      html?: string;
    };
    assert.strictEqual(parsed.ok, true);
    assert.strictEqual(parsed.envelope?.schema, "vocabulary-explorer.v1");
    assert.ok(parsed.envelope?.terms.some((t) => t.display === "widgetHandler"));
    assert.ok(parsed.envelope?.terms.some((t) => t.display === "REQ-TIED_SETUP"));
    const tiedAfter = fs.readFileSync(path.join(fixtureRoot, "tied/requirements.yaml"), "utf8");
    assert.strictEqual(tiedAfter, tiedBefore);
  });

  it("writes HTML when out_html_path is set", async () => {
    const outPath = path.join(fixtureRoot, "working", "mcp-explorer.html");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    try {
      const response = await tool("tied_vocabulary_explorer_run").handler({
        min_frequency: 2,
        include_html: true,
        out_html_path: outPath,
      } as never);
      const parsed = JSON.parse(response.content[0].text) as { ok: boolean; html?: string };
      assert.strictEqual(parsed.ok, true);
      assert.ok(parsed.html?.includes("vocabulary-explorer.v1"));
      assert.ok(fs.existsSync(outPath));
      assert.ok(fs.readFileSync(outPath, "utf8").includes("Generated view"));
    } finally {
      fs.rmSync(path.join(fixtureRoot, "working"), { recursive: true, force: true });
    }
  });
});
