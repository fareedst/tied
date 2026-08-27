import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";

import { allTools } from "./index.js";
import { clearBasePathCache } from "../yaml-loader.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

type CyclesPayload = {
  cycles?: string[][];
  has_cycles?: boolean;
  ok?: boolean;
};

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function parseCycles(result: TextContent): CyclesPayload {
  return JSON.parse(result.content[0]?.text ?? "{}") as CyclesPayload;
}

// [PROC-TIED_DEPENDENCY_GRAPH] — How: tied_cycles MCP contract must expose ok aligned with has_cycles for structural parity.
describe("tied_cycles MCP contract [PROC-TIED_DEPENDENCY_GRAPH]", () => {
  const tiedCycles = toolHandler("tied_cycles");
  let previousBasePath: string | undefined;

  beforeEach(() => {
    previousBasePath = process.env.TIED_BASE_PATH;
  });

  afterEach(() => {
    if (previousBasePath === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = previousBasePath;
    clearBasePathCache();
  });

  it("returns ok: true when requirements graph has no cycles", async () => {
    const result = await tiedCycles({ graph: "requirements" });
    const payload = parseCycles(result);

    assert.equal(typeof payload.ok, "boolean");
    assert.equal(payload.has_cycles, false);
    assert.deepEqual(payload.cycles, []);
    assert.equal(payload.ok, true);
    assert.equal(payload.ok, !payload.has_cycles);
  });

  it("returns ok: true when implementation graph has no cycles", async () => {
    const result = await tiedCycles({ graph: "implementation" });
    const payload = parseCycles(result);

    assert.equal(typeof payload.ok, "boolean");
    assert.equal(payload.has_cycles, false);
    assert.equal(payload.ok, true);
    assert.equal(payload.ok, !payload.has_cycles);
  });

  it("returns ok: false when a deliberate requirement cycle exists", async () => {
    const tiedBasePath = fs.mkdtempSync(path.join(os.tmpdir(), "tied-cycles-mcp-"));
    const requirementsYaml = path.join(tiedBasePath, "requirements.yaml");
    fs.writeFileSync(
      requirementsYaml,
      [
        "REQ-CYCLE-A:",
        "  related_requirements:",
        "    depends_on:",
        "      - REQ-CYCLE-B",
        "REQ-CYCLE-B:",
        "  related_requirements:",
        "    depends_on:",
        "      - REQ-CYCLE-A",
        "",
      ].join("\n"),
      "utf8",
    );

    process.env.TIED_BASE_PATH = tiedBasePath;
    clearBasePathCache();

    const result = await tiedCycles({ graph: "requirements" });
    const payload = parseCycles(result);

    assert.equal(typeof payload.ok, "boolean");
    assert.equal(payload.has_cycles, true);
    assert.ok((payload.cycles?.length ?? 0) > 0);
    assert.equal(payload.ok, false);
    assert.equal(payload.ok, !payload.has_cycles);

    fs.rmSync(tiedBasePath, { recursive: true, force: true });
  });
});
