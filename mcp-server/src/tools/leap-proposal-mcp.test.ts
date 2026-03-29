/**
 * Composition: MCP tied_leap_proposal_* handlers → safeLeapCall → leap-proposal-queue module.
 * [REQ-LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [IMPL-MCP_LEAP_PROPOSAL_QUEUE]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { getQueuePath, LEAP_PROPOSAL_QUEUE_SCHEMA } from "../analysis/leap-proposal-queue.js";
import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function parseMcpJson(res: TextContent): Record<string, unknown> {
  const text = res.content[0]?.text;
  assert.equal(typeof text, "string");
  return JSON.parse(text as string) as Record<string, unknown>;
}

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const t = allTools.find((x) => x.name === name);
  if (!t) throw new Error(`MCP tool not registered: ${name}`);
  return t.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

describe("composition: LEAP proposal MCP bindings (no UI)", () => {
  it("MCP_HANDLER tied_leap_proposal_extract_diff — explicit_opt_in false returns error before git extract", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    // Verifies handler gate → { ok: false, error }; extractDiffProposalCandidates not required for this path.
    const handler = toolHandler("tied_leap_proposal_extract_diff");
    const res = await handler({ explicit_opt_in: false });
    const body = parseMcpJson(res);
    assert.equal(body.ok, false);
    assert.ok(
      String(body.error).includes("explicit_opt_in"),
      "error should mention explicit_opt_in gate"
    );
  });

  it("MCP_HANDLER tied_leap_proposal_extract_diff — explicit_opt_in true delegates extractDiffProposalCandidates (non-git error path)", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-mcp-ed-"));
    try {
      const handler = toolHandler("tied_leap_proposal_extract_diff");
      const res = await handler({ explicit_opt_in: true, project_root: dir, max_proposals: 5 });
      const body = parseMcpJson(res) as { ok: boolean; error?: string; extraction?: { candidates: unknown[] } };
      assert.equal(body.ok, false);
      assert.ok(typeof body.error === "string" && body.error.length > 0);
      assert.ok(body.extraction);
      assert.ok(Array.isArray(body.extraction?.candidates));
      assert.equal(body.extraction?.candidates.length, 0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("MCP_HANDLER tied_leap_proposal_import_session — explicit_opt_in false returns error before parse/add", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    const handler = toolHandler("tied_leap_proposal_import_session");
    const res = await handler({
      explicit_opt_in: false,
      raw_text: "ignored",
    });
    const body = parseMcpJson(res);
    assert.equal(body.ok, false);
    assert.ok(String(body.error).includes("explicit_opt_in"));
  });

  it("MCP_HANDLER tied_leap_proposal_import_session — explicit_opt_in true wires parseSessionExportSegments → proposalsFromSessionSegments → addProposal", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    // Verifies trigger → segment parse → trimmed inferred_session proposals → queue persistence under project_root.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-mcp-"));
    try {
      const handler = toolHandler("tied_leap_proposal_import_session");
      const res = await handler({
        explicit_opt_in: true,
        project_root: dir,
        raw_text: "  first  \n---\n  second  ",
        label: "comp",
      });
      const body = parseMcpJson(res);
      assert.equal(body.ok, true);
      assert.equal(body.created_count, 2);
      assert.equal(body.segment_count, 2);
      const created = body.created as Array<{ summary?: string; kind?: string }>;
      assert.equal(created[0]?.kind, "inferred_session");
      assert.equal(created[0]?.summary, "first");
      assert.equal(created[1]?.summary, "second");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("MCP_HANDLER tied_leap_proposal_add → tied_leap_proposal_list delegates to addProposal / listProposals", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-mcp-"));
    try {
      const add = toolHandler("tied_leap_proposal_add");
      const addRes = await add({
        project_root: dir,
        title: "Composition",
        summary: "Body",
      });
      const addBody = parseMcpJson(addRes);
      assert.equal(addBody.ok, true);
      const pid = (addBody.proposal as { id: string }).id;
      assert.ok(pid.length > 0);

      const list = toolHandler("tied_leap_proposal_list");
      const listRes = await list({ project_root: dir });
      const listBody = parseMcpJson(listRes);
      assert.equal(listBody.ok, true);
      assert.equal(listBody.count, 1);
      const proposals = listBody.proposals as Array<{ id: string }>;
      assert.equal(proposals[0]?.id, pid);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("MCP_HANDLER tied_leap_proposal_list — status filter delegates to listProposals", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-mcp-"));
    try {
      const add = toolHandler("tied_leap_proposal_add");
      await add({ project_root: dir, title: "P", summary: "S" });
      const listPending = toolHandler("tied_leap_proposal_list");
      const pendingBody = parseMcpJson(await listPending({ project_root: dir, status: "pending" }));
      assert.equal(pendingBody.ok, true);
      assert.equal(pendingBody.count, 1);
      const listApproved = toolHandler("tied_leap_proposal_list");
      const approvedBody = parseMcpJson(await listApproved({ project_root: dir, status: "approved" }));
      assert.equal(approvedBody.ok, true);
      assert.equal(approvedBody.count, 0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("MCP_HANDLER tied_leap_proposal_reject — unknown id returns ok false via rejectProposal", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-mcp-"));
    try {
      const handler = toolHandler("tied_leap_proposal_reject");
      const res = await handler({ project_root: dir, proposal_id: "nonexistent-id" });
      const body = parseMcpJson(res);
      assert.equal(body.ok, false);
      assert.ok(String(body.error).includes("No proposal"));
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("MCP_HANDLER tied_leap_proposal_approve → tied_leap_proposal_mark_applied wires module lifecycle", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-mcp-"));
    try {
      const add = toolHandler("tied_leap_proposal_add");
      const addBody = parseMcpJson(
        await add({ project_root: dir, title: "Life", summary: "Cycle", suggested_leap_order: "impl" })
      );
      assert.equal(addBody.ok, true);
      const pid = (addBody.proposal as { id: string }).id;

      const approve = toolHandler("tied_leap_proposal_approve");
      const appBody = parseMcpJson(await approve({ project_root: dir, proposal_id: pid, note: "ok" }));
      assert.equal(appBody.ok, true);
      assert.equal((appBody.proposal as { status: string }).status, "approved");

      const mark = toolHandler("tied_leap_proposal_mark_applied");
      const markBody = parseMcpJson(await mark({ project_root: dir, proposal_id: pid }));
      assert.equal(markBody.ok, true);
      assert.equal((markBody.proposal as { status: string }).status, "applied");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("MCP_HANDLER tied_leap_proposal_update — pending title edit via updatePendingProposal", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-mcp-"));
    try {
      const add = toolHandler("tied_leap_proposal_add");
      const addBody = parseMcpJson(await add({ project_root: dir, title: "Old", summary: "S" }));
      const pid = (addBody.proposal as { id: string }).id;

      const update = toolHandler("tied_leap_proposal_update");
      const upBody = parseMcpJson(
        await update({ project_root: dir, proposal_id: pid, title: "NewTitle" })
      );
      assert.equal(upBody.ok, true);
      assert.equal((upBody.proposal as { title: string }).title, "NewTitle");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("MCP_HANDLER tied_leap_proposal_queue_snapshot — BOM-prefixed queue.json loads via LOAD_QUEUE", async () => {
    // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-mcp-"));
    try {
      const add = toolHandler("tied_leap_proposal_add");
      const addBody = parseMcpJson(await add({ project_root: dir, title: "Snap", summary: "BOM" }));
      const pid = (addBody.proposal as { id: string }).id;
      const qp = getQueuePath(dir);
      const raw = fs.readFileSync(qp, "utf8");
      fs.writeFileSync(qp, `\uFEFF${raw}`, "utf8");

      const snap = toolHandler("tied_leap_proposal_queue_snapshot");
      const body = parseMcpJson(await snap({ project_root: dir })) as {
        schema_version: string;
        proposals: Array<{ id: string }>;
      };
      assert.equal(body.schema_version, LEAP_PROPOSAL_QUEUE_SCHEMA);
      assert.equal(body.proposals.length, 1);
      assert.equal(body.proposals[0]?.id, pid);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
