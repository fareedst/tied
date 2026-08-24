import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { collectChecklistActivation } from "./checklist-activation-collect.js";
import { runProjectInquiry, type ModeBInput } from "./adversarial-inquiry/project-orchestrator.js";
import { derivePhaseAwareSlugs } from "./checklist-validator.js";
import { allTools } from "./tools/index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

const REQUEST_TOKEN = "REQ-FIXTURE-ADVERSARIAL";

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function goFixtureInput(caseName: string): ModeBInput {
  const fixtureRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../test/fixtures/adversarial-inquiry-go-mode-b",
  );
  const projectRoot = path.join(fixtureRoot, "mini-project");
  const inputPath = path.join(fixtureRoot, "cases", caseName, "mode-b-input.json");
  return JSON.parse(
    fs.readFileSync(inputPath, "utf8").replaceAll("__PROJECT_ROOT__", projectRoot),
  ) as ModeBInput;
}

describe("Go Mode B inquiry → collect → gate composition [REQ-TIED_ADVERSARIAL_INQUIRY]", () => {
  it("fixture dispatch persists phase artifacts that collect and gate accept", async () => {
    const input = {
      ...goFixtureInput("case-good"),
      activation: { runId: "go-mode-b-composition-run", phase: "verification" as const },
    };
    const inquiry = await runProjectInquiry(input);
    assert.equal(inquiry.ok, true);
    assert.ok(inquiry.activation, "expected phase-scoped activation artifacts");

    const collectHandler = toolHandler("tied_checklist_activation_collect");
    const collected = JSON.parse((await collectHandler({
      request_token: REQUEST_TOKEN,
      phase: "verification",
      run_id: "go-mode-b-composition-run",
      project_root: input.project_root,
    })).content[0]?.text ?? "{}") as { ok?: boolean; receipt?: unknown; artifacts?: unknown; expected?: unknown };

    assert.equal(collected.ok, true);
    const gateHandler = toolHandler("tied_checklist_gate_validate");
    const gate = JSON.parse((await gateHandler({
      phase: "verification",
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "verification").map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["go-mode-b-composition.test.ts"],
        })),
      },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "integrated",
            gate_policy: "advisory",
          },
        },
        completion_criteria: {
          activation: {
            run_id: "go-mode-b-composition-run",
            phase: "verification",
            request_token: REQUEST_TOKEN,
          },
        },
      },
      activation: {
        receipt: collected.receipt,
        artifacts: collected.artifacts,
        expected: collected.expected,
      },
    })).content[0]?.text ?? "{}") as { allowed?: boolean; diagnostics?: string[] };

    assert.equal(gate.allowed, true, gate.diagnostics?.join(", "));
  });
});
