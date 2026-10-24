import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

import {
  COMMITTED_CLOSEOUT_EVIDENCE_REL,
  listCommittedWorkingStageCandidates,
} from "./committed-working-staging.mjs";

test("listCommittedWorkingStageCandidates finds untracked manifest and envelope", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cw-stage-"));
  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  const evidenceDir = path.join(dir, "tied-project", "working", "REQ-X", "evidence");
  fs.mkdirSync(evidenceDir, { recursive: true });
  for (const tail of COMMITTED_CLOSEOUT_EVIDENCE_REL) {
    fs.writeFileSync(path.join(dir, "tied-project", "working", "REQ-X", tail), "{}\n");
  }
  try {
    const candidates = listCommittedWorkingStageCandidates(dir, "REQ-X");
    assert.equal(candidates.length, 2);
    assert.ok(
      candidates.includes(
        "tied-project/working/REQ-X/evidence/verification-evidence-manifest.v1.json",
      ),
    );
    execFileSync(
      "git",
      ["add", "tied-project/working/REQ-X/evidence/request-evidence-envelope.v1.json"],
      { cwd: dir },
    );
    const after = listCommittedWorkingStageCandidates(dir, "REQ-X");
    assert.deepEqual(after, [
      "tied-project/working/REQ-X/evidence/verification-evidence-manifest.v1.json",
    ]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
