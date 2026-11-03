import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, it } from "node:test";

import type { DryRunConfig } from "./dry-run-config.js";
import {
  harnessDistModulePath,
  isHarnessDistBuilt,
  packageAnchorStoreRootFromModuleUrl,
  resolveJevHarnessDistStoreRoot,
} from "./jev-harness-shared.js";

// [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
// SC-JEV-HARNESS-DIST-STORE-LINKED-CLIENT

function minimalCfg(overrides: Partial<DryRunConfig> = {}): DryRunConfig {
  return {
    dryRun: false,
    sessionId: "",
    workspace: process.cwd(),
    model: "Auto",
    agentPath: "",
    agentHarness: "cursor",
    leadChecklistYaml: "",
    leadChecklistSkipSub: false,
    leadChecklistStepFromId: "",
    leadChecklistStepToId: "",
    leadChecklistBeforeFeatureSpec: false,
    firstTurn: 1,
    resumeFromTracker: false,
    firstTurnExplicit: false,
    checklistVars: {},
    checklistVarStrict: false,
    skipTiedMcpPreflight: false,
    assumeTiedMcpYes: false,
    mcpJsonPath: "",
    argvWords: [],
    promptFiles: [],
    promptsFiles: [],
    tddYamls: [],
    featureSpecBatchYamls: [],
    previewFeatureSpecBatchYaml: "",
    previewLeadChecklist: false,
    previewChecklistTrackerYaml: "",
    verifySession: false,
    nonCompactHtml: false,
    nonCompactHtmlStableIndent: 0,
    checklistTrackerYaml: "",
    adherenceLedger: "",
    runID: "",
    enforceEnvelope: false,
    allowMissingEnvelope: false,
    integratedDepth: false,
    featureSpecBatchExplicit: true,
    orderFilterRaw: "",
    ...overrides,
  };
}

function seedLinkedClientRoot(clientRoot: string): void {
  fs.mkdirSync(path.join(clientRoot, "tied-bundle", "docs"), { recursive: true });
  fs.writeFileSync(
    path.join(clientRoot, "tied-bundle", "docs", "agent-req-implementation-checklist.yaml"),
    "description: fixture\n",
  );
}

function writeFakeHarnessDist(storeRoot: string): void {
  const guard = harnessDistModulePath(storeRoot);
  fs.mkdirSync(path.dirname(guard), { recursive: true });
  fs.writeFileSync(guard, "export const evaluateHarnessToolCall = async () => ({});\n");
}

function writeFakeMcpIndex(storeRoot: string): void {
  const indexJs = path.join(storeRoot, "mcp-server", "dist", "index.js");
  fs.mkdirSync(path.dirname(indexJs), { recursive: true });
  fs.writeFileSync(indexJs, "// fixture\n");
}

function writeClientMcpJson(clientRoot: string, tiedDir: string, storeRoot: string): void {
  const dist = path.join(storeRoot, "mcp-server", "dist", "index.js");
  writeFakeMcpIndex(storeRoot);
  const cursorDir = path.join(clientRoot, ".cursor");
  fs.mkdirSync(cursorDir, { recursive: true });
  fs.writeFileSync(
    path.join(cursorDir, "mcp.json"),
    `${JSON.stringify(
      {
        mcpServers: {
          "tied-yaml": {
            args: [dist],
            env: {
              TIED_CLIENT_PROJECT_PATH: tiedDir,
              TIED_STORE_ROOT: storeRoot,
            },
          },
        },
      },
      null,
      2,
    )}\n`,
  );
}

describe("resolveJevHarnessDistStoreRoot [SC-JEV-HARNESS-DIST-STORE-LINKED-CLIENT]", () => {
  let clientDir = "";
  let storeDir = "";
  let prevMcpBin = "";
  let prevRepoRoot = "";
  let prevSkipAnchor = "";

  afterEach(() => {
    for (const dir of [clientDir, storeDir]) {
      if (dir) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
    clientDir = "";
    storeDir = "";
    if (prevMcpBin === "") {
      delete process.env.TIED_MCP_BIN;
    } else {
      process.env.TIED_MCP_BIN = prevMcpBin;
    }
    if (prevRepoRoot === "") {
      delete process.env.TIED_REPO_ROOT;
    } else {
      process.env.TIED_REPO_ROOT = prevRepoRoot;
    }
    if (prevSkipAnchor === "") {
      delete process.env.AGENTSTREAM_JEV_HARNESS_DIST_SKIP_PACKAGE_ANCHOR;
    } else {
      process.env.AGENTSTREAM_JEV_HARNESS_DIST_SKIP_PACKAGE_ANCHOR = prevSkipAnchor;
    }
    prevSkipAnchor = "";
  });

  it("resolves store dist via client mcp.json when client has no mcp-server", () => {
    prevMcpBin = process.env.TIED_MCP_BIN ?? "";
    prevRepoRoot = process.env.TIED_REPO_ROOT ?? "";
    delete process.env.TIED_REPO_ROOT;
    delete process.env.TIED_MCP_BIN;

    clientDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-client-"));
    storeDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-store-"));
    seedLinkedClientRoot(clientDir);
    writeFakeHarnessDist(storeDir);
    const tiedDir = path.join(clientDir, "tied-project");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "requirements: {}\n");
    writeClientMcpJson(clientDir, tiedDir, storeDir);

    const cfg = minimalCfg({ workspace: clientDir });
    const resolved = resolveJevHarnessDistStoreRoot(cfg, process.env);
    assert.equal(resolved, path.resolve(storeDir));
    assert.equal(isHarnessDistBuilt(cfg, process.env), true);
  });

  it("ignores shell TIED_REPO_ROOT when mcp.json defines store", () => {
    prevMcpBin = process.env.TIED_MCP_BIN ?? "";
    prevRepoRoot = process.env.TIED_REPO_ROOT ?? "";
    delete process.env.TIED_MCP_BIN;

    clientDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-client-"));
    storeDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-store-"));
    seedLinkedClientRoot(clientDir);
    writeFakeHarnessDist(storeDir);
    const tiedDir = path.join(clientDir, "tied-project");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "requirements: {}\n");
    writeClientMcpJson(clientDir, tiedDir, storeDir);

    process.env.TIED_REPO_ROOT = path.join(os.tmpdir(), "wrong-store");

    const cfg = minimalCfg({ workspace: clientDir });
    const resolved = resolveJevHarnessDistStoreRoot(cfg, process.env);
    assert.equal(resolved, path.resolve(storeDir));
  });

  it("does not resolve from shell TIED_MCP_BIN when mcp.json and monolithic dist absent", () => {
    prevMcpBin = process.env.TIED_MCP_BIN ?? "";
    prevRepoRoot = process.env.TIED_REPO_ROOT ?? "";
    prevSkipAnchor = process.env.AGENTSTREAM_JEV_HARNESS_DIST_SKIP_PACKAGE_ANCHOR ?? "";
    delete process.env.TIED_REPO_ROOT;

    clientDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-client-no-mcp-"));
    storeDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-store-env-only-"));
    seedLinkedClientRoot(clientDir);
    writeFakeHarnessDist(storeDir);
    writeFakeMcpIndex(storeDir);

    process.env.TIED_MCP_BIN = path.join(storeDir, "mcp-server", "dist", "index.js");
    process.env.AGENTSTREAM_JEV_HARNESS_DIST_SKIP_PACKAGE_ANCHOR = "1";

    const cfg = minimalCfg({ workspace: clientDir });
    assert.equal(resolveJevHarnessDistStoreRoot(cfg, process.env), null);
  });

  it("resolves monolithic workspace when dist lives under client root", () => {
    prevMcpBin = process.env.TIED_MCP_BIN ?? "";
    prevRepoRoot = process.env.TIED_REPO_ROOT ?? "";
    delete process.env.TIED_MCP_BIN;
    delete process.env.TIED_REPO_ROOT;

    clientDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-mono-"));
    seedLinkedClientRoot(clientDir);
    writeFakeHarnessDist(clientDir);
    writeFakeMcpIndex(clientDir);

    const cfg = minimalCfg({ workspace: clientDir });
    assert.equal(resolveJevHarnessDistStoreRoot(cfg, process.env), path.resolve(clientDir));
  });

  it("package anchor walks up to store harness dist from agentstream module", () => {
    const modulePath = fileURLToPath(new URL("./jev-harness-shared.ts", import.meta.url));
    const anchor = packageAnchorStoreRootFromModuleUrl(modulePath);
    assert.ok(anchor !== "");
    assert.equal(
      fs.existsSync(harnessDistModulePath(anchor)),
      true,
      "expected real store harness dist at package anchor",
    );
  });
});
