import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import child_process from "node:child_process";

import { runPlumbAuditGate } from "./plumb-audit-gate.js";
import { clearBasePathCache } from "../yaml-loader.js";

describe("plumb audit gate", () => {
  let tempDir: string | null = null;
  let origCwd: string;
  let realTiedBasePathAbs: string;
  const makeAuditLogPath = (suffix: string) => {
    if (!tempDir) throw new Error("tempDir missing");
    return path.join(tempDir, `audit-log-${suffix}.jsonl`);
  };

  beforeEach(() => {
    origCwd = process.cwd();
    realTiedBasePathAbs = path.join(path.resolve(origCwd, ".."), "tied-project");

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "plumb-audit-gate-"));
    process.chdir(tempDir);
    process.env.TIED_BASE_PATH = realTiedBasePathAbs;
    clearBasePathCache();
  });

  afterEach(() => {
    try {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
    } finally {
      if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = null;
      process.chdir(origCwd);
    }
  });

  function initGitRepoAndCommitBase({ aTs, aTest }: { aTs: string; aTest: string }) {
    child_process.execFileSync("git", ["init", "-q"], { stdio: ["ignore", "ignore", "ignore"] });
    child_process.execFileSync("git", ["config", "user.email", "tied@example.com"], { stdio: ["ignore", "ignore", "ignore"] });
    child_process.execFileSync("git", ["config", "user.name", "tied"], { stdio: ["ignore", "ignore", "ignore"] });

    fs.mkdirSync("src", { recursive: true });
    fs.writeFileSync(path.join("src", "a.ts"), aTs, "utf8");
    fs.writeFileSync(path.join("src", "a.test.ts"), aTest, "utf8");

    child_process.execFileSync("git", ["add", "."], { stdio: ["ignore", "ignore", "ignore"] });
    child_process.execFileSync("git", ["commit", "-m", "init", "-q"], { stdio: ["ignore", "ignore", "ignore"] });
  }

  it("strict mode blocks when REQ token introduced but missing from tests", async () => {
    initGitRepoAndCommitBase({
      aTs: "export const x = 1;\n",
      aTest: "import { x } from './a.js';\nexport const y = x;\n",
    });

    // Introduce REQ marker in production, but keep tests token-free.
    fs.writeFileSync(path.join("src", "a.ts"), "export const x = 1; // [REQ-TIED_SETUP]\n", "utf8");
    child_process.execFileSync("git", ["add", "src/a.ts"], { stdio: ["ignore", "ignore", "ignore"] });

    const res = await runPlumbAuditGate({
      policy: "strict",
      source: "manual",
      selection: "staged",
      audit_log_path: makeAuditLogPath("strict-missing-test"),
    });

    assert.strictEqual(res.pass, false);
    assert.strictEqual(res.blocked, true);
    assert.strictEqual(res.commit_allowed, false);
    assert.ok(res.preview_summary_ref);
    assert.ok(res.gap_summary_ref);

    const raw = fs.readFileSync(makeAuditLogPath("strict-missing-test"), "utf8").trim();
    const line = JSON.parse(raw);
    assert.strictEqual(line.pass, false);
    assert.strictEqual(line.blocked, true);
    assert.ok(line.gap?.summary_ref?.id);
    assert.ok(line.preview?.summary_ref?.id);
  });

  it("warn-only mode does not block even when gaps exist", async () => {
    initGitRepoAndCommitBase({
      aTs: "export const x = 1;\n",
      aTest: "import { x } from './a.js';\nexport const y = x;\n",
    });

    fs.writeFileSync(path.join("src", "a.ts"), "export const x = 1; // [REQ-TIED_SETUP]\n", "utf8");
    child_process.execFileSync("git", ["add", "src/a.ts"], { stdio: ["ignore", "ignore", "ignore"] });

    const res = await runPlumbAuditGate({
      policy: "warn-only",
      source: "manual",
      selection: "staged",
      audit_log_path: makeAuditLogPath("warn-missing-test"),
    });

    assert.strictEqual(res.pass, false);
    assert.strictEqual(res.blocked, false);
    assert.strictEqual(res.commit_allowed, true);

    const raw = fs.readFileSync(makeAuditLogPath("warn-missing-test"), "utf8").trim();
    const line = JSON.parse(raw);
    assert.strictEqual(line.pass, false);
    assert.strictEqual(line.commit_allowed, true);
  });

  it("warn-only allows commits on internal tool errors; strict blocks", async () => {
    // No git repo initialized => preview order 2 should throw.
    const strictPath = makeAuditLogPath("tool-error-strict");
    const warnPath = makeAuditLogPath("tool-error-warn");

    const strictRes = await runPlumbAuditGate({
      policy: "strict",
      source: "manual",
      selection: "staged",
      audit_log_path: strictPath,
    });

    assert.strictEqual(strictRes.pass, false);
    assert.strictEqual(strictRes.blocked, true);
    assert.strictEqual(strictRes.commit_allowed, false);

    const warnRes = await runPlumbAuditGate({
      policy: "warn-only",
      source: "manual",
      selection: "staged",
      audit_log_path: warnPath,
    });

    assert.strictEqual(warnRes.pass, false);
    assert.strictEqual(warnRes.blocked, false);
    assert.strictEqual(warnRes.commit_allowed, true);

    const strictRaw = fs.readFileSync(strictPath, "utf8").trim();
    const warnRaw = fs.readFileSync(warnPath, "utf8").trim();
    assert.ok(strictRaw.length > 0);
    assert.ok(warnRaw.length > 0);
  });

  it("writes v1 audit line when locality_report is off (default)", async () => {
    initGitRepoAndCommitBase({
      aTs: "export const x = 1;\n",
      aTest: "import { x } from './a.js';\nexport const y = x;\n",
    });

    const auditPath = makeAuditLogPath("locality-off-v1");
    const res = await runPlumbAuditGate({
      policy: "warn-only",
      source: "manual",
      selection: "staged",
      audit_log_path: auditPath,
    });

    assert.strictEqual(res.locality_summary_ref, undefined);
    const line = JSON.parse(fs.readFileSync(auditPath, "utf8").trim());
    assert.strictEqual(line.schema_version, "plumb-audit-gate-log.v1");
    assert.strictEqual(line.locality_summary_ref, undefined);
  });

  it("writes v2 audit line with compact locality when locality_report is on", async () => {
    const repoRoot = path.resolve(origCwd, "..");
    const declaredPath = path.join(
      repoRoot,
      "working/PLAN-TIED-BBCE-ALIGNMENT/pilot/declared-change-surface-claude-live.v1.yaml"
    );
    const slicePath = path.join(repoRoot, "tied/analysis/agentstream-slice-map.yaml");
    if (!fs.existsSync(declaredPath) || !fs.existsSync(slicePath)) {
      return; // skip when W2 artifacts absent in sparse checkout
    }

    initGitRepoAndCommitBase({
      aTs: "export const x = 1;\n",
      aTest: "import { x } from './a.js';\nexport const y = x;\n",
    });

    fs.mkdirSync("mcp-server/packages/agentstream/src", { recursive: true });
    fs.writeFileSync(
      path.join("mcp-server/packages/agentstream/src/claude-driver.ts"),
      "export const claude = 1;\n",
      "utf8"
    );
    child_process.execFileSync("git", ["add", "."], { stdio: ["ignore", "ignore", "ignore"] });

    const eventPath = makeAuditLogPath("locality-events.jsonl");
    const auditPath = makeAuditLogPath("locality-on-v2");

    const res = await runPlumbAuditGate({
      policy: "warn-only",
      source: "manual",
      selection: "staged",
      audit_log_path: auditPath,
      locality_report: true,
      declared_change_surface_path: declaredPath,
      slice_map_path: slicePath,
      repo_root: repoRoot,
      locality_event_jsonl_path: eventPath,
    });

    assert.ok(res.locality_summary_ref?.id);
    const line = JSON.parse(fs.readFileSync(auditPath, "utf8").trim());
    assert.strictEqual(line.schema_version, "plumb-audit-gate-log.v2");
    assert.ok(line.locality_summary_ref?.change_locality !== undefined);
    assert.ok(line.locality?.scenario_id);
    assert.strictEqual(res.blocked, false);
  });
});

