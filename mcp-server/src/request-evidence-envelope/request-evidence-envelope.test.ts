import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

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
import { buildRequestEvidenceEnvelope } from "./build.js";
import { CORPUS_INVENTORY_TO_GAP_CODE, mapCorpusInventoryString } from "./gap-codes.js";
import { serializeEnvelope } from "./normalize.js";
import type { RequestEvidenceEnvelope } from "./types.js";
import { ENVELOPE_SCHEMA_VERSION } from "./types.js";
import { validateRequestEvidenceEnvelope } from "./validate.js";

const REPO_ROOT = resolveRepoRoot();
const FIXTURE_ROOT = path.join(
  REPO_ROOT,
  "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-1787603099",
);
const TIED_BASE_PATH = path.join(REPO_ROOT, "tied");
const EXTERNAL_FIXTURE = "/Users/fareed/Documents/dev/test/1787603099";
const REQUEST_TOKEN = "REQ-LISTENING_PORT_REPORT";

function copyDir(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function seedFromSnapshots(tempRoot: string) {
  const working = path.join(tempRoot, "working", REQUEST_TOKEN);
  mkdirSync(working, { recursive: true });
  copyDir(path.join(FIXTURE_ROOT, "snapshots", "tracker"), working);
  const trackerSrc = path.join(working, "authoritative-tracker.yaml");
  if (readFileSync(trackerSrc, "utf8")) {
    writeFileSync(path.join(working, "agent-req-implementation-checklist.yaml"), readFileSync(trackerSrc, "utf8"));
  }
  copyDir(path.join(FIXTURE_ROOT, "snapshots", "citdp"), working);
  const citdpSrc = path.join(working, "citdp.yaml");
  if (readFileSync(citdpSrc, "utf8")) {
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

describe("request evidence envelope [REQ-REQUEST_EVIDENCE_ENVELOPE]", () => {
  it("rejects invalid envelope schema", async () => {
    const invalid = { schema_version: "wrong" } as unknown as RequestEvidenceEnvelope;
    const result = await validateRequestEvidenceEnvelope({ envelope: invalid });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((item) => item.startsWith("envelope_schema_invalid")));
  });

  it("W1-D3 fail_on_error_gaps blocks when severity:error gaps present", async () => {
    const envelope: RequestEvidenceEnvelope = {
      schema_version: ENVELOPE_SCHEMA_VERSION,
      envelope_meta: { generated_at: "2026-01-01T00:00:00Z", generator: "test", revision: 1 },
      identity: {
        request_token: "REQ-X",
        project_id: "abc",
        depth_tier: "integrated",
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
      gaps: [
        {
          code: "finding_unresolved",
          artifact_kind: "adversarial_inquiry_gate",
          phase: "close_out",
          detail: "observed finding",
          severity: "error",
        },
        {
          code: "finding_unresolved",
          artifact_kind: "adversarial_inquiry_gate",
          phase: "close_out",
          detail: "advisory observation",
          severity: "warn",
        },
      ],
    };
    const permissive = await validateRequestEvidenceEnvelope({ envelope });
    assert.equal(permissive.ok, true);
    assert.equal(permissive.blocking_gap_count, 1);
    assert.equal(permissive.advisory_gap_count, 1);

    const blocking = await validateRequestEvidenceEnvelope({ envelope, fail_on_error_gaps: true });
    assert.equal(blocking.ok, false);
    assert.ok(blocking.diagnostics.some((item) => item === "envelope_blocking_gap:finding_unresolved"));
  });

  it("Wave 8 integrated envelope-blocking promotes thin_ledger not evidence_stale", async () => {
    const envelope: RequestEvidenceEnvelope = {
      schema_version: ENVELOPE_SCHEMA_VERSION,
      envelope_meta: { generated_at: "2026-01-01T00:00:00Z", generator: "test", revision: 1 },
      identity: {
        request_token: "REQ-X",
        project_id: "abc",
        depth_tier: "integrated",
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
      gaps: [
        {
          code: "evidence_stale",
          artifact_kind: null,
          phase: null,
          detail: "hash drift",
          severity: "warn",
        },
        {
          code: "thin_ledger",
          artifact_kind: null,
          phase: null,
          detail: "missing outcome_verified",
          severity: "warn",
        },
      ],
    };
    const staleOnly = await validateRequestEvidenceEnvelope({ envelope, fail_on_error_gaps: true });
    assert.equal(staleOnly.ok, false);
    assert.ok(staleOnly.diagnostics.some((item) => item === "envelope_process_gap:thin_ledger"));
    assert.ok(!staleOnly.diagnostics.some((item) => item === "envelope_process_gap:evidence_stale"));

    const explicitProcess = await validateRequestEvidenceEnvelope({
      envelope,
      fail_on_process_gaps: true,
    });
    assert.equal(explicitProcess.ok, false);
    assert.ok(explicitProcess.diagnostics.some((item) => item === "envelope_process_gap:evidence_stale"));
  });

  it("rejects forbidden maturity score fields", async () => {
    const invalid = {
      schema_version: ENVELOPE_SCHEMA_VERSION,
      envelope_meta: { generated_at: "2026-01-01T00:00:00Z", generator: "test", revision: 1 },
      identity: {
        request_token: "REQ-X",
        project_id: "abc",
        depth_tier: "integrated",
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
      gaps: [],
      maturity_score: 99,
    } as unknown as RequestEvidenceEnvelope;
    const result = await validateRequestEvidenceEnvelope({ envelope: invalid });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((item) => item.includes("forbidden_field")));
  });

  it("maps corpus-manifest inventory strings to envelope gap codes (A1-A18 subset)", () => {
    for (const [inventory, code] of Object.entries(CORPUS_INVENTORY_TO_GAP_CODE)) {
      assert.equal(mapCorpusInventoryString(inventory), code);
    }
    const manifest = JSON.parse(
      readFileSync(path.join(FIXTURE_ROOT, "corpus-manifest.json"), "utf8"),
    ) as { evidence_gap_inventory: string[]; negative_cases: Array<{ expected_diagnostics: string[] }> };
    for (const inventory of manifest.evidence_gap_inventory) {
      const mapped = mapCorpusInventoryString(inventory);
      assert.notEqual(mapped, "unknown_artifact_unclassified", inventory);
    }
    for (const negativeCase of manifest.negative_cases) {
      for (const diagnostic of negativeCase.expected_diagnostics) {
        if (diagnostic.startsWith("receipt_identity_mismatch")) continue;
        if (diagnostic === "tracker_not_authoritative") continue;
        assert.ok(
          [
            "tracker_sparse",
            "artifact_path_root_projection_rejected",
            "provenance_incomplete",
            "activation_pairing_incomplete",
            "finding_unresolved",
            "command_success_unproven",
            "evidence_stale",
            "waiver_invalid",
            "sub_stub_pending",
            "parent_child_inconsistent",
            "depth_downgrade_requires_waiver",
          ].includes(diagnostic),
          diagnostic,
        );
      }
    }
  });

  it("classifies fixture snapshots and flags root projection stale", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-fixture-"));
    seedFromSnapshots(tempRoot);
    const result = await buildRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: "2026-09-10T16:00:00.000Z",
      corpus_inventory: JSON.parse(
        readFileSync(path.join(FIXTURE_ROOT, "corpus-manifest.json"), "utf8"),
      ).evidence_gap_inventory,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.envelope.schema_version, ENVELOPE_SCHEMA_VERSION);
    assert.ok(result.envelope.artifacts.some((a) => a.kind === "adversarial_inquiry_provenance"));
    assert.ok(result.envelope.artifacts.some((a) => a.status === "stale_projection"));
    assert.ok(result.envelope.gaps.some((g) => g.code === "artifact_path_root_projection_rejected"));
    assert.ok(result.envelope.gaps.some((g) => g.code === "provenance_incomplete"));
    const validation = await validateRequestEvidenceEnvelope({ envelope: result.envelope });
    assert.equal(validation.ok, true);
  });

  it("produces byte-stable envelope for same inputs", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-stable-"));
    seedFromSnapshots(tempRoot);
    const args = {
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: "2026-09-10T16:00:00.000Z",
    };
    const first = await buildRequestEvidenceEnvelope(args);
    const second = await buildRequestEvidenceEnvelope(args);
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(serializeEnvelope(first.envelope), serializeEnvelope(second.envelope));
  });

  it("fails closed on WrongTiedBasePath", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-wrong-base-"));
    seedFromSnapshots(tempRoot);
    const result = await buildRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: "/tmp/wrong/tied",
      confirmed_tied_base_path: TIED_BASE_PATH,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "WrongTiedBasePath");
  });

  it("W4-D1 omits provenance_incomplete:schema_version for root wrapper fixtures", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-provenance-wrapper-"));
    const req = "REQ-FIXTURE-ADVERSARIAL";
    const phaseDir = path.join(tempRoot, "working", req, "adversarial-inquiry", "phase-verification");
    mkdirSync(phaseDir, { recursive: true });
    const fixtureProvenance = path.join(
      REPO_ROOT,
      "mcp-server/test/fixtures/adversarial-inquiry-go-mode-b/mini-project/working/REQ-FIXTURE-ADVERSARIAL/adversarial-inquiry/phase-verification/evidence-provenance.json",
    );
    writeFileSync(
      path.join(phaseDir, "evidence-provenance.json"),
      readFileSync(fixtureProvenance, "utf8"),
      "utf8",
    );
    mkdirSync(path.join(tempRoot, "tied"), { recursive: true });
    const result = await buildRequestEvidenceEnvelope({
      request_token: req,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      depth_tier: "integrated",
      generated_at: "2026-09-10T16:00:00.000Z",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(
      !result.envelope.gaps.some((gap) => gap.detail.includes("provenance_incomplete:schema_version")),
      "root wrapper schemaVersion must satisfy A3 provenance contract",
    );
  });

  it("W4-D4 reports expected_artifact_missing for integrated depth without profile", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-profile-gap-"));
    const req = "REQ-EVIDENCE_CHAIN_PROFILE";
    mkdirSync(path.join(tempRoot, "working", req), { recursive: true });
    mkdirSync(path.join(tempRoot, "tied"), { recursive: true });
    const result = await buildRequestEvidenceEnvelope({
      request_token: req,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      depth_tier: "integrated",
      generated_at: "2026-09-10T16:00:00.000Z",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(
      result.envelope.gaps.some(
        (gap) => gap.code === "expected_artifact_missing" && gap.artifact_kind === "evidence_chain_profile",
      ),
    );
    assert.equal(result.envelope.cross_links.evidence_chain_profile_path, null);
  });

  it("W2-D4 discovers pseudocode_analysis_report with pseudocode_gate_only boundary", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-psa-"));
    const req = "REQ-PSEUDOCODE_STATIC_ANALYSIS";
    const psaDir = path.join(tempRoot, "working", req, "pseudocode-analysis");
    mkdirSync(psaDir, { recursive: true });
    writeFileSync(
      path.join(psaDir, "IMPL-PSEUDOCODE_ANALYSIS_ENGINE.v1.json"),
      JSON.stringify({
        schema_version: "pseudocode-analysis-report.v1",
        ok: true,
        gate_mode_applied: true,
        token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      }),
      "utf8",
    );
    mkdirSync(path.join(tempRoot, "tied"), { recursive: true });
    const result = await buildRequestEvidenceEnvelope({
      request_token: req,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: "2026-09-10T16:00:00.000Z",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const psa = result.envelope.artifacts.find((item) => item.kind === "pseudocode_analysis_report");
    assert.ok(psa, "expected pseudocode_analysis_report artifact");
    assert.ok(psa.proof_boundaries.includes("pseudocode_gate_only"));
  });

  it("optional integration: readonly scan of external 1787603099 fixture", async () => {
    const projectRoot = EXTERNAL_FIXTURE;
    try {
      readFileSync(path.join(projectRoot, "working", REQUEST_TOKEN, "agent-req-implementation-checklist.yaml"));
    } catch {
      return;
    }
    const tiedBase = path.join(projectRoot, "tied");
    const result = await buildRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: projectRoot,
      tied_base_path: tiedBase,
      confirmed_tied_base_path: tiedBase,
      generated_at: "2026-09-10T16:00:00.000Z",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.envelope.artifacts.length > 0);
    assert.ok(result.envelope.gaps.some((g) => g.code === "legacy_json_in_json_wrapper"));
    assert.ok(result.envelope.gaps.some((g) => g.code === "artifact_path_root_projection_rejected"));
  });
});
