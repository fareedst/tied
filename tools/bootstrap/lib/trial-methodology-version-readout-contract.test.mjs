/**
 * [REQ-TRIAL_METHODOLOGY_VERSION_READOUT] [IMPL-TRIAL_METHODOLOGY_VERSION_READOUT]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { TIED_REPO_ROOT } from "./constants.mjs";

const BATCH = path.join(TIED_REPO_ROOT, "docs/demos/traditional-four-phase-agentstream.yaml");
const WF_REF = path.join(TIED_REPO_ROOT, "tools/bundled-record-wf-trial-skill/reference.md");
const GF_REF = path.join(TIED_REPO_ROOT, "tools/bundled-record-gf-trial-skill/reference.md");
const CAPTURE_MD = path.join(
  TIED_REPO_ROOT,
  "tools/bundled-prompt-type-skills/prompt-shared/trial-session-methodology-version-capture.md",
);
const EXAMPLE_JSON = path.join(
  TIED_REPO_ROOT,
  "mcp-server/contracts/trial-methodology-version/tied-methodology-version.session.example.json",
);

describe("trial methodology version readout contract [REQ-TRIAL_METHODOLOGY_VERSION_READOUT]", () => {
  it("T-TMV-YAML-01 turn-1 goal names server_info and session evidence file", () => {
    const body = fs.readFileSync(BATCH, "utf8");
    const turn1 = body.split("order: 2")[0];
    assert.match(turn1, /server_info/i);
    assert.match(turn1, /tied-methodology-version\.session\.v1\.json/);
  });

  it("T-TMV-REF-WF-01 record-wf-trial reference requires session metadata and discovery order", () => {
    const body = fs.readFileSync(WF_REF, "utf8");
    assert.match(body, /TIED methodology version \(session\)/i);
    assert.match(body, /tied-methodology-version\.session\.v1\.json/);
    assert.match(body, /bootstrap-inferred only/i);
    assert.match(body, /store_methodology_version/);
  });

  it("T-TMV-REF-GF-01 record-gf-trial reference parity", () => {
    const body = fs.readFileSync(GF_REF, "utf8");
    assert.match(body, /TIED methodology version \(session\)/i);
    assert.match(body, /tied-methodology-version\.session\.v1\.json/);
    assert.match(body, /bootstrap-inferred only/i);
  });

  it("T-TMV-JSON-01 example session evidence documents schema v1", () => {
    const doc = JSON.parse(fs.readFileSync(EXAMPLE_JSON, "utf8"));
    assert.equal(doc.schema, "tied-methodology-version.session.v1");
    assert.match(doc.version, /^\d+\.\d+\.\d+$/);
    assert.ok(doc.source);
    assert.ok(doc.captured_at);
    assert.ok(["mcp_server_info", "tied_cli_server_info"].includes(doc.capture_path));
  });

  it("T-TMV-PROMPT-01 capture doc references extensions.tied.methodology", () => {
    const body = fs.readFileSync(CAPTURE_MD, "utf8");
    assert.match(body, /extensions\.tied\.methodology/);
    assert.match(body, /tied-methodology-version\.session\.v1\.json/);
  });

  it("T-TMV-SHELL-01 process log inc emits secondary methodology DIAGNOSTIC", () => {
    const inc = path.join(TIED_REPO_ROOT, "scripts/lib/wf-trial-process-log.inc.sh");
    const body = fs.readFileSync(inc, "utf8");
    assert.match(body, /DIAGNOSTIC: tied_methodology_version=/);
    assert.match(body, /REQ-TRIAL_METHODOLOGY_VERSION_READOUT/);
  });
});
