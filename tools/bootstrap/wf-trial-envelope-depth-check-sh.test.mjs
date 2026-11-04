import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-envelope-depth-check.inc.sh");

describe("wf-trial-envelope-depth-check [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS]", () => {
  it("T-WF-01 emits DIAGNOSTIC on depth mismatch and exits 0", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-env-depth-"));
    const req = "REQ-TEST-DEPTH";
    const working = path.join(tmp, "tied-project", "working", req, "evidence");
    fs.mkdirSync(working, { recursive: true });
    fs.writeFileSync(
      path.join(working, "request-evidence-envelope.v1.json"),
      JSON.stringify({ identity: { depth_tier: "integrated" } }),
      "utf8",
    );
    fs.writeFileSync(
      path.join(tmp, "tied-project", "working", req, `CITDP-${req}-draft.yaml`),
      `${req}:
  risk_analysis:
    adversarial_inquiry:
      depth_tier: minimal
`,
      "utf8",
    );
    const r = spawnSync(
      "bash",
      [
        "-c",
        `source "${INC}"; REPO_ROOT="${REPO_ROOT}"; wf_trial_envelope_depth_diagnostic "${tmp}"; echo EXIT:$?`,
      ],
      { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
    );
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout + r.stderr, /DIAGNOSTIC: WF_TRIAL_ENVELOPE_DEPTH_MISMATCH/);
    assert.match(r.stdout, /EXIT:0/);
  });
});
