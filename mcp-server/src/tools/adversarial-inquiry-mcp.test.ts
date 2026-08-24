// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: integrate inquiry into existing checklist slugs with bounded working artifacts and human-approved scoped strict status.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function toolHandler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing MCP tool ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function parse(result: TextContent): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

function modeBFixture(caseName: string): Record<string, unknown> {
  const fixtureRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../test/fixtures/adversarial-inquiry-mode-b",
  );
  const projectRoot = path.join(fixtureRoot, "mini-project");
  const inputPath = path.join(fixtureRoot, "cases", caseName, "mode-b-input.json");
  return JSON.parse(
    fs.readFileSync(inputPath, "utf8").replaceAll("__PROJECT_ROOT__", projectRoot),
  ) as Record<string, unknown>;
}

describe("tied_adversarial_inquiry_run composition [REQ-TIED_ADVERSARIAL_INQUIRY]", () => {
  it("is discoverable and persists the scoped checklist result without mutating canonical YAML", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "adversarial-inquiry-mcp-"));
    const canonical = path.join(root, "tied", "requirements.yaml");
    fs.mkdirSync(path.dirname(canonical), { recursive: true });
    fs.writeFileSync(canonical, "REQ-X:\n  status: Active\n", "utf8");
    const before = fs.readFileSync(canonical, "utf8");

    const handler = toolHandler("tied_adversarial_inquiry_run");
    const blockId = "IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST#RUN#block";
    const result = parse(await handler({
      graph: {
        projectId: "project-1",
        criteria: [{
          identity: {
            id: "REQ-TIED_ADVERSARIAL_INQUIRY#criterion-1",
            kind: "criterion",
            derivation: "explicit",
            revision: "criterion-rev",
            sourceRevision: "source-rev",
          },
          architectureConstraintIds: ["constraint-1"],
        }],
        architectureConstraints: [{ id: "constraint-1", implementationBlockIds: [blockId] }],
        implementationBlocks: [{
          identity: {
            id: blockId,
            kind: "block",
            name: "RUN",
            derivation: "content",
            revision: "block-rev",
            sourceRevision: "source-rev",
          },
        }],
        evidenceLoci: [],
      },
      fidelity: {
        blockRevision: "block-rev",
        specification: [{ id: "statement-1", kind: "behavior", value: "accept input", order: 1 }],
        testEvidence: [],
        productionEvidence: [],
      },
      scope: [blockId],
      policy: "advisory",
      repository_root: root,
      request_token: "REQ-TIED_ADVERSARIAL_INQUIRY",
      redact: ["top-secret"],
    }));

    assert.equal(result.ok, true);
    assert.equal((result.gate as { status: string }).status, "warn");
    const artifacts = result.artifacts as Record<string, string>;
    assert.ok(artifacts.obligationReport.endsWith("obligation-report.json"));
    assert.ok(fs.existsSync(artifacts.gateResult));
    assert.equal(fs.readFileSync(canonical, "utf8"), before);
  });

  // [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: dispatch an explicit project-input inquiry through the validated orchestrator and existing checklist persistence.
  it("dispatches all Mode B fixture cases without changing Mode A", async () => {
    const handler = toolHandler("tied_adversarial_inquiry_run");
    const fixtureRoot = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../test/fixtures/adversarial-inquiry-mode-b",
    );
    const projectRoot = path.join(fixtureRoot, "mini-project");
    const tiedFiles = [
      "requirements.yaml",
      "architecture-decisions.yaml",
      "implementation-decisions.yaml",
      "semantic-tokens.yaml",
    ].map((name) => path.join(projectRoot, "tied", name));
    const before = tiedFiles.map((filePath) => fs.readFileSync(filePath, "utf8"));

    const good = parse(await handler(modeBFixture("case-good")));
    const missingFailure = parse(await handler(modeBFixture("case-missing-failure")));
    const unsupported = parse(await handler(modeBFixture("case-unsupported-assertion")));

    assert.equal(good.mode, "project");
    assert.equal(good.ok, true);
    assert.equal(good.verdict, "RELIABLE_INCOMPLETE");
    assert.ok(String((good.artifacts as Record<string, string>).directory).startsWith(
      path.join(projectRoot, "working", "REQ-FIXTURE-ADVERSARIAL", "adversarial-inquiry"),
    ));
    assert.equal(missingFailure.verdict, "RELIABLE_INCOMPLETE");
    assert.ok(JSON.stringify(missingFailure.report).includes('"direction":"B"'));
    assert.equal(unsupported.verdict, "UNRESOLVED");
    assert.ok((unsupported.diagnostics as string[]).includes("unsupported_adapter"));
    assert.deepEqual(tiedFiles.map((filePath) => fs.readFileSync(filePath, "utf8")), before);
  });

  it("dispatches all Go Mode B fixture cases without mutating canonical TIED YAML", async () => {
    const handler = toolHandler("tied_adversarial_inquiry_run");
    const fixtureRoot = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../test/fixtures/adversarial-inquiry-go-mode-b",
    );
    const projectRoot = path.join(fixtureRoot, "mini-project");
    const goFixture = (caseName: string): Record<string, unknown> => {
      const inputPath = path.join(fixtureRoot, "cases", caseName, "mode-b-input.json");
      return JSON.parse(
        fs.readFileSync(inputPath, "utf8").replaceAll("__PROJECT_ROOT__", projectRoot),
      ) as Record<string, unknown>;
    };
    const tiedFiles = [
      "requirements.yaml",
      "architecture-decisions.yaml",
      "implementation-decisions.yaml",
      "semantic-tokens.yaml",
    ].map((name) => path.join(projectRoot, "tied", name));
    const before = tiedFiles.map((filePath) => fs.readFileSync(filePath, "utf8"));

    const good = parse(await handler(goFixture("case-good")));
    const missingFailure = parse(await handler(goFixture("case-missing-failure")));
    const unsupported = parse(await handler(goFixture("case-unsupported-assertion")));

    assert.equal(good.mode, "project");
    assert.equal(good.ok, true);
    assert.equal(good.verdict, "RELIABLE_INCOMPLETE");
    assert.equal(missingFailure.verdict, "RELIABLE_INCOMPLETE");
    assert.equal(unsupported.verdict, "UNRESOLVED");
    assert.ok((unsupported.diagnostics as string[]).includes("unsupported_adapter"));
    assert.deepEqual(tiedFiles.map((filePath) => fs.readFileSync(filePath, "utf8")), before);
  });
});
