/**
 * [REQ-LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [IMPL-MCP_LEAP_PROPOSAL_QUEUE]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  addProposal,
  approveProposal,
  findProposal,
  getAuditLogPath,
  getQueuePath,
  LEAP_PROPOSAL_AUDIT_SCHEMA,
  LEAP_PROPOSAL_QUEUE_SCHEMA,
  loadQueue,
  markApplied,
  parseSessionExportSegments,
  proposalsFromSessionSegments,
  rejectProposal,
  updatePendingProposal,
} from "./leap-proposal-queue.js";

test("queue: reject unknown id returns ok false (No proposal branch)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-"));
  try {
    const r = rejectProposal(dir, "nonexistent-id", "reason");
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("No proposal"));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("queue: reject does not mutate yaml outside queue", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-"));
  try {
    const p = addProposal(dir, {
      kind: "manual",
      title: "Test",
      summary: "Body",
      source: { type: "manual" },
    });
    assert.equal(p.status, "pending");
    const r = rejectProposal(dir, p.id, "no");
    assert.equal(r.ok, true);
    assert.equal(r.proposal?.status, "rejected");
    const q = loadQueue(dir);
    assert.equal(q.proposals.length, 1);
    assert.equal(q.proposals[0].status, "rejected");
    const auditLog = fs.readFileSync(getAuditLogPath(dir), "utf8");
    assert.ok(auditLog.includes('"action":"reject"'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("queue: approve then mark_applied", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-"));
  try {
    const p = addProposal(dir, {
      kind: "manual",
      title: "Test",
      summary: "Body",
      source: { type: "manual" },
    });
    assert.equal(approveProposal(dir, p.id, "ok").ok, true);
    assert.equal(findProposal(loadQueue(dir), p.id)?.status, "approved");
    assert.equal(markApplied(dir, p.id).ok, true);
    assert.equal(findProposal(loadQueue(dir), p.id)?.status, "applied");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("queue: edit pending only", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-"));
  try {
    const p = addProposal(dir, {
      kind: "manual",
      title: "Test",
      summary: "Body",
      source: { type: "manual" },
    });
    assert.equal(updatePendingProposal(dir, p.id, { title: "x" }).ok, true);
    assert.equal(findProposal(loadQueue(dir), p.id)?.title, "x");
    approveProposal(dir, p.id);
    assert.equal(updatePendingProposal(dir, p.id, { title: "y" }).ok, false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("PROPOSALS_FROM_SESSION_SEGMENTS REQ-LEAP_PROPOSAL_QUEUE — trims segment text in summary output", () => {
  // [REQ-LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [IMPL-MCP_LEAP_PROPOSAL_QUEUE]
  // Validates PROPOSALS_FROM_SESSION_SEGMENTS: each mapped proposal uses trimmed segment text as summary (stable inferred_session output).
  const out = proposalsFromSessionSegments(["  hello world  "], "unit");
  assert.equal(out.length, 1);
  assert.equal(out[0].summary, "hello world");
});

test("session export: split by --- and JSON array", () => {
  parseSessionExportSegments("a\n---\nb\n").forEach((s, i) => {
    if (i === 0) assert.equal(s, "a");
    if (i === 1) assert.equal(s, "b");
  });
  const j = JSON.stringify([{ content: "hello" }, { content: "world" }]);
  const segs = parseSessionExportSegments(j);
  assert.equal(segs.length, 2);
  assert.equal(segs[0], "hello");
});

test("LOAD_QUEUE REQ-LEAP_PROPOSAL_QUEUE — UTF-8 BOM prefixed valid queue.json loads proposals", () => {
  // [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  // Validates LOAD_QUEUE OUTPUT: after reading queue.json, proposals from disk are visible when the file is
  // valid JSON with leap-proposal-queue.v1 — BOM is a common editor prefix and must not force an empty queue.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-"));
  try {
    const created = addProposal(dir, {
      kind: "manual",
      title: "BOMCase",
      summary: "Body",
      source: { type: "manual" },
    });
    const qp = getQueuePath(dir);
    const raw = fs.readFileSync(qp, "utf8");
    fs.writeFileSync(qp, `\uFEFF${raw}`, "utf8");
    const q = loadQueue(dir);
    assert.equal(q.proposals.length, 1, "expected one proposal after BOM-prefixed valid queue.json");
    assert.equal(findProposal(q, created.id)?.title, "BOMCase");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("queue file schema", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpq-"));
  try {
    addProposal(dir, {
      kind: "manual",
      title: "T",
      summary: "S",
      source: { type: "manual" },
    });
    const raw = fs.readFileSync(getQueuePath(dir), "utf8");
    const data = JSON.parse(raw) as { schema_version: string };
    assert.equal(data.schema_version, LEAP_PROPOSAL_QUEUE_SCHEMA);
    const audit = fs.readFileSync(getAuditLogPath(dir), "utf8").trim().split("\n");
    const first = JSON.parse(audit[0]!) as { schema_version: string };
    assert.equal(first.schema_version, LEAP_PROPOSAL_AUDIT_SCHEMA);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
