import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { patchRequestEvidenceEnvelope } from "./patch.js";
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
const REQUEST_TOKEN = "REQ-ENVELOPE-PATCH-TEST";

function seedWorkingRoot(tempRoot: string): string {
  const working = path.join(tempRoot, "working", REQUEST_TOKEN);
  mkdirSync(working, { recursive: true });
  mkdirSync(path.join(tempRoot, "tied"), { recursive: true });
  return working;
}

function writeArtifact(working: string, relative: string, body: string): string {
  const absolute = path.join(working, relative);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, body, "utf8");
  return absolute;
}

describe("PATCH_REQUEST_EVIDENCE_ENVELOPE [REQ-REQUEST_EVIDENCE_ENVELOPE]", () => {
  it("bootstraps revision 1 when no envelope exists", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-patch-bootstrap-"));
    const working = seedWorkingRoot(tempRoot);
    const gatePath = path.join(working, "gates", "pre.json");
    mkdirSync(path.dirname(gatePath), { recursive: true });
    writeFileSync(gatePath, '{"schema_version":"checklist-gate-receipt.v1"}\n', "utf8");
    const relGate = path.relative(tempRoot, gatePath).split(path.sep).join("/");

    const result = await patchRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: "2026-09-10T17:00:00.000Z",
      artifact: {
        kind: "checklist_gate_receipt",
        path: relGate,
        content_hash: "sha256:0000000000000000000000000000000000000000000000000000000000000001",
        phase: "pre_implementation",
        schema_version: "checklist-gate-receipt.v1",
      },
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.revision, 1);
    assert.equal(result.envelope.envelope_meta.revision, 1);
    assert.equal(result.envelope.schema_version, ENVELOPE_SCHEMA_VERSION);
    assert.ok(result.envelope.artifacts.some((artifact) => artifact.path === relGate));
  });

  it("increments revision monotonically across patches", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-patch-monotonic-"));
    const working = seedWorkingRoot(tempRoot);
    const gateA = path.join(working, "gates", "a.json");
    const gateB = path.join(working, "gates", "b.json");
    mkdirSync(path.dirname(gateA), { recursive: true });
    writeFileSync(gateA, '{"schema_version":"checklist-gate-receipt.v1","phase":"pre_implementation"}\n', "utf8");
    writeFileSync(gateB, '{"schema_version":"checklist-gate-receipt.v1","phase":"verification"}\n', "utf8");
    const relA = path.relative(tempRoot, gateA).split(path.sep).join("/");
    const relB = path.relative(tempRoot, gateB).split(path.sep).join("/");

    const first = await patchRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: "2026-09-10T17:00:00.000Z",
      artifact: {
        kind: "checklist_gate_receipt",
        path: relA,
        content_hash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        phase: "pre_implementation",
      },
    });
    const second = await patchRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: "2026-09-10T17:00:01.000Z",
      artifact: {
        kind: "checklist_gate_receipt",
        path: relB,
        content_hash: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        phase: "verification",
      },
    });

    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(first.revision, 1);
    assert.equal(second.revision, 2);
    assert.equal(second.envelope.envelope_meta.revision, 2);
  });

  it("merges artifacts by (kind, phase, path)", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-patch-merge-"));
    const working = seedWorkingRoot(tempRoot);
    const body = '{"schemaVersion":"adversarial-inquiry-provenance.v1"}\n';
    const provenance = writeArtifact(
      working,
      "adversarial-inquiry/phase-verification/evidence-provenance.json",
      body,
    );
    const rel = path.relative(tempRoot, provenance).split(path.sep).join("/");
    const hash = `sha256:${createHash("sha256").update(body).digest("hex")}`;

    await patchRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      artifact: {
        kind: "adversarial_inquiry_provenance",
        path: rel,
        content_hash: hash,
        phase: "verification",
      },
    });
    const updated = await patchRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      artifact: {
        kind: "adversarial_inquiry_provenance",
        path: rel,
        content_hash: hash,
        phase: "verification",
        status: "present",
        proof_boundaries: ["provenance_identity"],
      },
    });

    assert.equal(updated.ok, true);
    if (!updated.ok) return;
    const matches = updated.envelope.artifacts.filter(
      (artifact) => artifact.kind === "adversarial_inquiry_provenance" && artifact.path === rel,
    );
    assert.equal(matches.length, 1);
    assert.deepEqual(matches[0]?.proof_boundaries, ["provenance_identity"]);
  });

  it("returns envelope_revision_conflict on content_hash mismatch", async () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-patch-conflict-"));
    const working = seedWorkingRoot(tempRoot);
    const rel = "working/REQ-ENVELOPE-PATCH-TEST/adversarial-inquiry/phase-pre_implementation/gate-result.json";

    await patchRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      artifact: {
        kind: "adversarial_inquiry_gate",
        path: rel,
        content_hash: "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        phase: "pre_implementation",
      },
    });

    const conflict = await patchRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      artifact: {
        kind: "adversarial_inquiry_gate",
        path: rel,
        content_hash: "sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        phase: "pre_implementation",
      },
    });

    assert.equal(conflict.ok, false);
    if (conflict.ok) return;
    assert.ok(conflict.gaps.some((gap) => gap.code === "envelope_revision_conflict"));
    const envelopePath = path.join(tempRoot, "working", REQUEST_TOKEN, "evidence", "request-evidence-envelope.v1.json");
    const persisted = JSON.parse(readFileSync(envelopePath, "utf8")) as RequestEvidenceEnvelope;
    assert.equal(
      persisted.artifacts.find((artifact) => artifact.path === rel)?.content_hash,
      "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    );
  });
});

describe("PATCH_REQUEST_EVIDENCE_ENVELOPE cleanup", () => {
  it("noop cleanup marker", () => {
    assert.ok(true);
  });
});
