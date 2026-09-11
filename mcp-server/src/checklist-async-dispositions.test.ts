/**
 * [REQ-ASYNC_CHECKLIST_CATALOG] [ARCH-ASYNC_CHECKLIST_INTEGRATION] [IMPL-ASYNC_CHECKLIST_DISPOSITIONS]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";

import {
  ASYNC_CATALOG_COLUMNS,
  type AsyncCatalogRow,
  buildEmptyAsyncCatalogRows,
  detectAsyncContradictions,
  detectAsyncInScope,
  INTEGRATED_ASYNC_INQUIRY_CASES,
  validateAsyncCatalogTable,
  validateAsyncInScopeTracker,
} from "./checklist-async-dispositions.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const CHECKLIST_YAML = path.join(REPO_ROOT, "tied/docs/agent-req-implementation-checklist.yaml");
const CHECKLIST_MD = path.join(REPO_ROOT, "tied/docs/agent-req-implementation-checklist.md");
const PILOT_AFTER_T0 = path.join(
  REPO_ROOT,
  "working/REQ-TIED_ASYNC_METHODOLOGY/pilot/after-t0/IMPL-GOAGENT-EXECUTOR-with-async-rows.md",
);

const POSITIVE_PSEUDOCODE = fs.readFileSync(PILOT_AFTER_T0, "utf8");

function closedCatalogRow(block: string, overrides: Partial<AsyncCatalogRow> = {}): AsyncCatalogRow {
  const row = Object.fromEntries(
    ASYNC_CATALOG_COLUMNS.map((column) => [column, column === "Block" ? block : "documented"]),
  ) as AsyncCatalogRow;
  return { ...row, ...overrides, Block: block };
}

describe("ASYNC_CATALOG_COLUMNS [REQ-ASYNC_CHECKLIST_CATALOG]", () => {
  it("defines the W2 closed catalog table columns", () => {
    assert.deepEqual(ASYNC_CATALOG_COLUMNS, [
      "Block",
      "Boundary kind",
      "Await/message/event",
      "Timeout",
      "Cancellation",
      "Retry/idempotency",
      "Shared DATA",
      "Termination/order",
    ]);
  });
});

describe("detectAsyncInScope [REQ-ASYNC_CHECKLIST_CATALOG]", () => {
  it("returns false for legacy sync-only pseudocode", () => {
    const result = detectAsyncInScope("procedure SYNC_ONLY:\n  RETURN ok");
    assert.equal(result.async_in_scope, false);
    assert.deepEqual(result.matched_semantic_classes, []);
  });

  it("returns true with matched semantic classes for async pilot", () => {
    const result = detectAsyncInScope(POSITIVE_PSEUDOCODE);
    assert.equal(result.async_in_scope, true);
    assert.ok(result.matched_semantic_classes.includes("await_sequencing"));
    assert.ok(result.matched_semantic_classes.includes("timeout"));
  });
});

describe("validateAsyncCatalogTable [REQ-ASYNC_CHECKLIST_CATALOG]", () => {
  it("passes when every async block has a closed catalog row", () => {
    const result = validateAsyncCatalogTable({
      pseudocode: POSITIVE_PSEUDOCODE,
      catalog_rows: [closedCatalogRow("executor_Run", {
        "Boundary kind": "await",
        "Await/message/event": "AWAIT wait_process",
        Timeout: "30s → TIMEOUT_EXCEEDED",
        Cancellation: "caller → CANCELLED",
        "Retry/idempotency": "N/A",
        "Shared DATA": "session_id DATA_TRANSITION",
        "Termination/order": "total on process exit",
      })],
    });
    assert.equal(result.ok, true);
    assert.equal(result.async_in_scope, true);
  });

  it("fails when an async block is missing a catalog row", () => {
    const result = validateAsyncCatalogTable({
      pseudocode: POSITIVE_PSEUDOCODE,
      catalog_rows: [],
    });
    assert.equal(result.ok, false);
    assert.ok(result.findings.some((finding) => finding.code === "ASYNC_CATALOG_ROW_MISSING"));
    assert.equal(result.findings[0]?.route_to, "catalog-async-boundaries");
  });

  it("does not require catalog rows when async is not in scope", () => {
    const result = validateAsyncCatalogTable({
      pseudocode: "procedure LEGACY_SYNC:\n  RETURN ok",
      catalog_rows: [],
    });
    assert.equal(result.ok, true);
    assert.equal(result.async_in_scope, false);
  });
});

describe("detectAsyncContradictions [REQ-ASYNC_CHECKLIST_CATALOG]", () => {
  it("flags AWAIT without Async EFFECTS when typed evidence is available", () => {
    const findings = detectAsyncContradictions({
      pseudocode: `procedure BAD_AWAIT:
  Contract:
    OUTPUT: session_id
    EFFECTS: IO
  AWAIT wait_process`,
      typed_evidence_available: true,
    });
    assert.ok(findings.some((finding) => finding.code === "AWAIT_WITHOUT_ASYNC_EFFECTS"));
    assert.equal(findings[0]?.route_to, "flag-async-contradictions");
  });

  it("flags Async EFFECTS without boundary rationale", () => {
    const findings = detectAsyncContradictions({
      pseudocode: `procedure FIRE_AND_FORGET:
  Contract:
    OUTPUT: ok
    EFFECTS: Async, IO`,
    });
    assert.ok(findings.some((finding) => finding.code === "ASYNC_EFFECTS_WITHOUT_BOUNDARY"));
  });

  it("flags retry without idempotency", () => {
    const findings = detectAsyncContradictions({
      pseudocode: `procedure RETRY_BAD:
  Contract:
    RETRY: 2 attempts
    AWAIT remote_call`,
    });
    assert.ok(findings.some((finding) => finding.code === "RETRY_WITHOUT_IDEMPOTENCY"));
    assert.equal(
      findings.find((finding) => finding.code === "RETRY_WITHOUT_IDEMPOTENCY")?.route_to,
      "flag-async-contradictions",
    );
  });

  it("warns on REQ timeout missing from IMPL at Phase B and errors at verification", () => {
    const phaseB = detectAsyncContradictions({
      pseudocode: POSITIVE_PSEUDOCODE.replace(/TIMEOUT:[^\n]+\n/, ""),
      req_declares_timeout: true,
      phase: "phase_b",
    });
    const verification = detectAsyncContradictions({
      pseudocode: POSITIVE_PSEUDOCODE.replace(/TIMEOUT:[^\n]+\n/, ""),
      req_declares_timeout: true,
      phase: "verification",
    });
    assert.equal(phaseB[0]?.severity, "warning");
    assert.equal(verification[0]?.severity, "error");
  });

  it("routes SEQUENCING mismatch to resolve-pseudocode", () => {
    const findings = detectAsyncContradictions({
      pseudocode: "procedure CALLER:\n  SEQUENCING: A before B",
      caller_pseudocode: "procedure CALLER:\n  SEQUENCING: A before B\n  CONTROL: ordering spawn before wait",
      callee_pseudocode: "procedure CALLEE:\n  SEQUENCING: B before A\n  CONTROL: ordering wait before spawn",
    });
    assert.ok(findings.some((finding) => finding.code === "SEQUENCING_CONTROL_MISMATCH"));
    assert.equal(findings[0]?.route_to, "resolve-pseudocode");
  });
});

describe("validateAsyncInScopeTracker [ARCH-ASYNC_CHECKLIST_INTEGRATION]", () => {
  it("requires async_in_scope boolean on Tracker", () => {
    const missing = validateAsyncInScopeTracker({ steps: [] });
    assert.equal(missing.ok, false);
    assert.ok(missing.diagnostics.includes("async_in_scope_missing"));

    const valid = validateAsyncInScopeTracker({
      async_in_scope: false,
      steps: [],
    });
    assert.equal(valid.ok, true);
  });

  it("requires matched semantic classes when async_in_scope is true and forbids inquiry activation", () => {
    const missingClasses = validateAsyncInScopeTracker({ async_in_scope: true });
    assert.ok(missingClasses.diagnostics.includes("async_matched_semantic_classes_missing"));

    const activated = validateAsyncInScopeTracker({
      async_in_scope: true,
      async_matched_semantic_classes: ["timeout"],
      async_inquiry_activated: true,
    });
    assert.ok(activated.diagnostics.includes("async_inquiry_must_not_activate_from_async_in_scope"));
  });
});

describe("CHECKLIST_ASYNC_YAML_MD_PARITY [REQ-ASYNC_CHECKLIST_CATALOG]", () => {
  const ASYNC_SLUG_MARKERS: Array<{ slug: string; markers: string[] }> = [
    { slug: "impact-discovery", markers: ["async_in_scope", "candidate trigger"] },
    { slug: "catalog-pseudocode-contracts", markers: ["catalog-async-boundaries", "Boundary kind"] },
    { slug: "flag-insufficient-specs", markers: ["catalog-async-boundaries", "async catalog row"] },
    { slug: "flag-contradictory-specs", markers: ["flag-async-contradictions", "SEQUENCING"] },
    { slug: "gate-pseudocode-validation", markers: ["timeout without FAILURE_MODE", "retry without duplicate"] },
  ];

  type ChecklistDoc = { steps?: Array<{ slug?: string; tasks?: string[] }> };

  function loadChecklistYaml(): ChecklistDoc {
    return yaml.load(fs.readFileSync(CHECKLIST_YAML, "utf8")) as ChecklistDoc;
  }

  function yamlTasksForSlug(doc: ChecklistDoc, slug: string): string[] {
    const step = doc.steps?.find((entry) => entry.slug === slug);
    assert.ok(step, `YAML missing step slug ${slug}`);
    return step?.tasks ?? [];
  }

  function extractMarkdownSection(markdown: string, slug: string): string {
    const patterns = [
      new RegExp(`^## ${slug} \\(${slug}\\):`, "m"),
      new RegExp(`^### ${slug} \\(${slug}\\):`, "m"),
      new RegExp(`^#### catalog-async-boundaries`, "m"),
      new RegExp(`^#### flag-async-contradictions`, "m"),
    ];
    let match: RegExpExecArray | null = null;
    for (const pattern of patterns) {
      match = pattern.exec(markdown);
      if (match) break;
    }
    if (slug === "catalog-pseudocode-contracts") {
      const catalogSection = markdown.match(/#### catalog-async-boundaries[\s\S]*?(?=^#{2,4} |\Z)/m);
      if (catalogSection) return catalogSection[0];
    }
    if (slug === "flag-contradictory-specs") {
      const flagSection = markdown.match(/#### flag-async-contradictions[\s\S]*?(?=^#{2,4} |\Z)/m);
      if (flagSection) return flagSection[0];
    }
    assert.ok(match, `Markdown missing section header for ${slug}`);
    const start = match.index;
    const headerLineEnd = markdown.indexOf("\n", start);
    const bodyStart = headerLineEnd === -1 ? markdown.length : headerLineEnd + 1;
    const rest = markdown.slice(bodyStart);
    const nextSection = rest.search(/^#{2,4} /m);
    const end = nextSection === -1 ? markdown.length : bodyStart + nextSection;
    return markdown.slice(start, end);
  }

  const doc = loadChecklistYaml();
  const markdown = fs.readFileSync(CHECKLIST_MD, "utf8");

  for (const { slug, markers } of ASYNC_SLUG_MARKERS) {
    it(`keeps async marker parity for ${slug}`, () => {
      const yamlTasks = yamlTasksForSlug(doc, slug);
      const yamlBody = yamlTasks.join("\n").toLowerCase();
      const mdSection = extractMarkdownSection(markdown, slug).toLowerCase();
      for (const marker of markers) {
        assert.ok(yamlBody.includes(marker.toLowerCase()), `${slug}: YAML missing ${marker}`);
        assert.ok(mdSection.includes(marker.toLowerCase()), `${slug}: Markdown missing ${marker}`);
      }
    });
  }
});

describe("legacy regression [REQ-ASYNC_CHECKLIST_CATALOG]", () => {
  it("buildEmptyAsyncCatalogRows returns no rows for sync-only pseudocode", () => {
    assert.deepEqual(buildEmptyAsyncCatalogRows("procedure SYNC:\n  RETURN 1"), []);
  });

  it("documents integrated inquiry cases without MCP wiring", () => {
    assert.equal(INTEGRATED_ASYNC_INQUIRY_CASES.length, 4);
  });
});
