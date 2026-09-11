import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { buildRequestEvidenceEnvelope } from "./build.js";
import {
  detectDualWriteGaps,
  detectManifestExpectationGaps,
  extractCompletedSlugs,
} from "./process-adherence-gaps.js";
import type { EnvelopeArtifact } from "./types.js";
import { validateRequestEvidenceEnvelope } from "./validate.js";

const TIED_BASE = path.resolve(process.cwd(), "tied");

function dualWriteTrackerYaml(): string {
  return [
    "request: REQ-PROCESS-GAP-TEST",
    "execution_evidence:",
    "  completed:",
    "    - verification-gate",
    "steps:",
    "  - slug: verification-gate",
    "    disposition: pending",
    "  - slug: session-bootstrap",
    "    disposition: completed",
  ].join("\n");
}

function syncedTrackerYaml(): string {
  return [
    "request: REQ-PROCESS-GAP-TEST",
    "execution_evidence:",
    "  completed:",
    "    - verification-gate",
    "steps:",
    "  - slug: verification-gate",
    "    disposition: completed",
    "    evidence_refs:",
    "      - working/REQ-PROCESS-GAP-TEST/evidence/verification-evidence-manifest.v1.json",
  ].join("\n");
}

describe("process-adherence gaps [REQ-REQUEST_EVIDENCE_ENVELOPE] Wave 5", () => {
  it("W5-D1 dual-write detection emits tracker_dual_write with severity warn", () => {
    const tracker = {
      execution_evidence: { completed: ["verification-gate"] },
      steps: [{ slug: "verification-gate", disposition: "pending" }],
    };
    const gaps = detectDualWriteGaps(tracker);
    assert.ok(gaps.some((gap) => gap.code === "tracker_dual_write"));
    assert.equal(gaps.find((gap) => gap.code === "tracker_dual_write")?.severity, "warn");
  });

  it("W5-D1 dual-write cleared after disposition sync", () => {
    const tracker = {
      execution_evidence: { completed: ["verification-gate"] },
      steps: [{ slug: "verification-gate", disposition: "completed" }],
    };
    const gaps = detectDualWriteGaps(tracker);
    assert.equal(gaps.some((gap) => gap.code === "tracker_dual_write"), false);
  });

  it("W5-D2 manifest expectation when verification-gate completed without manifest", () => {
    const tracker = { execution_evidence: { completed: ["verification-gate"] } };
    const gaps = detectManifestExpectationGaps(tracker, []);
    assert.ok(gaps.some((gap) => gap.code === "expected_artifact_missing"));
    assert.equal(gaps[0]?.severity, "warn");
  });

  it("W5-D2 manifest expectation clean when manifest artifact present", () => {
    const tracker = { execution_evidence: { completed: ["verification-gate"] } };
    const artifacts: EnvelopeArtifact[] = [{
      kind: "verification_evidence_manifest",
      schema_version: "verification-evidence-manifest.v1",
      path: "working/REQ-X/evidence/verification-evidence-manifest.v1.json",
      content_hash: "sha256:abc",
      phase: null,
      status: "present",
      proof_boundaries: ["artifact_presence_only"],
    }];
    const gaps = detectManifestExpectationGaps(tracker, artifacts);
    assert.equal(gaps.length, 0);
  });

  it("W5-D3 hash drift emits evidence_stale", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "process-gap-hash-"));
    const requestToken = "REQ-PROCESS-GAP-TEST";
    const working = path.join(tempRoot, "working", requestToken);
    mkdirSync(path.join(working, "gates"), { recursive: true });
    writeFileSync(path.join(working, "agent-req-implementation-checklist.yaml"), syncedTrackerYaml());
    writeFileSync(
      path.join(working, "gates", "verification-2026-01-01.json"),
      JSON.stringify({
        schema_version: "checklist-gate-receipt.v1",
        timestamp: "2026-01-01T00:00:00.000Z",
        input_hashes: { tracker_hash: "sha256:oldhash", citdp_hash: "sha256:citdp" },
      }),
    );
    mkdirSync(path.join(tempRoot, "tied"), { recursive: true });

    const build = await buildRequestEvidenceEnvelope({
      request_token: requestToken,
      project_root: tempRoot,
      tied_base_path: TIED_BASE,
      confirmed_tied_base_path: TIED_BASE,
      depth_tier: "minimal",
      gate_policy: "advisory",
    });
    assert.equal(build.ok, true);
    if (!build.ok) return;
    assert.ok(build.envelope.gaps.some((gap) => gap.code === "evidence_stale"));
  });

  it("W5-D4 fail_on_process_gaps blocks validate while default passes", async () => {
    const envelope = {
      schema_version: "request-evidence-envelope.v1" as const,
      envelope_meta: { generated_at: "2026-01-01T00:00:00Z", generator: "test", revision: 1 },
      identity: {
        request_token: "REQ-X",
        project_id: "abc",
        depth_tier: "minimal" as const,
        gate_policy: "advisory",
        methodology_snapshot_id: "3.0.0",
      },
      runs: [],
      artifacts: [],
      cross_links: {
        tracker_path: null,
        tracker_hash: null,
        citdp_path: null,
        evidence_chain_profile_path: null,
      },
      gaps: [{
        code: "tracker_dual_write",
        artifact_kind: null,
        phase: null,
        detail: "dual-write",
        severity: "warn" as const,
      }],
    };
    const permissive = await validateRequestEvidenceEnvelope({ envelope });
    assert.equal(permissive.ok, true);
    const strict = await validateRequestEvidenceEnvelope({ envelope, fail_on_process_gaps: true });
    assert.equal(strict.ok, false);
    assert.ok(strict.diagnostics.some((item) => item === "envelope_process_gap:tracker_dual_write"));
  });

  it("dedupes duplicate checklist gate receipts per phase (prefers wave5 alias)", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "gate-dedupe-"));
    const requestToken = "REQ-GATE-DEDUPE";
    const gatesDir = path.join(tempRoot, "working", requestToken, "gates");
    mkdirSync(gatesDir, { recursive: true });
    writeFileSync(
      path.join(gatesDir, "verification-2026-09-11T02-12-04-618Z.json"),
      JSON.stringify({ phase: "verification", allowed: true, stamp: "timestamp" }),
    );
    writeFileSync(
      path.join(gatesDir, "wave5-verification-20260910.json"),
      JSON.stringify({ phase: "verification", allowed: true, stamp: "wave5-canonical" }),
    );
    mkdirSync(path.join(tempRoot, "working", requestToken, "evidence"), { recursive: true });
    writeFileSync(
      path.join(tempRoot, "working", requestToken, "agent-req-implementation-checklist.yaml"),
      "request: REQ-GATE-DEDUPE\nsteps: []\n",
    );
    mkdirSync(path.join(tempRoot, "tied"), { recursive: true });

    const build = await buildRequestEvidenceEnvelope({
      request_token: requestToken,
      project_root: tempRoot,
      tied_base_path: TIED_BASE,
      confirmed_tied_base_path: TIED_BASE,
      depth_tier: "integrated",
      gate_policy: "advisory",
    });
    assert.equal(build.ok, true);
    if (!build.ok) return;
    const gateArtifacts = build.envelope.artifacts.filter(
      (artifact) => artifact.kind === "checklist_gate_receipt" && artifact.phase === "verification",
    );
    assert.equal(gateArtifacts.length, 1);
    assert.ok(gateArtifacts[0]?.path.includes("wave5-verification"));
    assert.ok(
      !build.envelope.gaps.some(
        (gap) => gap.code === "evidence_stale" && gap.artifact_kind === "checklist_gate_receipt",
      ),
    );
  });

  it("integration: dual-write fixture tracker builds envelope gaps", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "process-gap-int-"));
    const requestToken = "REQ-PROCESS-GAP-TEST";
    const working = path.join(tempRoot, "working", requestToken);
    mkdirSync(working, { recursive: true });
    writeFileSync(path.join(working, "agent-req-implementation-checklist.yaml"), dualWriteTrackerYaml());
    mkdirSync(path.join(tempRoot, "tied"), { recursive: true });

    const build = await buildRequestEvidenceEnvelope({
      request_token: requestToken,
      project_root: tempRoot,
      tied_base_path: TIED_BASE,
      confirmed_tied_base_path: TIED_BASE,
      depth_tier: "minimal",
      gate_policy: "advisory",
    });
    assert.equal(build.ok, true);
    if (!build.ok) return;
    const codes = build.envelope.gaps.map((gap) => gap.code);
    assert.ok(codes.includes("tracker_dual_write"));
    assert.ok(codes.includes("expected_artifact_missing"));
    const trackerYaml = readFileSync(path.join(working, "agent-req-implementation-checklist.yaml"), "utf8");
    assert.ok(trackerYaml.includes("verification-gate"));
    assert.deepEqual(extractCompletedSlugs({ execution_evidence: { completed: ["verification-gate"] } }), [
      "verification-gate",
    ]);
  });
});
