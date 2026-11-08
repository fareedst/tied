/**
 * [REQ-TIED_AGENT_LOADER_REFRESH] Unit tests for AGENTS.md semver sync.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  compareSemverTuple,
  syncAgentsMd,
  warnAgentsLoaderDrift,
} from "./agent-loader-sync.mjs";
import { writeInstallManifest } from "./layers/install-manifest.mjs";

function agentsBody(version) {
  return `# AI Agent Operating Guide\n\n**TIED Methodology Version**: ${version}\n\nBody.\n`;
}

function seedStore(tmpStore, version) {
  fs.writeFileSync(path.join(tmpStore, "VERSION"), `${version}\n`);
  fs.writeFileSync(path.join(tmpStore, "AGENTS.md"), agentsBody(version));
}

describe("compareSemverTuple [REQ-TIED_AGENT_LOADER_REFRESH]", () => {
  it("orders semver tuples", () => {
    assert.equal(compareSemverTuple("4.0.0", "4.2.1"), -1);
    assert.equal(compareSemverTuple("4.2.1", "4.2.1"), 0);
    assert.equal(compareSemverTuple("4.3.0", "4.2.1"), 1);
  });
});

describe("syncAgentsMd [REQ-TIED_AGENT_LOADER_REFRESH]", () => {
  it("T1a creates missing AGENTS.md", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "alr-store-"));
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "alr-client-"));
    seedStore(store, "4.2.1");
    const result = syncAgentsMd(client, store);
    assert.equal(result.action, "created");
    assert.equal(fs.readFileSync(path.join(client, "AGENTS.md"), "utf8").includes("4.2.1"), true);
  });

  it("T1b updates stale client semver", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "alr-store-"));
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "alr-client-"));
    seedStore(store, "4.2.1");
    fs.writeFileSync(path.join(client, "AGENTS.md"), agentsBody("4.0.0"));
    const result = syncAgentsMd(client, store);
    assert.equal(result.action, "updated");
    assert.ok(fs.readFileSync(path.join(client, "AGENTS.md"), "utf8").includes("4.2.1"));
  });

  it("T1c skips equal semver", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "alr-store-"));
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "alr-client-"));
    seedStore(store, "4.2.1");
    const bytes = agentsBody("4.2.1");
    fs.writeFileSync(path.join(client, "AGENTS.md"), bytes);
    const result = syncAgentsMd(client, store);
    assert.equal(result.action, "skipped");
    assert.equal(result.reason, "equal");
    assert.equal(fs.readFileSync(path.join(client, "AGENTS.md"), "utf8"), bytes);
  });

  it("T1d skips when client semver is newer", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "alr-store-"));
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "alr-client-"));
    seedStore(store, "4.2.1");
    const bytes = agentsBody("4.3.0");
    fs.writeFileSync(path.join(client, "AGENTS.md"), bytes);
    const result = syncAgentsMd(client, store);
    assert.equal(result.action, "skipped");
    assert.equal(result.reason, "client_newer");
    assert.equal(fs.readFileSync(path.join(client, "AGENTS.md"), "utf8"), bytes);
  });

  it("T1e updates unparseable client semver", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "alr-store-"));
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "alr-client-"));
    seedStore(store, "4.2.1");
    fs.writeFileSync(path.join(client, "AGENTS.md"), "# no version\n");
    const result = syncAgentsMd(client, store);
    assert.equal(result.action, "updated");
    assert.ok(fs.readFileSync(path.join(client, "AGENTS.md"), "utf8").includes("4.2.1"));
  });

  it("T1f preserve skips update", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "alr-store-"));
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "alr-client-"));
    seedStore(store, "4.2.1");
    const bytes = agentsBody("4.0.0");
    fs.writeFileSync(path.join(client, "AGENTS.md"), bytes);
    const result = syncAgentsMd(client, store, { preserveAgentLoader: true });
    assert.equal(result.action, "skipped");
    assert.equal(result.reason, "preserve");
    assert.equal(fs.readFileSync(path.join(client, "AGENTS.md"), "utf8"), bytes);
  });

  it("T1g skips when store semver unknown", () => {
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "alr-store-"));
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "alr-client-"));
    fs.writeFileSync(path.join(client, "AGENTS.md"), agentsBody("4.0.0"));
    const result = syncAgentsMd(client, store);
    assert.equal(result.action, "skipped");
    assert.equal(result.reason, "store_semver_unknown");
  });
});

describe("warnAgentsLoaderDrift [REQ-TIED_AGENT_LOADER_REFRESH]", () => {
  it("T3 warns when AGENTS semver differs from install.json pin", () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "alr-drift-"));
    fs.mkdirSync(path.join(client, "tied-bundle"), { recursive: true });
    fs.writeFileSync(path.join(client, "AGENTS.md"), agentsBody("4.0.0"));
    writeInstallManifest(client, {
      store: "/store",
      layers: ["db"],
      mode: "linked",
      harness: "cursor",
      methodology_bundle: "live",
      store_methodology_version: "4.2.1",
      tied_version: "4.2.1",
      installer_version: "4.2.1",
    });
    const result = warnAgentsLoaderDrift(client);
    assert.equal(result.drift, true);
    assert.equal(result.pin, "4.2.1");
    assert.equal(result.clientSemver, "4.0.0");
  });
});
