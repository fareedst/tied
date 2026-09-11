/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  corpusProjects,
  evaluateGrammarV2AuditReport,
  grammarV2HeaderExpectPass,
  resolveGrammarV2AuditArtifactPath,
  runCorpusGrammarV2Audit,
} from "./lib/corpus-grammar-v2-replay.mjs";
import { REPO_ROOT } from "./lib/audit-grammar-v2-default.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("corpus grammar v2 replay helpers [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("normalizes corpus.projects and corpus.rows", () => {
    const fromProjects = corpusProjects({ projects: [{ project_root: "/a", request_token: "REQ-A" }] });
    const fromRows = corpusProjects({ rows: [{ project_root: "/b", request_token: "REQ-B" }] });
    assert.equal(fromProjects.length, 1);
    assert.equal(fromRows[0].request_token, "REQ-B");
  });

  it("detects grammar_v2_header_expect pass", () => {
    assert.equal(grammarV2HeaderExpectPass({ grammar_v2_header_expect: "pass" }), true);
    assert.equal(grammarV2HeaderExpectPass({ grammar_v2_header_expect: "not_measured" }), false);
  });

  it("resolves operator-local audit artifact paths against stdd root", () => {
    const resolved = resolveGrammarV2AuditArtifactPath(
      { grammar_v2_audit_artifact: "working/evaluation/grammar-v2-x.json" },
      REPO_ROOT,
    );
    assert.equal(resolved, path.join(REPO_ROOT, "working/evaluation/grammar-v2-x.json"));
  });

  it("fails evaluation when header dimension is not pass", () => {
    const bad = evaluateGrammarV2AuditReport({
      ok: false,
      dimensions: { grammar_v2_header: "fail" },
      audit: { ok: false, dimensions: { grammar_v2_header: "fail" } },
    });
    assert.equal(bad.ok, false);
    assert.ok(bad.failures.some((item) => item.includes("grammar_v2_header")));
  });
});

describe("runCorpusGrammarV2Audit composition [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("writes grammar_v2_audit_artifact for bootstrapped client", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-corpus-grammar-replay-"));
    const artifactRel = path.join("working", "evaluation", `grammar-v2-${path.basename(tempDir)}-audit.json`);
    const artifactAbs = path.join(REPO_ROOT, artifactRel);
    const copyScript = path.join(REPO_ROOT, "copy_files.sh");
    try {
      execFileSync("bash", [copyScript, tempDir], { cwd: REPO_ROOT, stdio: "pipe" });
      const row = {
        project_root: tempDir,
        request_token: "REQ-PLACEHOLDER",
        grammar_v2_header_expect: "pass",
        grammar_v2_audit_artifact: artifactRel,
      };
      const result = runCorpusGrammarV2Audit(row, { stdRoot: REPO_ROOT, writeArtifact: true });
      assert.equal(result.ok, true, JSON.stringify(result.failures ?? result.error));
      assert.ok(fs.existsSync(artifactAbs), "artifact should be written");
      const onDisk = JSON.parse(fs.readFileSync(artifactAbs, "utf8"));
      assert.equal(onDisk.dimensions.grammar_v2_header, "pass");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
      if (fs.existsSync(artifactAbs)) {
        fs.rmSync(artifactAbs, { force: true });
      }
    }
  });
});
