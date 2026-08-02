import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { describe, it } from "node:test";
import os from "node:os";
import path from "node:path";

import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function handler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`MCP tool not registered: ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function body(result: TextContent): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

describe("quality validation MCP bindings [PROC-QUALITY_ASSURANCE]", () => {
  it("wires manifest construction through a UI-free handler", async () => {
    // [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Build a deterministic machine-derived verification evidence manifest while keeping human risk decisions separate.
    const result = await handler("quality_evidence_manifest_build")({
      run_id: "run-001",
      commit: "abc123",
      environment: {},
      command_results: [
        {
          id: "unit",
          command: "npm test",
          cwd: "/repo",
          exit_code: 0,
          result: "passed",
        },
      ],
      quality_rows: [],
      covered_tokens: [],
      proof_boundaries: ["machine result only"],
    });

    const value = body(result) as { schema_version?: string; human_decisions?: { stored_separately: boolean } };
    assert.equal(value.schema_version, "verification-evidence-manifest.v1");
    assert.equal(value.human_decisions?.stored_separately, true);
  });

  it("wires the Layer B pseudo-code validator", async () => {
    // [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Validate registered pseudo-code structure through the MCP composition boundary.
    const result = await handler("pseudocode_validate")({
      token: "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
      known_tokens: ["IMPL-QUALITY_PSEUDOCODE_VALIDATOR", "ARCH-QUALITY_ASSURANCE_PROFILES", "REQ-QUALITY_ASSURANCE_EVIDENCE"],
      pseudocode: "# [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]\nprocedure RUN:\n  # [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n    TERMINATION: total",
    });

    const value = body(result) as { ok?: boolean; schema_version?: string };
    assert.equal(value.ok, true);
    assert.equal(value.schema_version, "layer-b-pseudocode-validator.v1");
  });

  it("wires risk-triggered test adequacy validation", async () => {
    // [IMPL-QUALITY_TEST_ADEQUACY] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Validate risk-relative adequacy metadata through the MCP composition boundary.
    const result = await handler("test_adequacy_validate")({
      selected_profiles: ["performance-scale-cost"],
      checks: [
        {
          id: "cost",
          kind: "external_call_cost",
          profile: "performance-scale-cost",
          expected_volume: 10,
          timeout_ms: 200,
          retry_budget: 0,
          resource_failure_behavior: "fail closed",
        },
      ],
    });

    const value = body(result) as { ok?: boolean; schema_version?: string };
    assert.equal(value.ok, true);
    assert.equal(value.schema_version, "test-adequacy-validator.v1");
  });

  it("wires binding inventory validation", async () => {
    // [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-QUALITY_ASSURANCE_PROFILES] [ARCH-MODULE_VALIDATION]
    // [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
    // Summary: Validate UI-free composition bindings through the MCP boundary.
    const result = await handler("binding_inventory_validate")({
      rows: [
        {
          id: "entry->handler",
          trigger: "message received",
          callee: "handler",
          arguments: "message",
          effect: "state updated",
          ordering: "receive before update",
          failure_behavior: "invalid message rejected",
          composition_test: "mcp-server/src/tools/quality-validation-mcp.test.ts",
        },
      ],
    });

    const value = body(result) as { ok?: boolean; schema_version?: string };
    assert.equal(value.ok, true);
    assert.equal(value.schema_version, "binding-inventory-validator.v1");
  });

  it("wires shell-free quality command collection", async () => {
    // [IMPL-QUALITY_EVIDENCE_COLLECTION] [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Compose declared command execution through the UI-free MCP boundary.
    // [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Execute declared quality commands and capture bounded reproducible evidence.
    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-mcp-quality-"));
    const result = await handler("quality_evidence_collect")({
      commands: [
        {
          id: "unit",
          argv: [process.execPath, "-e", "process.stdout.write('pass')"],
          cwd: process.cwd(),
          artifact_dir: artifactDir,
        },
      ],
    });
    const value = body(result) as { ok?: boolean; command_results?: Array<{ result: string }> };
    assert.equal(value.ok, true);
    assert.equal(value.command_results?.[0]?.result, "passed");
  });

  it("wires command collection directly into manifest generation", async () => {
    // [IMPL-QUALITY_EVIDENCE_COLLECTION] [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Connect declared command execution to deterministic verification manifest generation.
    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-mcp-manifest-"));
    const result = await handler("quality_evidence_collect_manifest")({
      run_id: "run-001",
      commit: "abc123",
      environment: {},
      commands: [
        {
          id: "unit",
          argv: [process.execPath, "-e", "process.exit(0)"],
          cwd: process.cwd(),
          artifact_dir: artifactDir,
        },
      ],
      quality_rows: [],
      covered_tokens: [],
      proof_boundaries: ["command result only"],
    });
    const value = body(result) as { schema_version?: string; command_results?: Array<{ result: string }> };
    assert.equal(value.schema_version, "verification-evidence-manifest.v1");
    assert.equal(value.command_results?.[0]?.result, "passed");
  });

  it("wires conditional security profile validation", async () => {
    const result = await handler("quality_security_profile_validate")({
      selected_profiles: ["external-input-security"],
      evidence_rows: [
        {
          abuse_case: "dependency-vulnerability-review",
          command_or_test: "npm audit --omit=dev",
          result: "passed",
        },
      ],
    });
    const value = body(result) as { ok?: boolean; diagnostics?: unknown[] };
    assert.equal(value.ok, false);
    assert.equal((value.diagnostics ?? []).length, 7);
  });
});
