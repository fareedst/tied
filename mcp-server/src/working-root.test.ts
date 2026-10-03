/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] RESOLVE_WORKING_ROOT classification tests.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  classifyWorkingRelativePath,
  isUndividedWorkingLayout,
  resolveWorkingPath,
  workingPathRelativeToProject,
  listRequestWorkingTokens,
  isPathUnderProjectWorking,
  resolveGlobalLocalWorkingPath,
  committedWorkingFileRel,
} from "./working-root.js";

describe("classifyWorkingRelativePath", () => {
  it("routes gates and adherence to local", () => {
    assert.equal(classifyWorkingRelativePath("gates/verification.json"), "local");
    assert.equal(classifyWorkingRelativePath("adherence/events.jsonl"), "local");
    assert.equal(classifyWorkingRelativePath("adherence"), "local");
    assert.equal(classifyWorkingRelativePath("adversarial-inquiry"), "local");
  });

  it("routes PLAN and tracker to committed", () => {
    assert.equal(classifyWorkingRelativePath("PLAN.md"), "committed");
    assert.equal(classifyWorkingRelativePath("checklist-tracker.yaml"), "committed");
    assert.equal(classifyWorkingRelativePath("evidence/request-evidence-envelope.v1.json"), "committed");
  });
});

describe("resolveWorkingPath", () => {
  it("uses tied/working vs tied-bundle/working when divided", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-wr-div-"));
    fs.mkdirSync(path.join(root, "tied", "working"), { recursive: true });
    fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
    fs.mkdirSync(path.join(root, "tied"), { recursive: true });
    try {
      const plan = resolveWorkingPath(root, "REQ-TIED_FOO", "PLAN.md");
      const gate = resolveWorkingPath(root, "REQ-TIED_FOO", "gates", "verification.json");
      assert.match(plan, /tied[/\\]working[/\\]REQ-TIED_FOO[/\\]PLAN\.md$/);
      assert.match(gate, /tied-bundle[/\\]working[/\\]REQ-TIED_FOO[/\\]gates[/\\]verification\.json$/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("falls back to root working/ when undivided (store layout)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-wr-undiv-"));
    fs.mkdirSync(path.join(root, "tied"), { recursive: true });
    fs.mkdirSync(path.join(root, "working", "REQ-TIED_FOO"), { recursive: true });
    try {
      assert.equal(isUndividedWorkingLayout(root), true);
      const gate = resolveWorkingPath(root, "REQ-TIED_FOO", "gates", "ledger.jsonl");
      assert.match(gate, /working[/\\]REQ-TIED_FOO[/\\]gates[/\\]ledger\.jsonl$/);
      assert.doesNotMatch(gate, /tied-bundle/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("listRequestWorkingTokens scans committed and local roots when divided", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-wr-list-"));
    fs.mkdirSync(path.join(root, "tied", "working", "REQ-A"), { recursive: true });
    fs.mkdirSync(path.join(root, "tied-bundle", "working", "REQ-B"), { recursive: true });
    try {
      assert.deepEqual(listRequestWorkingTokens(root), ["REQ-A", "REQ-B"]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("isPathUnderProjectWorking accepts paths under either root when divided", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-wr-under-"));
    fs.mkdirSync(path.join(root, "tied", "working", "REQ-A"), { recursive: true });
    fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
    try {
      assert.equal(
        isPathUnderProjectWorking(root, path.join(root, "tied", "working", "REQ-A", "PLAN.md")),
        true,
      );
      assert.equal(
        isPathUnderProjectWorking(root, path.join(root, "tied-bundle", "working", "REQ-A", "gates")),
        true,
      );
      assert.equal(isPathUnderProjectWorking(root, path.join(root, "src", "x.ts")), false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("resolveGlobalLocalWorkingPath uses bundle when divided", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-wr-global-"));
    fs.mkdirSync(path.join(root, "tied", "working"), { recursive: true });
    fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
    try {
      const p = resolveGlobalLocalWorkingPath(root, "jev-decide-trace", "trace.jsonl");
      assert.match(p, /tied-bundle[/\\]working[/\\]jev-decide-trace/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("committedWorkingFileRel respects undivided layout", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-wr-cfile-"));
    fs.mkdirSync(path.join(root, "tied"), { recursive: true });
    fs.mkdirSync(path.join(root, "working"), { recursive: true });
    try {
      assert.equal(
        committedWorkingFileRel(root, "tied-claude-client-validation.v1.json"),
        "working/tied-claude-client-validation.v1.json",
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("workingPathRelativeToProject returns posix relpath", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-wr-rel-"));
    fs.mkdirSync(path.join(root, "tied", "working"), { recursive: true });
    try {
      const rel = workingPathRelativeToProject(root, "REQ-X", "checklist-tracker.yaml");
      assert.match(rel, /^tied\/working\/REQ-X\/checklist-tracker\.yaml$/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
