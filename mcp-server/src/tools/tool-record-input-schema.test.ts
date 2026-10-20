/**
 * [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY]
 * Schema and handler acceptance for object-or-string record fields on write tools.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { clearBasePathCache } from "../yaml-loader.js";
import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function handler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`MCP tool not registered: ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function body(result: TextContent): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

const RECORD_FIELD_TOOLS: Array<{ name: string; field: string; baseArgs: Record<string, unknown> }> = [
  {
    name: "yaml_index_insert",
    field: "record",
    baseArgs: { index: "semantic-tokens", token: "REQ-RECORD_INPUT_SCHEMA_TEST" },
  },
  {
    name: "yaml_index_update",
    field: "updates",
    baseArgs: { index: "semantic-tokens", token: "REQ-RECORD_INPUT_SCHEMA_TEST" },
  },
  {
    name: "yaml_detail_create",
    field: "record",
    baseArgs: { token: "REQ-RECORD_INPUT_OBJECT_TEST", sync_index: false },
  },
  {
    name: "yaml_detail_update",
    field: "updates",
    baseArgs: { token: "REQ-RECORD_INPUT_OBJECT_TEST" },
  },
  {
    name: "citdp_record_write",
    field: "record",
    baseArgs: { filename: "CITDP-RECORD_INPUT_TEST.yaml" },
  },
  {
    name: "tied_token_create_with_detail",
    field: "index_record",
    baseArgs: {
      token: "REQ-RECORD_INPUT_TOKEN_CREATE",
      detail_record: { name: "Detail", status: "Planned", description: "x" },
    },
  },
  {
    name: "tied_token_create_with_detail",
    field: "detail_record",
    baseArgs: {
      token: "REQ-RECORD_INPUT_TOKEN_CREATE2",
      index_record: { name: "Index", status: "Planned" },
    },
  },
];

test("write-tool Zod schemas accept string and object record fields", () => {
  const payload = { name: "Schema test", status: "Planned" };
  for (const { name, field, baseArgs } of RECORD_FIELD_TOOLS) {
    const tool = allTools.find((t) => t.name === name);
    assert.ok(tool, name);
    const schema = tool!.config.inputSchema as {
      parse: (v: unknown) => unknown;
    };
    schema.parse({ ...baseArgs, [field]: payload });
    schema.parse({ ...baseArgs, [field]: JSON.stringify(payload) });
  }
});

test("object and string record payloads produce equivalent index YAML", async () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-record-input-"));
  const tiedBasePath = path.join(projectRoot, "tied-project");
  fs.mkdirSync(path.join(tiedBasePath, "citdp"), { recursive: true });
  fs.writeFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "{}\n");
  fs.writeFileSync(path.join(tiedBasePath, "requirements.yaml"), "{}\n");
  const previousBasePath = process.env.TIED_BASE_PATH;
  const token = "REQ-OBJECT_STRING_EQUIV";
  const record = {
    type: "REQ",
    name: "Object string equiv",
    status: "Planned",
    description: "Equivalence test",
  };
  try {
    process.env.TIED_BASE_PATH = tiedBasePath;
    clearBasePathCache();

    const fromObject = body(
      await handler("yaml_index_insert")({
        index: "semantic-tokens",
        token,
        record,
      }),
    );
    assert.equal(fromObject.ok, true);
    const objectYaml = fs.readFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "utf8");

    fs.writeFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "{}\n");
    const fromString = body(
      await handler("yaml_index_insert")({
        index: "semantic-tokens",
        token,
        record: JSON.stringify(record),
      }),
    );
    assert.equal(fromString.ok, true);
    const stringYaml = fs.readFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "utf8");
    assert.equal(objectYaml, stringYaml);
  } finally {
    if (previousBasePath === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = previousBasePath;
    clearBasePathCache();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});

test("malformed record shapes fail normalization without write", async () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-record-input-bad-"));
  const tiedBasePath = path.join(projectRoot, "tied-project");
  fs.mkdirSync(tiedBasePath, { recursive: true });
  fs.writeFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "{}\n");
  const previousBasePath = process.env.TIED_BASE_PATH;
  try {
    process.env.TIED_BASE_PATH = tiedBasePath;
    clearBasePathCache();
    const before = fs.readFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "utf8");
    const result = body(
      await handler("yaml_index_insert")({
        index: "semantic-tokens",
        token: "REQ-BAD-PAYLOAD",
        record: 99,
      }),
    );
    assert.equal(result.ok, false);
    const after = fs.readFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "utf8");
    assert.equal(before, after);
  } finally {
    if (previousBasePath === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = previousBasePath;
    clearBasePathCache();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});
