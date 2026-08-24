import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { allTools } from "./index.js";
import { stableHash } from "../checklist-validator.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: prove the shared read-only validator is registered and callable through MCP.
describe("tied_checklist_gate_validate composition [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("registers the shared gate and returns an allowed result", async () => {
    const result = await toolHandler("tied_checklist_gate_validate")({
      phase: "close_out",
      tracker: {
        steps: [
          {
            slug: "traceable-commit",
            disposition: "completed",
            evidence_refs: ["checklist-gate-mcp.test.ts"],
          },
          {
            slug: "sub-adversarial-inquiry-pass",
            disposition: "not_applicable",
            policy: "minimal-depth-no-inquiry",
            rationale: "MCP composition regression uses minimal depth without inquiry.",
          },
        ],
      },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            counterexamples: ["missing close-out evidence"],
            falsification_questions: ["Can close-out pass without a tracker?"],
            disconfirming_observations: ["the shared gate rejects missing evidence"],
            evidence_references: ["checklist-gate-mcp.test.ts"],
          },
        },
      },
    });

    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      allowed?: boolean;
      blocking?: boolean;
    };
    assert.equal(payload.allowed, true);
    assert.equal(payload.blocking, false);
  });

  it("accepts activation with receipt only when expected is omitted", async () => {
    const scope = ["IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT#MCP#block"];
    const scopeHash = stableHash(scope);
    const receipt = {
      request_token: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
      project_id: "stdd-project",
      run_id: "mcp-receipt-only-run",
      phase: "verification",
      scope,
      scope_hash: scopeHash,
      success: true,
      tool: "tied_adversarial_inquiry_run",
      artifact_hashes: {
        "obligation-report.json": "obligation-hash",
        "finding-ledger.jsonl": "ledger-hash",
        "gate-result.json": "gate-hash",
        "evidence-provenance.json": "provenance-hash",
      },
    };
    const artifacts = Object.fromEntries(
      Object.keys(receipt.artifact_hashes).map((name) => [name, {
        valid: true,
        request_token: receipt.request_token,
        project_id: receipt.project_id,
        run_id: receipt.run_id,
        phase: receipt.phase,
        scope_hash: scopeHash,
        hash: receipt.artifact_hashes[name as keyof typeof receipt.artifact_hashes],
      }]),
    );
    const result = await toolHandler("tied_checklist_gate_validate")({
      phase: "verification",
      tracker: {
        steps: [
          "risk-assessment",
          "sub-adversarial-inquiry-pass",
          "verification-gate",
        ].map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-gate-mcp.test.ts"],
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
            run_id: "mcp-receipt-only-run",
            phase: "verification",
          },
        },
      },
      activation: {
        receipt,
        artifacts,
      },
    });

    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      allowed?: boolean;
      diagnostics?: string[];
    };
    assert.equal(payload.allowed, true);
    assert.ok(!payload.diagnostics?.includes("missing_expected_identity"));
  });
});
