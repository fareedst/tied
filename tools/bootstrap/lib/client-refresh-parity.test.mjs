/**
 * [REQ-TIED_CLIENT_REFRESH_PARITY] [IMPL-TIED_CLIENT_REFRESH_PARITY]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  computeParityA,
  computeParityB,
  runClientRefreshParityGate,
} from "./client-refresh-parity.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

function writeFile(root, rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

describe("client-refresh-parity", () => {
  it("Parity A: matched, drifted, and allowlist preserved_by_policy", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "parity-a-"));
    writeFile(root, "templates/requirements/REQ-A.yaml", "token: a\n");
    writeFile(root, "templates/requirements/REQ-B.yaml", "token: b\n");
    writeFile(root, "templates/processes.md", "# template only\n");
    writeFile(root, "templates/requirements.yaml", "{}\n");

    const client = fs.mkdtempSync(path.join(os.tmpdir(), "parity-a-client-"));
    writeFile(client, "tied/methodology/requirements/REQ-A.yaml", "token: a\n");
    writeFile(client, "tied/methodology/requirements/REQ-B.yaml", "token: changed\n");
    writeFile(client, "tied/methodology/requirements.yaml", "{}\n");

    const parityA = computeParityA(root, client);
    const byPath = Object.fromEntries(parityA.entries.map((e) => [e.relative_path, e.disposition]));
    assert.equal(byPath["requirements/REQ-A.yaml"], "matched");
    assert.equal(byPath["requirements/REQ-B.yaml"], "drifted");
    assert.equal(byPath["processes.md"], "preserved_by_policy");
  });

  it("Parity B: matched and drifted DOCS_TO_COPY hashes", () => {
    const sourceDoc = path.join(TIED_REPO_ROOT, "tied", "docs", "LEAP.md");
    assert.ok(fs.existsSync(sourceDoc), "LEAP.md must exist in TIED source");

    const client = fs.mkdtempSync(path.join(os.tmpdir(), "parity-b-client-"));
    writeFile(
      client,
      "tied/docs/LEAP.md",
      fs.readFileSync(sourceDoc, "utf8"),
    );
    writeFile(client, "tied/docs/ai-principles.md", "intentional-drift-for-test\n");

    const parityB = computeParityB(TIED_REPO_ROOT, client);
    const byPath = Object.fromEntries(parityB.entries.map((e) => [e.relative_path, e.disposition]));
    assert.equal(byPath["LEAP.md"], "matched");
    assert.equal(byPath["ai-principles.md"], "drifted");
  });

  it("runClientRefreshParityGate: methodology drift exit 1; report-only exit 0", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "parity-run-"));
    writeFile(root, "templates/requirements/REQ-X.yaml", "x: 1\n");
    writeFile(root, "templates/requirements.yaml", "{}\n");
    writeFile(root, "templates/architecture-decisions.yaml", "{}\n");
    writeFile(root, "templates/implementation-decisions.yaml", "{}\n");
    writeFile(root, "templates/semantic-tokens.yaml", "{}\n");
    writeFile(root, "tied/docs/ai-principles.md", "doc\n");
    fs.mkdirSync(path.join(root, "tools", "bootstrap"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "tools", "bootstrap", "manifest.json"),
      JSON.stringify({
        DOCS_TO_COPY: ["ai-principles.md"],
        INDEX_YAML_FILES: [
          "requirements.yaml",
          "architecture-decisions.yaml",
          "implementation-decisions.yaml",
          "semantic-tokens.yaml",
        ],
      }),
      "utf8",
    );

    const client = fs.mkdtempSync(path.join(os.tmpdir(), "parity-run-client-"));
    writeFile(client, "tied/methodology/requirements/REQ-X.yaml", "x: 9\n");
    writeFile(client, "tied/methodology/requirements.yaml", "{}\n");
    writeFile(client, "tied/methodology/architecture-decisions.yaml", "{}\n");
    writeFile(client, "tied/methodology/implementation-decisions.yaml", "{}\n");
    writeFile(client, "tied/methodology/semantic-tokens.yaml", "{}\n");
    writeFile(client, "tied/docs/ai-principles.md", "doc\n");

    const reportPath = path.join(client, ".tied", "report.json");
    const fail = runClientRefreshParityGate(root, client, { reportPath });
    assert.equal(fail.exitCode, 1);
    assert.ok(fs.existsSync(reportPath));

    const reportOnly = runClientRefreshParityGate(root, client, {
      reportPath,
      parityGateReportOnly: true,
    });
    assert.equal(reportOnly.exitCode, 0);
  });
});
