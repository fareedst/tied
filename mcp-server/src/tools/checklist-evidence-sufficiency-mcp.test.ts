import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { allTools } from "./index.js";
import { setChecklistEvidenceSufficiencyDecideFnForTests } from "./checklist-evidence-sufficiency-mcp.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

const minimalCitdp = {
  risk_analysis: {
    adversarial_inquiry: {
      depth_tier: "minimal",
      counterexamples: ["missing close-out evidence"],
      falsification_questions: ["Can close-out pass without a tracker?"],
      disconfirming_observations: ["the shared gate rejects missing evidence"],
      evidence_references: ["checklist-evidence-sufficiency-mcp.test.ts"],
    },
  },
};

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
describe("Blueprint C MCP composition [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]", () => {
  const priorEnv = process.env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY;

  afterEach(() => {
    if (priorEnv === undefined) {
      delete process.env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY;
    } else {
      process.env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY = priorEnv;
    }
    setChecklistEvidenceSufficiencyDecideFnForTests(undefined);
  });

  it("SC-DEFAULT-OFF: gate validate unchanged when feature unset", async () => {
    delete process.env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY;
    const result = await toolHandler("tied_checklist_gate_validate")({
      phase: "close_out",
      tracker: {
        steps: [
          {
            slug: "traceable-commit",
            disposition: "completed",
            evidence_refs: ["checklist-evidence-sufficiency-mcp.test.ts"],
          },
          {
            slug: "sub-adversarial-inquiry-pass",
            disposition: "not_applicable",
            policy: "minimal-depth-no-inquiry",
            rationale: "MCP composition regression uses minimal depth without inquiry.",
          },
        ],
      },
      citdp: minimalCitdp,
    });

    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      allowed?: boolean;
      pre_gate?: string;
    };
    assert.equal(payload.allowed, true);
    assert.equal(payload.pre_gate, undefined);
  });

  it("SC-OPT-IN-BLOCK: superficial evidence pre-gate reject without gate_receipt", async () => {
    process.env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY = "1";
    const result = await toolHandler("tied_checklist_gate_validate")({
      phase: "close_out",
      required_step_slugs: ["traceable-commit"],
      tracker: {
        steps: [
          {
            slug: "traceable-commit",
            disposition: "completed",
            evidence_refs: ["   "],
          },
          {
            slug: "sub-adversarial-inquiry-pass",
            disposition: "not_applicable",
            policy: "minimal-depth-no-inquiry",
            rationale: "minimal depth",
          },
        ],
      },
      citdp: minimalCitdp,
    });

    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      ok?: boolean;
      pre_gate?: string;
      allowed?: boolean;
      blocking?: boolean;
      gate_receipt?: unknown;
      failed_step_slugs?: string[];
    };
    assert.equal(payload.ok, false);
    assert.equal(payload.pre_gate, "jev_evidence_sufficiency");
    assert.equal(payload.allowed, false);
    assert.equal(payload.blocking, true);
    assert.ok(!("gate_receipt" in payload));
    assert.deepEqual(payload.failed_step_slugs, ["traceable-commit"]);
  });

  it("SC-AUTHORITY: pre-gate reject never sets allowed true or gate receipt", async () => {
    process.env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY = "1";
    const result = await toolHandler("tied_checklist_gate_validate")({
      phase: "verification",
      required_step_slugs: ["traceable-commit"],
      tracker: {
        steps: [{ slug: "traceable-commit", disposition: "completed" }],
      },
      citdp: minimalCitdp,
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
    assert.notEqual(payload.allowed, true);
    assert.ok(!("gate_receipt" in payload));
  });

  it("SC-SLUG-SCOPE: out-of-scope slug not judged when required_step_slugs narrows set", async () => {
    process.env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY = "1";
    const result = await toolHandler("tied_jev_checklist_evidence_sufficiency")({
      phase: "verification",
      required_step_slugs: ["unit-test-green"],
      tracker: {
        steps: [
          { slug: "traceable-commit", disposition: "completed", evidence_refs: ["   "] },
          {
            slug: "unit-test-green",
            disposition: "completed",
            evidence_refs: ["bun test mcp-server/src/jev/checklist-evidence-sufficiency.test.ts — pass"],
          },
          {
            slug: "sub-adversarial-inquiry-pass",
            disposition: "not_applicable",
            policy: "minimal-depth-no-inquiry",
            rationale: "minimal depth",
          },
        ],
      },
      citdp: minimalCitdp,
    });

    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      ok: boolean;
      target_slugs: string[];
      results: Array<{ slug: string; pre_gate_ok: boolean }>;
    };
    assert.ok(payload.target_slugs.includes("unit-test-green"));
    assert.ok(!payload.target_slugs.includes("traceable-commit"));
    assert.ok(!payload.results.some((row) => row.slug === "traceable-commit"));
    assert.equal(payload.results.find((row) => row.slug === "unit-test-green")?.pre_gate_ok, true);
    assert.equal(payload.ok, true);
  });
});
