import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  emitResearchDatasetRecord,
  evaluateResearchFreshness,
  normalizeResearchRecord,
  type ResearchRecordInput,
} from "./research-records.js";

const provenance = {
  revision: "abc123",
  environment: "ci",
  command: "npm test",
  result: "pass",
  artifacts: ["artifacts/benchmark.json"],
};

function input(overrides: Partial<ResearchRecordInput> = {}): ResearchRecordInput {
  return {
    record_type: "benchmark",
    source: "internal benchmark",
    source_date: "2026-08-01",
    method: "controlled benchmark",
    conclusion: "Option A is faster",
    uncertainty: "Sample is small",
    affected_decisions: {
      architecture: ["ARCH-TIED_RESEARCH_RECORD_BOUNDARY"],
      implementation: ["IMPL-TIED_RESEARCH_RECORDS"],
    },
    evidence_provenance: provenance,
    classification: "candidate_finding",
    freshness_policy: { max_age_days: 30, unknown_date: "freshness_unknown" },
    ...overrides,
  };
}

describe("research records [REQ-TIED_RESEARCH_RECORDS]", () => {
  it("normalizes supported records and preserves distinct classifications", () => {
    const result = normalizeResearchRecord(input({ classification: "accepted_uncertainty" }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.record.classification, "accepted_uncertainty");
  });

  it("rejects missing provenance and invalid decision links", () => {
    const missing = normalizeResearchRecord(input({ evidence_provenance: undefined }));
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.error, "MissingProvenance");
    const invalid = normalizeResearchRecord(
      input({ affected_decisions: { architecture: ["REQ-NOT-ARCH"], implementation: [] } }),
    );
    assert.equal(invalid.ok, false);
    if (!invalid.ok) assert.equal(invalid.error, "InvalidDecisionLink");
  });

  it("classifies current, stale, and unknown freshness deterministically", () => {
    const record = normalizeResearchRecord(input({ source_date: "2026-08-01" }));
    assert.equal(record.ok, true);
    if (!record.ok) return;
    assert.equal(evaluateResearchFreshness(record.record, "2026-08-13").status, "current");
    assert.equal(evaluateResearchFreshness(record.record, "2026-10-01").status, "stale");
    assert.equal(
      evaluateResearchFreshness(
        { ...record.record, source_date: undefined },
        "2026-08-13",
      ).status,
      "freshness_unknown",
    );
  });

  it("emits external append-only records and rejects audited tied paths", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "research-records-"));
    try {
      const record = normalizeResearchRecord(input());
      assert.equal(record.ok, true);
      if (!record.ok) return;
      const freshness = evaluateResearchFreshness(record.record, "2026-08-13");
      const emitted = emitResearchDatasetRecord(record.record, freshness, {
        auditedProjectRoot: path.join(root, "project"),
        datasetPath: path.join(root, "external", "research.jsonl"),
      });
      assert.equal(emitted.ok, true);
      assert.equal(fs.readFileSync(path.join(root, "external", "research.jsonl"), "utf8").split("\n").length, 2);
      const rejected = emitResearchDatasetRecord(record.record, freshness, {
        auditedProjectRoot: path.join(root, "project"),
        datasetPath: path.join(root, "project", "tied", "research.jsonl"),
      });
      assert.equal(rejected.ok, false);
      if (!rejected.ok) assert.equal(rejected.error, "AuditedProjectWrite");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
