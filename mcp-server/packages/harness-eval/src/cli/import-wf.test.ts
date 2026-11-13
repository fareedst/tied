import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { importWfClient, resolveManifestPath } from "../runner/import-wf.js";
import { openEvalDatabase } from "../store/db.js";
import { listTrials } from "../store/query.js";

describe("import wf SC-HMEP-M1-06", () => {
  it("manifest-only import sets fingerprint and null tokens", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-wf-"));
    const store = path.join(tmp, "store");
    const client = path.join(tmp, "client");
    const manifestDir = path.dirname(resolveManifestPath(client));
    fs.mkdirSync(manifestDir, { recursive: true });
    const manifest = {
      schema: "wf-trial-orchestrator-run.v1",
      wf_id: "WF-02",
      harness: "cursor",
      model_slug: "auto",
      model_effort: "medium",
      started_at: "2026-11-12T10:00:00.000Z",
      finished_at: "2026-11-12T10:05:00.000Z",
      exit_code: 0,
    };
    fs.writeFileSync(resolveManifestPath(client), JSON.stringify(manifest, null, 2));
    const trialId = "trial-wf-02";
    const { db: importDb } = importWfClient({ clientRoot: client, trialId, storeRoot: store });
    importDb.close();
    const db = openEvalDatabase(path.join(store, "eval.sqlite"));
    const trials = listTrials(db);
    assert.equal(trials.length, 1);
    assert.equal(trials[0].trial_id, trialId);
    assert.equal(trials[0].input_tokens, null);
    assert.equal(trials[0].output_tokens, null);
    assert.ok(trials[0].config_fingerprint);
    assert.equal(trials[0].wall_clock_ms, 300_000);
    db.close();
  });
});
