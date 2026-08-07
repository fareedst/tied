import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import yaml from "js-yaml";
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

test("MCP canonical YAML bindings expose the shared format contract", async () => {
  // [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION] [REQ-MODULE_VALIDATION]
  // How: Make index/detail/token/batch/CITDP/feedback/verification/rename writers return the same format metadata after shared canonical writes.
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-canonical-mcp-"));
  const tiedBasePath = path.join(projectRoot, "tied");
  fs.mkdirSync(tiedBasePath);
  const previousBasePath = process.env.TIED_BASE_PATH;
  try {
    fs.writeFileSync(path.join(projectRoot, ".tied-yaml.yaml"), "scalar_style: wrapped\n");
    process.env.TIED_BASE_PATH = tiedBasePath;
    clearBasePathCache();
    const fixturePath = path.resolve(process.cwd(), "test/fixtures/yaml-style.yaml");
    const fixture = yaml.load(fs.readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
    const format = body(await handler("tied_yaml_format")({}));
    const formatMetadata = format.yaml_format as {
      profile_id?: string;
      scalar_style?: string;
      style_source?: string;
    };
    assert.equal(formatMetadata.profile_id, "tied-yaml-canonical-v1");
    assert.equal(formatMetadata.scalar_style, "wrapped");
    assert.equal(formatMetadata.style_source, "repository");

    const inserted = body(
      await handler("yaml_index_insert")({
        index: "semantic-tokens",
        token: "REQ-CANONICAL_COMPOSITION_TEST",
        record: JSON.stringify({
          ...fixture,
          type: "REQ",
          name: "Canonical composition test",
          status: "Active",
          description: "Composition evidence for shared YAML writer metadata",
        }),
      })
    );
    const insertedFormat = inserted.yaml_format as {
      profile_id?: string;
      scalar_style?: string;
    };
    assert.equal(inserted.ok, true);
    assert.equal(insertedFormat.profile_id, "tied-yaml-canonical-v1");
    assert.equal(insertedFormat.scalar_style, "wrapped");
    const indexText = fs.readFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "utf8");
    assert.match(indexText, /name: "Canonical composition test"/);
    assert.match(indexText, /message: "hello"/);
    assert.match(indexText, /flag: false/);

    const detailCreated = body(
      await handler("yaml_detail_create")({
        token: "REQ-CANONICAL_DETAIL_COMPOSITION_TEST",
        record: JSON.stringify({
          name: "Canonical detail composition test",
          status: "Active",
          description: "Composition evidence for detail writer metadata",
        }),
        sync_index: false,
      })
    );
    const detailCreatedFormat = detailCreated.yaml_format as {
      profile_id?: string;
      scalar_style?: string;
    };
    assert.equal(detailCreated.ok, true);
    assert.equal(detailCreatedFormat.profile_id, "tied-yaml-canonical-v1");
    assert.equal(detailCreatedFormat.scalar_style, "wrapped");

    const detailUpdated = body(
      await handler("yaml_detail_update")({
        token: "REQ-CANONICAL_DETAIL_COMPOSITION_TEST",
        updates: JSON.stringify({ description: "Updated detail composition evidence" }),
      })
    );
    const detailUpdatedFormat = detailUpdated.yaml_format as { profile_id?: string };
    assert.equal(detailUpdated.ok, true);
    assert.equal(detailUpdatedFormat.profile_id, "tied-yaml-canonical-v1");
  } finally {
    if (previousBasePath === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = previousBasePath;
    clearBasePathCache();
    fs.rmSync(tiedBasePath, { recursive: true, force: true });
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});
