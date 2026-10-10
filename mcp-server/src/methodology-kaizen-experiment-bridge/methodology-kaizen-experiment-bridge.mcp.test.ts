import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";

import { getMethodologyExperimentsPath } from "../methodology-learning-experiment/store.js";
import { upsertMethodologyLearningExperiment } from "../methodology-learning-experiment/store.js";
import { allTools } from "../tools/index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

describe("tied_methodology_kaizen_experiment_bridge MCP", () => {
  it("returns draft without mutating methodology-experiments.yaml", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "w3-bridge-mcp-"));
    fs.writeFileSync(
      path.join(dir, "feedback.yaml"),
      yaml.dump({
        entries: [
          {
            id: "fb-w3-mcp-001",
            type: "methodology_improvement",
            title: "Bridge MCP test",
            description: "Composition fixture.",
            created_at: "2026-10-10T12:00:00Z",
          },
        ],
      }),
      "utf8",
    );
    fs.writeFileSync(
      getMethodologyExperimentsPath(dir),
      yaml.dump({ experiments: [] }),
      "utf8",
    );
    const before = fs.readFileSync(getMethodologyExperimentsPath(dir), "utf8");

    const bridge = toolHandler("tied_methodology_kaizen_experiment_bridge");
    const result = await bridge({
      feedback_ids: ["fb-w3-mcp-001"],
      base_path: dir,
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      ok?: boolean;
      draft?: Record<string, unknown>;
    };
    assert.equal(payload.ok, true);
    assert.ok(payload.draft);

    const after = fs.readFileSync(getMethodologyExperimentsPath(dir), "utf8");
    assert.equal(after, before);
  });

  it("explicit upsert after bridge draft persists experiment", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "w3-bridge-upsert-"));
    fs.writeFileSync(
      path.join(dir, "feedback.yaml"),
      yaml.dump({
        entries: [
          {
            id: "fb-w3-mcp-002",
            type: "methodology_improvement",
            title: "Upsert path",
            description: "After explicit review.",
            created_at: "2026-10-10T12:00:00Z",
          },
        ],
      }),
      "utf8",
    );
    fs.writeFileSync(
      getMethodologyExperimentsPath(dir),
      yaml.dump({ experiments: [] }),
      "utf8",
    );

    const bridge = toolHandler("tied_methodology_kaizen_experiment_bridge");
    const bridged = JSON.parse(
      (await bridge({ feedback_ids: ["fb-w3-mcp-002"], base_path: dir })).content[0]?.text ?? "{}",
    ) as { draft?: Record<string, unknown> };
    const record = {
      ...bridged.draft,
      experiment_id: "mle-bridge-mcp-20261010-001",
    };
    const upsertResult = upsertMethodologyLearningExperiment(record, dir);
    assert.equal(upsertResult.ok, true);
    const listTool = toolHandler("tied_methodology_learning_experiment_list");
    const listed = JSON.parse(
      (await listTool({ base_path: dir })).content[0]?.text ?? "{}",
    ) as { experiments?: Array<{ experiment_id?: string }> };
    assert.ok(listed.experiments?.some((e) => e.experiment_id === "mle-bridge-mcp-20261010-001"));
  });
});
