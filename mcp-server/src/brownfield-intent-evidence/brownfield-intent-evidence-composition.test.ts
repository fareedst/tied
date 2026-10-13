import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { allTools } from "../tools/index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function handler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`MCP tool not registered: ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function body(result: TextContent): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/brownfield-intent-evidence",
);

describe("brownfield_intent_evidence_validate MCP [IMPL-TIED_BROWNFIELD_VALIDATION] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION]", () => {
  it("is registered and returns validation receipt with evidence refs", async () => {
    const markdown = await readFile(path.join(fixtureDir, "valid-matrix.md"), "utf8");
    const result = await handler("brownfield_intent_evidence_validate")({
      markdown_text: markdown,
      baseline_revision: "abc123def",
      mode: "report_only",
      scoped_analysis_evidence_id: "scoped-analysis-run-001",
      claims_review_evidence_id: "claims-review-run-001",
    });

    const value = body(result) as {
      ok?: boolean;
      schema_version?: string;
      evidence_refs?: Record<string, string>;
    };
    assert.equal(value.ok, true);
    assert.equal(value.schema_version, "brownfield-intent-evidence-receipt.v1");
    assert.equal(value.evidence_refs?.scoped_analysis_evidence_id, "scoped-analysis-run-001");
    assert.equal(value.evidence_refs?.claims_review_evidence_id, "claims-review-run-001");
  });

  it("does not mutate tied-project requirements index mtime", async () => {
    const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
    const requirementsPath = path.join(repoRoot, "tied-project/requirements.yaml");
    const before = await stat(requirementsPath);
    const markdown = await readFile(path.join(fixtureDir, "valid-matrix.md"), "utf8");
    await handler("brownfield_intent_evidence_validate")({
      markdown_text: markdown,
      baseline_revision: "abc123def",
    });
    const after = await stat(requirementsPath);
    assert.equal(after.mtimeMs, before.mtimeMs);
  });
});
