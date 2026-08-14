import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { allTools } from "./index.js";

function tool(name: string) {
  const found = allTools.find((candidate) => candidate.name === name);
  assert.ok(found, `missing MCP tool ${name}`);
  return found;
}

// [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS] — Composition binds research normalization and external append-only emission without UI.
describe("Batch 5 MCP composition [REQ-TIED_RESEARCH_RECORDS]", () => {
  it("binds research records to the external dataset boundary", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch-5-mcp-"));
    try {
      const response = await tool("tied_research_record_add").handler({
        record: {
          record_type: "experiment",
          source: "fixture",
          source_date: "2026-08-13",
          method: "controlled test",
          conclusion: "pass",
          uncertainty: "none measured",
          affected_decisions: { architecture: ["ARCH-TIED_RESEARCH_RECORD_BOUNDARY"], implementation: ["IMPL-TIED_RESEARCH_RECORDS"] },
          evidence_provenance: { revision: "r1", environment: "test", command: "test", result: "pass", artifacts: ["a"] },
          classification: "confirmed_case_report",
          freshness_policy: { max_age_days: 30, unknown_date: "freshness_unknown" },
        },
        audited_project_root: path.join(root, "project"),
        dataset_path: path.join(root, "research.jsonl"),
        evaluated_at: "2026-08-13",
      } as never);
      const parsed = JSON.parse(response.content[0].text) as { ok: boolean };
      assert.equal(parsed.ok, true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Composition binds operational feedback capture to existing feedback and reviewed LEAP queue surfaces.
describe("Batch 5 feedback MCP composition [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION]", () => {
  it("binds source capture and requires review before proposal creation", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch-5-mcp-"));
    try {
      const response = await tool("tied_feedback_operational_add").handler({
        source: {
          source_type: "test_failure",
          source_id: "test-1",
          affected_feature: "FEAT-001",
          severity: "medium",
          evidence_links: ["test://1"],
          occurred_at: "2026-08-13T00:00:00.000Z",
          title: "Regression",
          description: "A test failed",
          proposed_req: "REQ-FEAT_REGRESSION",
        },
        base_path: root,
      } as never);
      const captured = JSON.parse(response.content[0].text) as { ok: boolean; id?: string };
      assert.equal(captured.ok, true);
      assert.ok(captured.id);

      const rejected = await tool("tied_feedback_promote").handler({
        entry: {
          id: captured.id,
          type: "bug_report",
          title: "Regression",
          description: "A test failed",
          created_at: "2026-08-13T00:00:00.000Z",
          source_type: "test_failure",
          source_id: "test-1",
          affected_feature: "FEAT-001",
          severity: "medium",
          evidence_links: ["test://1"],
          duplicate_group: "fg-test",
          proposed_req: "REQ-FEAT_REGRESSION",
          promotion_status: "promotion_pending",
        },
        project_root: root,
      } as never);
      const result = JSON.parse(rejected.content[0].text) as { error?: string };
      assert.equal(result.error, "ReviewRequired");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
