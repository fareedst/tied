/**
 * Tests for mergeRecordUpdate (TIED MCP detail/index partial updates).
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { mergeRecordUpdate } from "./record-merge.js";

describe("mergeRecordUpdate", () => {
  it("deep-merges metadata preserving created when only last_updated sent", () => {
    const existing = {
      name: "X",
      metadata: { created: "2026-01-01", last_updated: "old", registered: true },
    };
    const updates = { metadata: { last_updated: "2026-04-21", reason: "gate" } };
    const merged = mergeRecordUpdate(existing, updates);
    assert.deepStrictEqual(merged.metadata, {
      created: "2026-01-01",
      last_updated: "2026-04-21",
      registered: true,
      reason: "gate",
    });
    assert.strictEqual(merged.name, "X");
  });

  it("deep-merges traceability preserving other branches", () => {
    const existing = {
      traceability: {
        architecture: ["ARCH-A"],
        implementation: ["IMPL-1"],
        tests: ["t1"],
      },
    };
    const updates = { traceability: { architecture: ["ARCH-A", "ARCH-B"] } };
    const merged = mergeRecordUpdate(existing, updates);
    assert.deepStrictEqual(merged.traceability, {
      architecture: ["ARCH-A", "ARCH-B"],
      implementation: ["IMPL-1"],
      tests: ["t1"],
    });
  });

  it("replaces non-whitelisted top-level keys shallowly", () => {
    const existing = { status: "Planned", name: "N" };
    const merged = mergeRecordUpdate(existing, { status: "Implemented" });
    assert.deepStrictEqual(merged, { status: "Implemented", name: "N" });
  });

  it("sets metadata from scratch when existing had no metadata", () => {
    const merged = mergeRecordUpdate({ name: "Y" }, { metadata: { last_updated: "t" } });
    assert.deepStrictEqual(merged.metadata, { last_updated: "t" });
  });

  it("deep-merges related_requirements object", () => {
    const existing = {
      related_requirements: { depends_on: ["REQ-A"], related_to: [] },
    };
    const merged = mergeRecordUpdate(existing, {
      related_requirements: { related_to: ["REQ-B"] },
    });
    assert.deepStrictEqual(merged.related_requirements, {
      depends_on: ["REQ-A"],
      related_to: ["REQ-B"],
    });
  });

  it("merges metadata.last_updated object fields without dropping date or author", () => {
    const existing = {
      metadata: {
        created: "2026-01-01",
        last_updated: { date: "2026-04-20", author: "A" },
      },
    };
    const merged = mergeRecordUpdate(existing, {
      metadata: { last_updated: { reason: "gate" } },
    });
    assert.deepStrictEqual(merged.metadata, {
      created: "2026-01-01",
      last_updated: { date: "2026-04-20", author: "A", reason: "gate" },
    });
  });

  it("merges metadata.last_validated object fields when both are objects", () => {
    const existing = {
      metadata: {
        last_validated: { date: "d1", pass: true },
      },
    };
    const merged = mergeRecordUpdate(existing, {
      metadata: { last_validated: { reason: "sync" } },
    });
    const meta = merged.metadata as Record<string, unknown>;
    assert.deepStrictEqual(meta.last_validated, {
      date: "d1",
      pass: true,
      reason: "sync",
    });
  });

  it("deep-merges rationale preserving sibling keys", () => {
    const existing = {
      rationale: {
        why: "original",
        problems_solved: ["p1"],
        benefits: ["b1"],
      },
    };
    const merged = mergeRecordUpdate(existing, {
      rationale: { why: "revised" },
    });
    assert.deepStrictEqual(merged.rationale, {
      why: "revised",
      problems_solved: ["p1"],
      benefits: ["b1"],
    });
  });

  it("deep-merges implementation_approach preserving summary when details updated", () => {
    const existing = {
      implementation_approach: {
        summary: "One script",
        details: ["a", "b"],
      },
    };
    const merged = mergeRecordUpdate(existing, {
      implementation_approach: { details: ["a", "b", "c"] },
    });
    assert.deepStrictEqual(merged.implementation_approach, {
      summary: "One script",
      details: ["a", "b", "c"],
    });
  });
});
