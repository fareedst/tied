/**
 * Unit tests for feedback module. [REQ-FEEDBACK_TO_TIED] [ARCH-FEEDBACK_STORAGE] [IMPL-MCP_FEEDBACK_TOOLS]
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getFeedbackPath,
  loadFeedback,
  appendEntry,
  exportMarkdown,
  exportJson,
  buildReportSnippet,
  type FeedbackEntry,
} from "./feedback.js";

describe("getFeedbackPath", () => {
  it("returns path ending with feedback.yaml under base [ARCH-FEEDBACK_STORAGE]", () => {
    const p = getFeedbackPath("/tmp/tied");
    assert.ok(p.endsWith("feedback.yaml"));
    assert.ok(p.includes("tied"));
  });
});

describe("loadFeedback", () => {
  it("returns { entries: [] } when file does not exist [IMPL-MCP_FEEDBACK_TOOLS]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-fb-"));
    try {
      const data = loadFeedback(dir);
      assert.deepStrictEqual(data, { entries: [] });
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("loads existing entries from YAML file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-fb-"));
    const filePath = path.join(dir, "feedback.yaml");
    const content = `
entries:
  - id: fb-1
    type: feature_request
    title: Test
    description: Desc
    created_at: "2026-03-03T12:00:00.000Z"
`;
    fs.writeFileSync(filePath, content, "utf8");
    try {
      const data = loadFeedback(dir);
      assert.strictEqual(data.entries.length, 1);
      assert.strictEqual(data.entries[0].id, "fb-1");
      assert.strictEqual(data.entries[0].type, "feature_request");
      assert.strictEqual(data.entries[0].title, "Test");
      assert.strictEqual(data.entries[0].description, "Desc");
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("returns { entries: [] } for invalid or empty file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-fb-"));
    const filePath = path.join(dir, "feedback.yaml");
    fs.writeFileSync(filePath, "not: valid: yaml: [", "utf8");
    try {
      const data = loadFeedback(dir);
      assert.deepStrictEqual(data, { entries: [] });
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("appendEntry", () => {
  it("creates file and appends entry with id and created_at [REQ-FEEDBACK_TO_TIED]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-fb-"));
    try {
      const result = appendEntry(
        { type: "bug_report", title: "Bug title", description: "Bug description" },
        dir
      );
      assert.strictEqual(result.ok, true);
      assert.ok(result.id?.startsWith("fb-"));
      assert.ok(result.created_at);
      const data = loadFeedback(dir);
      assert.strictEqual(data.entries.length, 1);
      assert.strictEqual(data.entries[0].type, "bug_report");
      assert.strictEqual(data.entries[0].title, "Bug title");
      assert.strictEqual(data.entries[0].description, "Bug description");
      assert.strictEqual(data.entries[0].id, result.id);
      assert.strictEqual(data.entries[0].created_at, result.created_at);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("rejects invalid type", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-fb-"));
    try {
      const result = appendEntry(
        { type: "invalid" as "feature_request", title: "T", description: "D" },
        dir
      );
      assert.strictEqual(result.ok, false);
      assert.ok(result.error?.includes("Invalid type"));
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("rejects empty title", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-fb-"));
    try {
      const result = appendEntry(
        { type: "feature_request", title: "  ", description: "Desc" },
        dir
      );
      assert.strictEqual(result.ok, false);
      assert.ok(result.error?.toLowerCase().includes("title"));
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("rejects empty description", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-fb-"));
    try {
      const result = appendEntry(
        { type: "methodology_improvement", title: "Title", description: "" },
        dir
      );
      assert.strictEqual(result.ok, false);
      assert.ok(result.error?.toLowerCase().includes("description"));
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("includes optional context in entry", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-fb-"));
    try {
      appendEntry(
        {
          type: "feature_request",
          title: "T",
          description: "D",
          context: { project_id: "p1", tied_version: "2.2.0" },
        },
        dir
      );
      const data = loadFeedback(dir);
      assert.strictEqual(data.entries.length, 1);
      assert.deepStrictEqual(data.entries[0].context, { project_id: "p1", tied_version: "2.2.0" });
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("exportMarkdown", () => {
  it("formats entries with title, description, type [REQ-FEEDBACK_TO_TIED]", () => {
    const entries: FeedbackEntry[] = [
      {
        id: "fb-1",
        type: "feature_request",
        title: "Add X",
        description: "We need X.",
        created_at: "2026-03-03T12:00:00.000Z",
      },
    ];
    const md = exportMarkdown(entries);
    assert.ok(md.includes("## feature_request: Add X"));
    assert.ok(md.includes("We need X."));
    assert.ok(md.includes("fb-1"));
  });

  it("returns placeholder when entries empty", () => {
    const md = exportMarkdown([]);
    assert.ok(md.includes("No feedback entries"));
  });
});

describe("exportJson", () => {
  it("returns valid JSON array of entries", () => {
    const entries: FeedbackEntry[] = [
      {
        id: "fb-1",
        type: "bug_report",
        title: "Bug",
        description: "Desc",
        created_at: "2026-03-03T12:00:00.000Z",
      },
    ];
    const json = exportJson(entries);
    const parsed = JSON.parse(json) as FeedbackEntry[];
    assert.strictEqual(parsed.length, 1);
    assert.strictEqual(parsed[0].id, "fb-1");
  });
});

describe("buildReportSnippet", () => {
  it("includes type, title, description and optional context", () => {
    const entry: FeedbackEntry = {
      id: "fb-1",
      type: "methodology_improvement",
      title: "Improve process",
      description: "Suggestion text",
      context: { area: "processes" },
      created_at: "2026-03-03T12:00:00.000Z",
    };
    const snippet = buildReportSnippet(entry);
    assert.ok(snippet.includes("### methodology_improvement: Improve process"));
    assert.ok(snippet.includes("Suggestion text"));
    assert.ok(snippet.includes("area"));
  });
});
