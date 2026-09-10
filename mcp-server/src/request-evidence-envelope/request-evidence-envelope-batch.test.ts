import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import yaml from "js-yaml";

import {
  BATCH_INPUT_SCHEMA,
  collectEnvelopeGapReport,
  computeArtifactCoverage,
  extractGapCodes,
  GAP_REPORT_SCHEMA,
  loadBatchInputManifest,
  loadRowsFromEvaluationCorpus,
  type EnvelopeGapReport,
} from "./batch-collect.js";
import { serializeEnvelope } from "./normalize.js";
import type { RequestEvidenceEnvelope } from "./types.js";
import { ENVELOPE_SCHEMA_VERSION } from "./types.js";

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
const TIED_BASE_PATH = path.join(REPO_ROOT, "tied");
const FIXTURE_ROOT = path.join(
  REPO_ROOT,
  "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-1787603099",
);
const REQUEST_TOKEN = "REQ-LISTENING_PORT_REPORT";
const EXTERNAL_FIXTURE = "/Users/fareed/Documents/dev/test/1787603099";
const GENERATED_AT = "2026-09-10T18:00:00.000Z";

function copyDir(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function seedFromSnapshots(tempRoot: string) {
  const working = path.join(tempRoot, "working", REQUEST_TOKEN);
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
    writeFileSync(path.join(working, `CITDP-${REQUEST_TOKEN}.yaml`), readFileSync(citdpSrc, "utf8"));
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

function minimalEnvelope(requestToken: string): RequestEvidenceEnvelope {
  return {
    schema_version: ENVELOPE_SCHEMA_VERSION,
    envelope_meta: { generated_at: GENERATED_AT, generator: "test", revision: 1 },
    identity: {
      request_token: requestToken,
      project_id: "abc123",
      depth_tier: "integrated",
      gate_policy: "advisory",
      methodology_snapshot_id: "3.0.0",
    },
    runs: [],
    artifacts: [
      {
        kind: "checklist_gate_receipt",
        schema_version: "gate-receipt.v1",
        path: `working/${requestToken}/gates/verification.json`,
        content_hash: "sha256:aa",
        phase: "verification",
        status: "present",
        proof_boundaries: ["gate_decision_only"],
      },
      {
        kind: "adversarial_inquiry_provenance",
        schema_version: "evidence-provenance.v1",
        path: `working/${requestToken}/adversarial-inquiry/phase-verification/evidence-provenance.json`,
        content_hash: "sha256:bb",
        phase: "verification",
        status: "expected_missing",
        proof_boundaries: ["provenance_identity"],
      },
      {
        kind: "not_applicable_receipt",
        schema_version: "not-applicable-receipt.v1",
        path: `working/${requestToken}/evidence/not-applicable-receipt.v1.json`,
        content_hash: "sha256:cc",
        phase: "pre_implementation",
        status: "present",
        proof_boundaries: ["intentional_skip"],
      },
    ],
    cross_links: {
      tracker_path: null,
      tracker_hash: null,
      citdp_path: null,
      evidence_chain_profile_path: null,
    },
    gaps: [{ code: "provenance_incomplete", artifact_kind: "adversarial_inquiry_provenance", phase: "verification", detail: "missing fields", severity: "error" }],
  };
}

describe("request evidence envelope batch collect [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH]", () => {
  it("loads batch input manifest rows", () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-batch-manifest-"));
    const manifestPath = path.join(tempRoot, "batch-inputs.yaml");
    writeFileSync(
      manifestPath,
      yaml.dump({
        schema_version: BATCH_INPUT_SCHEMA,
        rows: [
          {
            project_root: tempRoot,
            request_token: "REQ-BATCH-TEST",
            client_alias: "fixture",
            envelope_require_mode: "legacy_infer",
          },
        ],
      }),
      "utf8",
    );
    const manifest = loadBatchInputManifest(manifestPath);
    assert.equal(manifest.rows.length, 1);
    assert.equal(manifest.rows[0]?.envelope_require_mode, "legacy_infer");
  });

  it("computes artifact coverage denominators without score fields", () => {
    const envelope = minimalEnvelope("REQ-COVERAGE");
    const coverage = computeArtifactCoverage(envelope);
    assert.equal(coverage.checklist_gate_receipt?.present, 1);
    assert.equal(coverage.adversarial_inquiry_provenance?.missing, 1);
    assert.equal(coverage.pre_implementation?.waived, 1);
    const codes = extractGapCodes(envelope);
    assert.ok(codes.includes("provenance_incomplete"));
    assert.ok(!("score" in coverage));
  });

  it("excludes require_envelope rows when envelope is missing", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-batch-require-"));
    const outPath = path.join(tempRoot, "report.yaml");
    const manifestPath = path.join(tempRoot, "batch-inputs.yaml");
    writeFileSync(
      manifestPath,
      yaml.dump({
        schema_version: BATCH_INPUT_SCHEMA,
        rows: [
          {
            project_root: tempRoot,
            request_token: "REQ-MISSING-ENVELOPE",
            client_alias: "missing-client",
            envelope_require_mode: "require_envelope",
          },
        ],
      }),
      "utf8",
    );
    const result = await collectEnvelopeGapReport({
      manifestPath,
      yamlOut: outPath,
      defaultTiedBasePath: TIED_BASE_PATH,
      now: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.rows.length, 0);
    assert.equal(result.report.excluded_rows.length, 1);
    assert.equal(result.report.excluded_rows[0]?.reason, "envelope_missing");
    const parsed = yaml.load(readFileSync(outPath, "utf8")) as EnvelopeGapReport;
    assert.equal(parsed.schema_version, GAP_REPORT_SCHEMA);
    assert.equal(parsed.rows.length, 0);
    assert.ok(!Object.prototype.hasOwnProperty.call(parsed, "score"));
    assert.ok(!Object.prototype.hasOwnProperty.call(parsed, "maturity_score"));
  });

  it("legacy_infer performs read-only scan and tags legacy_inferred", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-batch-legacy-"));
    seedFromSnapshots(tempRoot);
    const outPath = path.join(tempRoot, "report.yaml");
    const result = await collectEnvelopeGapReport({
      rows: [
        {
          project_root: tempRoot,
          request_token: REQUEST_TOKEN,
          client_alias: "fixture-1787603099",
          envelope_require_mode: "legacy_infer",
          tied_base_path: TIED_BASE_PATH,
        },
      ],
      yamlOut: outPath,
      defaultTiedBasePath: TIED_BASE_PATH,
      now: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.rows.length, 1);
    const row = result.report.rows[0];
    assert.equal(row?.envelope_source, "legacy_inferred");
    assert.ok(row?.gap_codes.includes("legacy_inferred"));
    assert.ok(row?.gap_codes.includes("artifact_path_root_projection_rejected"));
    assert.ok((row?.artifact_coverage.denominator_kinds ?? 0) > 0);
  });

  it("uses existing envelope file when present", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-batch-present-"));
    const requestToken = "REQ-PRESENT-ENVELOPE";
    const evidenceDir = path.join(tempRoot, "working", requestToken, "evidence");
    mkdirSync(evidenceDir, { recursive: true });
    const envelope = minimalEnvelope(requestToken);
    writeFileSync(path.join(evidenceDir, "request-evidence-envelope.v1.json"), serializeEnvelope(envelope), "utf8");
    const outPath = path.join(tempRoot, "report.yaml");
    const result = await collectEnvelopeGapReport({
      rows: [
        {
          project_root: tempRoot,
          request_token: requestToken,
          client_alias: "present",
          envelope_require_mode: "require_envelope",
        },
      ],
      yamlOut: outPath,
      defaultTiedBasePath: TIED_BASE_PATH,
      now: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.rows[0]?.envelope_source, "envelope_file");
    assert.ok(result.report.rows[0]?.gap_codes.includes("provenance_incomplete"));
  });

  it("produces deterministic report bytes for same inputs", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-batch-stable-"));
    seedFromSnapshots(tempRoot);
    const args = {
      rows: [
        {
          project_root: tempRoot,
          request_token: REQUEST_TOKEN,
          client_alias: "stable",
          envelope_require_mode: "legacy_infer" as const,
          tied_base_path: TIED_BASE_PATH,
        },
      ],
      defaultTiedBasePath: TIED_BASE_PATH,
      now: GENERATED_AT,
    };
    const first = await collectEnvelopeGapReport({ ...args, yamlOut: path.join(tempRoot, "first.yaml") });
    const second = await collectEnvelopeGapReport({ ...args, yamlOut: path.join(tempRoot, "second.yaml") });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(readFileSync(path.join(tempRoot, "first.yaml"), "utf8"), readFileSync(path.join(tempRoot, "second.yaml"), "utf8"));
  });

  it("loads evaluation corpus extension rows without breaking legacy-only projects", () => {
    const corpusPath = path.join(REPO_ROOT, "working/evaluation/evaluation-corpus.v1.yaml");
    const rows = loadRowsFromEvaluationCorpus(corpusPath, REPO_ROOT);
    assert.ok(rows.some((row) => row.request_token === "REQ-REQUEST_EVIDENCE_ENVELOPE"));
    assert.ok(rows.some((row) => row.client_alias === "1788547701"));
    assert.ok(rows.some((row) => row.client_alias === "1787603099"));
    assert.ok(rows.every((row) => row.envelope_require_mode === "legacy_infer" || row.envelope_require_mode === "require_envelope"));
  });

  it("preserves per-row project_root from evaluation corpus", () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-batch-corpus-root-"));
    const corpusPath = path.join(tempRoot, "evaluation-corpus.v1.yaml");
    writeFileSync(
      corpusPath,
      yaml.dump({
        schema_version: "evaluation-corpus.v1",
        projects: [
          {
            client_alias: "1788547701",
            request_token: "REQ-BT_BATTERY_DISPLAY",
            project_root: "/Users/fareed/Documents/dev/test/1788547701",
            envelope_require_mode: "require_envelope",
          },
        ],
      }),
      "utf8",
    );
    const rows = loadRowsFromEvaluationCorpus(corpusPath, REPO_ROOT);
    assert.equal(rows[0]?.project_root, "/Users/fareed/Documents/dev/test/1788547701");
    assert.equal(rows[0]?.envelope_require_mode, "require_envelope");
  });

  it("strips absolute paths in shareable_hashed mode", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-batch-privacy-"));
    const requestToken = "REQ-PRIVACY";
    const evidenceDir = path.join(tempRoot, "working", requestToken, "evidence");
    mkdirSync(evidenceDir, { recursive: true });
    writeFileSync(
      path.join(evidenceDir, "request-evidence-envelope.v1.json"),
      serializeEnvelope(minimalEnvelope(requestToken)),
      "utf8",
    );
    const outPath = path.join(tempRoot, "report.yaml");
    const result = await collectEnvelopeGapReport({
      rows: [
        {
          project_root: tempRoot,
          request_token: requestToken,
          client_alias: "privacy",
          envelope_require_mode: "require_envelope",
        },
      ],
      yamlOut: outPath,
      defaultTiedBasePath: TIED_BASE_PATH,
      privacyTier: "shareable_hashed",
      includeAbsolutePaths: false,
      now: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const artifactPath = result.report.rows[0]?.envelope_artifact ?? "";
    assert.ok(!artifactPath.startsWith("/"));
    assert.ok(!artifactPath.includes(tempRoot));
  });

  it("optional integration: stdd dogfood envelope via evaluation corpus", async () => {
    const envelopePath = path.join(
      REPO_ROOT,
      "working/REQ-REQUEST_EVIDENCE_ENVELOPE/evidence/request-evidence-envelope.v1.json",
    );
    if (!existsSync(envelopePath)) return;
    const outPath = path.join(REPO_ROOT, "working/evaluation/envelope-gap-report.v1.yaml");
    const result = await collectEnvelopeGapReport({
      corpusPath: path.join(REPO_ROOT, "working/evaluation/evaluation-corpus.v1.yaml"),
      yamlOut: outPath,
      projectRoot: REPO_ROOT,
      defaultTiedBasePath: TIED_BASE_PATH,
      now: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.report.rows.some((row) => row.request_token === "REQ-REQUEST_EVIDENCE_ENVELOPE"));
  });

  it("optional integration: external 1787603099 batch row after backfill", async () => {
    const projectRoot = EXTERNAL_FIXTURE;
    try {
      readFileSync(path.join(projectRoot, "working", REQUEST_TOKEN, "agent-req-implementation-checklist.yaml"));
    } catch {
      return;
    }
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-batch-external-"));
    const envelopePath = path.join(
      projectRoot,
      "working",
      REQUEST_TOKEN,
      "evidence",
      "request-evidence-envelope.v1.json",
    );
    const hasEnvelope = existsSync(envelopePath);
    const result = await collectEnvelopeGapReport({
      rows: [
        {
          project_root: projectRoot,
          request_token: REQUEST_TOKEN,
          client_alias: "1787603099",
          envelope_require_mode: hasEnvelope ? "require_envelope" : "legacy_infer",
          tied_base_path: path.join(projectRoot, "tied"),
        },
      ],
      yamlOut: path.join(tempRoot, "external-report.yaml"),
      defaultTiedBasePath: TIED_BASE_PATH,
      now: GENERATED_AT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(
      result.report.rows[0]?.envelope_source,
      hasEnvelope ? "envelope_file" : "legacy_inferred",
    );
  });
});
