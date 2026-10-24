// [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  applyCommittedWorkingHygieneProfile,
  GITIGNORE_COMMITTED_WORKING_REGENERABLE_BEGIN,
  buildCommittedWorkingRegenerableGlobs,
} from "./working-gitignore.mjs";

test("buildCommittedWorkingRegenerableGlobs mirrors tied-bundle/working entries", () => {
  const globs = buildCommittedWorkingRegenerableGlobs();
  assert.ok(globs.some((g) => g === "tied-project/working/**/gate-*.json"));
  assert.ok(globs.some((g) => g === "tied-project/working/**/gate-tracker*.yaml"));
  assert.ok(
    globs.some((g) => g === "tied-project/working/**/claims-evidence-review/mcp-run/"),
  );
  assert.ok(globs.some((g) => g === "tied-project/working/**/evidence/**/*.stdout.txt"));
  assert.ok(globs.some((g) => g.startsWith("tied-project/working/")));
  assert.ok(!globs.some((g) => g.startsWith("tied-bundle/working/")));
});

test("temp repo: regenerable gate JSON ignored, PLAN.md trackable", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cwgh-gitignore-"));
  try {
    execSync("git init", { cwd: dir, stdio: "ignore" });
    const gitignore = applyCommittedWorkingHygieneProfile("");
    assert.ok(gitignore.includes(GITIGNORE_COMMITTED_WORKING_REGENERABLE_BEGIN));
    fs.writeFileSync(path.join(dir, ".gitignore"), gitignore);
    fs.mkdirSync(path.join(dir, "tied-project", "working", "REQ-X", "evidence"), {
      recursive: true,
    });
    fs.writeFileSync(path.join(dir, "tied-project", "working", "REQ-X", "PLAN.md"), "# plan\n");
    fs.writeFileSync(
      path.join(
        dir,
        "tied-project",
        "working",
        "REQ-X",
        "evidence",
        "verification-evidence-manifest.v1.json",
      ),
      "{}\n",
    );
    fs.writeFileSync(
      path.join(dir, "tied-project", "working", "REQ-X", "evidence", "verification-gate-run.json"),
      "{}\n",
    );
    fs.writeFileSync(
      path.join(dir, "tied-project", "working", "REQ-X", "evidence", "gate-pre_implementation.json"),
      "{}\n",
    );
    fs.writeFileSync(
      path.join(dir, "tied-project", "working", "REQ-X", "evidence", "npm-test.stdout.txt"),
      "ok\n",
    );
    fs.mkdirSync(
      path.join(dir, "tied-project", "working", "REQ-X", "evidence", "quality-manifest"),
      { recursive: true },
    );
    fs.writeFileSync(
      path.join(
        dir,
        "tied-project",
        "working",
        "REQ-X",
        "evidence",
        "quality-manifest",
        "citdp-evidence-1.stdout.txt",
      ),
      "ok\n",
    );
    fs.writeFileSync(
      path.join(dir, "tied-project", "working", "REQ-X", "gate-tracker-verification.yaml"),
      "steps: []\n",
    );
    fs.mkdirSync(
      path.join(dir, "tied-project", "working", "REQ-X", "claims-evidence-review", "mcp-run"),
      { recursive: true },
    );
    fs.writeFileSync(
      path.join(
        dir,
        "tied-project",
        "working",
        "REQ-X",
        "claims-evidence-review",
        "mcp-run",
        "claim-review-report.v1.json",
      ),
      "{}\n",
    );
    execSync("git add .", { cwd: dir, stdio: "ignore" });
    const tracked = execSync("git ls-files", { cwd: dir, encoding: "utf8" }).trim().split("\n");
    assert.ok(tracked.includes("tied-project/working/REQ-X/PLAN.md"));
    assert.ok(
      tracked.includes(
        "tied-project/working/REQ-X/evidence/verification-evidence-manifest.v1.json",
      ),
    );
    assert.ok(!tracked.some((p) => p.includes("verification-gate-run.json")));
    assert.ok(!tracked.some((p) => p.includes("gate-pre_implementation.json")));
    assert.ok(!tracked.some((p) => p.includes("gate-tracker-verification.yaml")));
    assert.ok(!tracked.some((p) => p.includes("claims-evidence-review/mcp-run/")));
    assert.ok(!tracked.some((p) => p.endsWith("npm-test.stdout.txt")));
    assert.ok(!tracked.some((p) => p.includes("quality-manifest/citdp-evidence-1.stdout.txt")));
    execSync("git check-ignore -q tied-project/working/REQ-X/evidence/gate-pre_implementation.json", {
      cwd: dir,
    });
    execSync("git check-ignore -q tied-project/working/REQ-X/gate-tracker-verification.yaml", {
      cwd: dir,
    });
    execSync(
      "git check-ignore -q tied-project/working/REQ-X/claims-evidence-review/mcp-run/claim-review-report.v1.json",
      { cwd: dir },
    );
    execSync("git check-ignore -q tied-project/working/REQ-X/evidence/npm-test.stdout.txt", {
      cwd: dir,
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
