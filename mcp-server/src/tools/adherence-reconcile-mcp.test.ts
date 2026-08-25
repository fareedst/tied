import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { allTools } from "./index.js";
import { runAdherenceReconcile } from "./adherence-reconcile-runner.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

const REQUEST_TOKEN = "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT";

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function repoRoot(): string {
  let dir = path.resolve(import.meta.dirname, "../../..");
  for (;;) {
    if (fs.existsSync(path.join(dir, "AGENTS.md")) && fs.existsSync(path.join(dir, "tools", "agentstream"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error("repo root not found");
    dir = parent;
  }
}

function hasFindingCode(findings: Array<{ code: string }>, code: string): boolean {
  return findings.some((finding) => finding.code === code);
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: MCP subprocess wrapper parity with Go reconcile table tests (A27).
describe("tied_adherence_reconcile_run [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("registers the reconcile MCP tool", () => {
    assert.ok(allTools.some((tool) => tool.name === "tied_adherence_reconcile_run"));
  });

  it("returns read_only ReconcileReport for legacy missing ledger", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "reconcile-mcp-legacy-"));
    const trackerPath = path.join(root, "tracker.yaml");
    fs.writeFileSync(trackerPath, "request_token: REQ-TEST\nschema_version: checklist-tracker.v1\nsteps: []\n");

    const handler = toolHandler("tied_adherence_reconcile_run");
    const result = await handler({
      ledger_path: path.join(root, "missing.jsonl"),
      tracker_path: trackerPath,
      gates_dir: path.join(root, "gates"),
      workspace: root,
    });
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      ok?: boolean;
      report?: { read_only?: boolean; findings?: Array<{ code: string }> };
    };
    assert.equal(payload.ok, true);
    assert.equal(payload.report?.read_only, true);
    assert.ok(hasFindingCode(payload.report?.findings ?? [], "legacy_no_adherence_chain"));
  });

  it("matches Go CLI findings for Stage L pilot corpus", async () => {
    const root = repoRoot();
    const ledgerPath = path.join(root, "working", REQUEST_TOKEN, "adherence", "pilot-events.jsonl");
    const trackerPath = path.join(root, "working", REQUEST_TOKEN, "stage-l-controlled-pilot_20260825.yaml");
    const gatesDir = path.join(root, "working", REQUEST_TOKEN, "gates", "pilot");
    const citdpPath = path.join(root, "working", REQUEST_TOKEN, "CITDP-" + REQUEST_TOKEN + "-stage-l.yaml");
    if (!fs.existsSync(ledgerPath) || !fs.existsSync(trackerPath)) {
      return; // skip when pilot corpus absent
    }

    const cli = await runAdherenceReconcile({
      ledger_path: ledgerPath,
      tracker_path: trackerPath,
      gates_dir: gatesDir,
      workspace: root,
      citdp_path: citdpPath,
      repo_root: root,
    });
    assert.equal(cli.ok, true, cli.diagnostics?.join(", "));

    const handler = toolHandler("tied_adherence_reconcile_run");
    const mcp = JSON.parse((await handler({
      ledger_path: ledgerPath,
      tracker_path: trackerPath,
      gates_dir: gatesDir,
      workspace: root,
      citdp_path: citdpPath,
    })).content[0]?.text ?? "{}") as {
      ok?: boolean;
      report?: { findings?: Array<{ code: string }>; ledger_rows?: number; read_only?: boolean };
    };
    assert.equal(mcp.ok, true);
    assert.equal(mcp.report?.read_only, true);
    assert.deepEqual(
      (mcp.report?.findings ?? []).map((f) => f.code).sort(),
      (cli.report?.findings ?? []).map((f) => f.code).sort(),
    );
    assert.equal(mcp.report?.ledger_rows, cli.report?.ledger_rows);

    for (const code of [
      "rendered_without_acknowledgment",
      "acknowledged_without_attempt",
      "attempt_without_verified_outcome",
      "completed_with_unresolved_evidence",
      "gate_without_current_evidence",
      "status_change_without_verification_receipt",
      "legacy_no_adherence_chain",
    ]) {
      assert.ok(!hasFindingCode(mcp.report?.findings ?? [], code), `A28: unexpected blocking finding ${code}`);
    }
  });
});
