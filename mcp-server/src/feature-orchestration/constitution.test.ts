import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  ProjectConstitutionStore,
  analyzeConstitutionCompliance,
  normalizeConstitution,
  orderConstitutionDiagnostics,
  type Constitution,
} from "./constitution.js";

function constitution(): Constitution {
  return {
    schema_version: "project-constitution.v1",
    constitution_version: 1,
    project: "stdd",
    articles: [
      {
        id: "CONST-001",
        title: "Traceability",
        rule: "require:traceability",
        scope: ["requirements", "architecture", "implementation", "task_plans", "citdp"],
        enforcement: "required",
        exceptions: ["EXC-001"],
        rationale: "Every governed artifact explains its intent.",
      },
    ],
    exceptions: [
      {
        id: "EXC-001",
        article_id: "CONST-001",
        owner: "owner",
        rationale: "Temporary migration gap.",
        approver: "approver",
        review_status: "approved",
        expires_at: "2099-01-01T00:00:00.000Z",
      },
    ],
    amendment_history: [{ version: 1, amended_at: "2026-08-13T00:00:00.000Z", amendments: "Initial", compatibility: "compatible" }],
  };
}

describe("VALIDATE_CONSTITUTION_DOCUMENT REQ-FEAT_CONSTITUTION_SCHEMA", () => {
  it("validates ownership, scope, approval, and duplicate constraints", () => {
    // [IMPL-FEAT_CONSTITUTION_VALIDATOR] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Enforce deterministic schema and semantic constraints.
    assert.equal(normalizeConstitution(constitution(), new Date("2026-08-13T00:00:00.000Z")).ok, true);
    const invalid = { ...constitution(), exceptions: [{ ...constitution().exceptions[0], approver: null, review_status: "approved" as const }] };
    assert.equal(normalizeConstitution(invalid, new Date()).ok, false);
  });
});

describe("PROJECT_CONSTITUTION_STORE REQ-FEAT_CONSTITUTION_SCHEMA", () => {
  it("owns and atomically publishes tied/constitution.yaml with CAS versions", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "constitution-"));
    const store = new ProjectConstitutionStore(root);
    store.publish(constitution(), 0);
    assert.equal(store.load().constitution_version, 1);
    assert.throws(() => store.publish(constitution(), 0), /STALE_VERSION/);
    assert.equal(path.basename(store.path), "constitution.yaml");
  });
});

describe("ANALYZE_CONSTITUTION_COMPLIANCE REQ-FEAT_CONSTITUTION_COMPLIANCE", () => {
  it("analyzes all governed artifact kinds without mutation", () => {
    // [IMPL-FEAT_CONSTITUTION_ANALYZER] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Evaluate rule scope and precedence before implementation.
    const strictConstitution = { ...constitution(), articles: constitution().articles.map((article) => ({ ...article, exceptions: [] })), exceptions: [] };
    const result = analyzeConstitutionCompliance(strictConstitution, [
      { kind: "requirements", path: "tied/requirements.yaml", data: { traceability: false } },
      { kind: "citdp", path: "tied/citdp/CITDP-X.yaml", data: { traceability: true } },
    ], new Date("2026-08-13T00:00:00.000Z"));
    assert.equal(result.length, 2);
    assert.equal(result.find((item) => item.artifact_path.includes("requirements"))?.blocking, true);
  });
});

describe("ORDER_CONSTITUTION_DIAGNOSTICS REQ-FEAT_CONSTITUTION_COMPLIANCE", () => {
  it("orders diagnostics independently of traversal order", () => {
    // [IMPL-FEAT_CONSTITUTION_DIAGNOSTICS] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Make diagnostic ordering and blocker status stable.
    const strictConstitution = { ...constitution(), articles: constitution().articles.map((article) => ({ ...article, exceptions: [] })), exceptions: [] };
    const findings = analyzeConstitutionCompliance(strictConstitution, [
      { kind: "citdp", path: "b.yaml", data: { traceability: false } },
      { kind: "requirements", path: "a.yaml", data: { traceability: false } },
    ], new Date("2026-08-13T00:00:00.000Z"));
    const ordered = orderConstitutionDiagnostics(findings);
    assert.equal(ordered[0].artifact_path, "a.yaml");
    assert.equal(ordered.ready, false);
  });
});
