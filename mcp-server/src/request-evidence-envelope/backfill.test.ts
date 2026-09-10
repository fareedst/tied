import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  BACKFILL_GENERATOR,
  backfillRequestEvidenceEnvelope,
  buildNotApplicableReceipt,
  resolveDepthTierForBackfill,
} from "./backfill.js";
import { serializeEnvelope } from "./normalize.js";
import { ENVELOPE_SCHEMA_VERSION } from "./types.js";
import { validateRequestEvidenceEnvelope } from "./validate.js";

function resolveRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    if (existsSync(path.join(dir, "tied", "requirements.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(process.cwd(), "..");
}

const REPO_ROOT = resolveRepoRoot();
const FIXTURE_ROOT = path.join(
  REPO_ROOT,
  "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-1787603099",
);
const TIED_BASE_PATH = path.join(REPO_ROOT, "tied");
const EXTERNAL_MINIMAL = "/Users/fareed/Documents/dev/test/1788547701";
const EXTERNAL_INTEGRATED = "/Users/fareed/Documents/dev/test/1787603099";
const INTEGRATED_TOKEN = "REQ-LISTENING_PORT_REPORT";
const MINIMAL_TOKEN = "REQ-BT_BATTERY_DISPLAY";
const GENERATED_AT = "2026-09-10T18:00:00.000Z";

function copyDir(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function seedMinimalFixture(tempRoot: string) {
  const working = path.join(tempRoot, "working", MINIMAL_TOKEN);
  mkdirSync(working, { recursive: true });
  writeFileSync(
    path.join(working, "agent-req-implementation-checklist.yaml"),
    "execution_evidence:\n  request: REQ-BT_BATTERY_DISPLAY\n",
    "utf8",
  );
  writeFileSync(
    path.join(working, "CITDP-BT_BATTERY_DISPLAY-draft.yaml"),
    `CITDP-${MINIMAL_TOKEN}:
  risk_analysis:
    adversarial_inquiry:
      depth_tier: minimal
      gate_policy: advisory
`,
    "utf8",
  );
  mkdirSync(path.join(tempRoot, "tied"), { recursive: true });
}

function seedIntegratedFixture(tempRoot: string) {
  const working = path.join(tempRoot, "working", INTEGRATED_TOKEN);
  mkdirSync(working, { recursive: true });
  copyDir(path.join(FIXTURE_ROOT, "snapshots", "tracker"), working);
  const trackerSrc = path.join(working, "authoritative-tracker.yaml");
  if (existsSync(trackerSrc)) {
    writeFileSync(
      path.join(working, "agent-req-implementation-checklist.yaml"),
      readFileSync(trackerSrc, "utf8"),
    );
  }
  copyDir(path.join(FIXTURE_ROOT, "snapshots", "citdp"), working);
  const citdpSrc = path.join(working, "citdp.yaml");
  if (existsSync(citdpSrc)) {
    writeFileSync(path.join(working, `CITDP-${INTEGRATED_TOKEN}.yaml`), readFileSync(citdpSrc, "utf8"));
  }
  const inquiry = path.join(working, "adversarial-inquiry");
  mkdirSync(inquiry, { recursive: true });
  copyDir(path.join(FIXTURE_ROOT, "snapshots", "adversarial-inquiry-root"), inquiry);
  for (const phase of ["pre_implementation", "verification"] as const) {
    copyDir(
      path.join(FIXTURE_ROOT, "snapshots", `adversarial-inquiry-phase-${phase}`),
      path.join(inquiry, `phase-${phase}`),
    );
  }
  mkdirSync(path.join(tempRoot, "tied"), { recursive: true });
}

describe("request evidence envelope backfill [IMPL-REQUEST_EVIDENCE_ENVELOPE]", () => {
  it("builds not-applicable receipt document for minimal depth", () => {
    const receipt = buildNotApplicableReceipt({
      requestToken: MINIMAL_TOKEN,
      depthTier: "minimal",
      phases: ["pre_implementation", "verification", "close_out"],
      generatedAt: GENERATED_AT,
    });
    assert.equal(receipt.schema_version, "not-applicable-receipt.v1");
    assert.equal(receipt.source, BACKFILL_GENERATOR);
    assert.deepEqual(receipt.phases, ["close_out", "pre_implementation", "verification"]);
  });

  it("resolves minimal depth_tier from CITDP draft", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-backfill-depth-"));
    seedMinimalFixture(tempRoot);
    const resolved = await resolveDepthTierForBackfill({
      projectRoot: tempRoot,
      requestToken: MINIMAL_TOKEN,
    });
    assert.equal(resolved.depthTier, "minimal");
    assert.ok(resolved.citdpPath?.includes("CITDP-BT_BATTERY_DISPLAY-draft.yaml"));
  });

  it("writes not-applicable receipt and envelope for minimal synthetic fixture", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-backfill-minimal-"));
    seedMinimalFixture(tempRoot);
    const result = await backfillRequestEvidenceEnvelope({
      request_token: MINIMAL_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.depth_tier, "minimal");
    assert.ok(result.not_applicable_receipt_path);
    assert.equal(result.envelope.envelope_meta.generator, BACKFILL_GENERATOR);
    assert.ok(
      result.envelope.artifacts.some(
        (artifact) => artifact.kind === "not_applicable_receipt" && artifact.status === "present",
      ),
    );
    assert.equal(result.envelope.gaps.some((gap) => gap.code === "not_applicable_receipt_missing"), false);
    const validation = await validateRequestEvidenceEnvelope({
      envelope_path: result.envelope_path,
      project_root: tempRoot,
    });
    assert.equal(validation.ok, true);
  });

  it("backfills integrated fixture snapshots with gap inventory", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-backfill-integrated-"));
    seedIntegratedFixture(tempRoot);
    const result = await backfillRequestEvidenceEnvelope({
      request_token: INTEGRATED_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.not_applicable_receipt_path, null);
    assert.ok(result.envelope.gaps.some((gap) => gap.code === "artifact_path_root_projection_rejected"));
    assert.ok(result.envelope.gaps.some((gap) => gap.code === "provenance_incomplete"));
    assert.equal(existsSync(path.join(tempRoot, result.envelope_path)), true);
    const bytes = readFileSync(path.join(tempRoot, result.envelope_path), "utf8");
    const replay = await backfillRequestEvidenceEnvelope({
      request_token: INTEGRATED_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: GENERATED_AT,
    });
    assert.equal(replay.ok, true);
    if (!replay.ok) return;
    assert.equal(bytes, readFileSync(path.join(tempRoot, replay.envelope_path), "utf8"));
  });

  it("fails closed on WrongTiedBasePath", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-backfill-wrong-base-"));
    seedMinimalFixture(tempRoot);
    const result = await backfillRequestEvidenceEnvelope({
      request_token: MINIMAL_TOKEN,
      project_root: tempRoot,
      tied_base_path: "/tmp/wrong/tied",
      confirmed_tied_base_path: TIED_BASE_PATH,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "WrongTiedBasePath");
  });

  it("optional integration: backfill external minimal client 1788547701", async () => {
    const projectRoot = EXTERNAL_MINIMAL;
    try {
      readFileSync(path.join(projectRoot, "working", MINIMAL_TOKEN, "agent-req-implementation-checklist.yaml"));
    } catch {
      return;
    }
    const tiedBase = path.join(projectRoot, "tied");
    const result = await backfillRequestEvidenceEnvelope({
      request_token: MINIMAL_TOKEN,
      project_root: projectRoot,
      tied_base_path: tiedBase,
      confirmed_tied_base_path: tiedBase,
      generated_at: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.depth_tier, "minimal");
    assert.ok(result.not_applicable_receipt_path);
    assert.equal(result.envelope.schema_version, ENVELOPE_SCHEMA_VERSION);
  });

  it("optional integration: backfill external integrated client 1787603099", async () => {
    const projectRoot = EXTERNAL_INTEGRATED;
    try {
      readFileSync(path.join(projectRoot, "working", INTEGRATED_TOKEN, "agent-req-implementation-checklist.yaml"));
    } catch {
      return;
    }
    const tiedBase = path.join(projectRoot, "tied");
    const result = await backfillRequestEvidenceEnvelope({
      request_token: INTEGRATED_TOKEN,
      project_root: projectRoot,
      tied_base_path: tiedBase,
      confirmed_tied_base_path: tiedBase,
      generated_at: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.legacy_json_in_json_wrapper, true);
    assert.ok(result.gap_codes.includes("legacy_json_in_json_wrapper"));
    assert.ok(result.envelope.cross_links.citdp_path?.includes("CITDP-REQ-LISTENING_PORT_REPORT.yaml"));
    assert.equal(
      serializeEnvelope(result.envelope).includes("maturity_score"),
      false,
    );
  });
});
