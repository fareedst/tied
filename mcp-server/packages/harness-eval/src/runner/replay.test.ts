import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { resolveManifestPath } from "./import-wf.js";
import { replayBatchFromManifest } from "./replay.js";
import { openEvalDatabase } from "../store/db.js";
import { countObservationsForTrial } from "../normalize/ingest.js";
import { runCli } from "../cli/main.js";

function writeWfClient(tmp: string, name: string, wfId: string): string {
  const client = path.join(tmp, name);
  const manifestDir = path.dirname(resolveManifestPath(client));
  fs.mkdirSync(manifestDir, { recursive: true });
  const manifest = {
    schema: "wf-trial-orchestrator-run.v1",
    wf_id: wfId,
    harness: "cursor",
    model_slug: "auto",
    started_at: "2026-11-12T10:00:00.000Z",
    finished_at: "2026-11-12T10:05:00.000Z",
    exit_code: 0,
  };
  fs.writeFileSync(resolveManifestPath(client), JSON.stringify(manifest, null, 2));
  return client;
}

describe("replay batch SC-HMEP-M4-03 SC-HMEP-M4-05", () => {
  it("imports idempotently on second batch run", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-replay-"));
    const store = path.join(tmp, "store");
    const client = writeWfClient(tmp, "client-a", "WF-10");
    const manifestPath = path.join(tmp, "replay.yaml");
    fs.writeFileSync(
      manifestPath,
      `schema_version: harness-eval-replay-manifest-v1
manifest_revision: test-1
entries:
  - client_root: ${client}
    trial_id: trial-replay-a
`,
    );

    const first = replayBatchFromManifest({ manifestPath, storeRoot: store });
    assert.equal(first.entries[0].status, "imported");
    const db1 = openEvalDatabase(path.join(store, "eval.sqlite"));
    const count1 = countObservationsForTrial(db1, "trial-replay-a");
    db1.close();

    const second = replayBatchFromManifest({ manifestPath, storeRoot: store });
    assert.equal(second.entries[0].status, "imported");
    assert.equal(second.entries[0].observations_inserted, 0);
    const db2 = openEvalDatabase(path.join(store, "eval.sqlite"));
    assert.equal(countObservationsForTrial(db2, "trial-replay-a"), count1);
    db2.close();
  });

  it("skips missing client_root with exit 0 from CLI", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-replay-skip-"));
    const store = path.join(tmp, "store");
    const client = writeWfClient(tmp, "client-ok", "WF-02");
    const manifestPath = path.join(tmp, "replay.yaml");
    fs.writeFileSync(
      manifestPath,
      `schema_version: harness-eval-replay-manifest-v1
manifest_revision: test-skip
entries:
  - client_root: ${path.join(tmp, "missing-dir")}
  - client_root: ${client}
    trial_id: trial-ok
`,
    );
    const result = replayBatchFromManifest({ manifestPath, storeRoot: store });
    assert.equal(result.skipped_missing_client_root.length, 1);
    assert.equal(runCli(["replay", "batch", "--manifest", manifestPath, "--store", store]), 0);
  });
});
