import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { persistGateDecisionReceipt } from "../gate-receipt.js";
import {
  isEnvelopeHooksEnabled,
  tryPatchRequestEvidenceEnvelope,
} from "./hooks.js";
import { patchRequestEvidenceEnvelope } from "./patch.js";

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
const REQUEST_TOKEN = "REQ-ENVELOPE-HOOK-TEST";

describe("request evidence envelope producer hooks [REQ-REQUEST_EVIDENCE_ENVELOPE]", () => {
  it("patches envelope with correct kind/phase/hash when hooks enabled", async () => {
    const previous = process.env.TIED_ENVELOPE_HOOKS;
    process.env.TIED_ENVELOPE_HOOKS = "1";
    assert.equal(isEnvelopeHooksEnabled(), true);

    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-hook-compose-"));
    const working = path.join(tempRoot, "working", REQUEST_TOKEN);
    const gatesDir = path.join(working, "gates");
    const ledgerPath = path.join(working, "adherence-ledger.jsonl");
    mkdirSync(gatesDir, { recursive: true });
    mkdirSync(path.join(tempRoot, "tied"), { recursive: true });
    writeFileSync(ledgerPath, "", "utf8");

    process.env.TIED_ENVELOPE_HOOKS = "0";
    const persisted = persistGateDecisionReceipt({
      gateResult: { allowed: true, diagnostics: [] },
      phase: "verification",
      tracker: { steps: [] },
      citdp: { citdp_id: "CITDP-X" },
      gatesDir,
      ledgerPath,
      requestToken: REQUEST_TOKEN,
      runId: "run-verification",
    });
    assert.equal(persisted.ok, true);
    if (!persisted.ok) return;

    const envelopePath = path.join(
      tempRoot,
      "working",
      REQUEST_TOKEN,
      "evidence",
      "request-evidence-envelope.v1.json",
    );
    assert.equal(existsSync(envelopePath), false);

    process.env.TIED_ENVELOPE_HOOKS = "1";
    const patched = await patchRequestEvidenceEnvelope({
      request_token: REQUEST_TOKEN,
      project_root: tempRoot,
      tied_base_path: TIED_BASE_PATH,
      confirmed_tied_base_path: TIED_BASE_PATH,
      generated_at: "2026-09-10T17:30:00.000Z",
      artifact: {
        kind: "checklist_gate_receipt",
        path: path.relative(tempRoot, persisted.path).split(path.sep).join("/"),
        content_hash: persisted.hash,
        phase: "verification",
        schema_version: "checklist-gate-receipt.v1",
        proof_boundaries: ["gate_decision_only"],
      },
      run: {
        run_id: "run-verification",
        phase: "verification",
        started_at: null,
        generator: "persistGateDecisionReceipt",
      },
    });
    assert.equal(patched.ok, true);
    if (!patched.ok) return;

    assert.equal(existsSync(envelopePath), true);
    const envelope = patched.envelope;
    const receipt = envelope.artifacts.find((artifact) => artifact.kind === "checklist_gate_receipt");
    assert.ok(receipt);
    assert.equal(receipt?.phase, "verification");
    assert.equal(receipt?.content_hash, persisted.hash);

    process.env.TIED_ENVELOPE_HOOKS = previous;
  });

  it("does not throw when envelope patch fails after inner artifact write (fail-safe)", async () => {
    const previous = process.env.TIED_ENVELOPE_HOOKS;
    process.env.TIED_ENVELOPE_HOOKS = "1";

    const tempRoot = mkdtempSync(path.join(os.tmpdir(), "ree-hook-failsafe-"));
    const artifactBody = '{"schema_version":"checklist-gate-receipt.v1"}\n';
    const artifactPath = path.join(tempRoot, "working", REQUEST_TOKEN, "gates", "verification.json");
    mkdirSync(path.dirname(artifactPath), { recursive: true });
    writeFileSync(artifactPath, artifactBody, "utf8");

    await assert.doesNotReject(async () => {
      await tryPatchRequestEvidenceEnvelope({
        request_token: REQUEST_TOKEN,
        project_root: tempRoot,
        artifact: {
          kind: "checklist_gate_receipt",
          path: "../outside/verification.json",
          content_hash: "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          phase: "verification",
        },
      });
    });

    assert.equal(readFileSync(artifactPath, "utf8"), artifactBody);
    process.env.TIED_ENVELOPE_HOOKS = previous;
  });
});
