import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { resolveManifestPath } from "./import-wf.js";
import { replayBatchFromManifest } from "./replay.js";
import { openEvalDatabase } from "../store/db.js";
import { getTrialRow } from "../store/query.js";
import { buildCohortReport } from "../report/cohort.js";

describe("replay batch manifest-only SC-HMEP-M4-04", () => {
  it("preserves null tokens and cohort keys", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-replay-mo-"));
    const store = path.join(tmp, "store");
    const client = path.join(tmp, "1794525072-wf-agentstream-wf-10-cursor-grok47med");
    const manifestDir = path.dirname(resolveManifestPath(client));
    fs.mkdirSync(manifestDir, { recursive: true });
    fs.writeFileSync(
      resolveManifestPath(client),
      JSON.stringify(
        {
          schema: "wf-trial-orchestrator-run.v1",
          wf_id: "WF-10",
          harness: "cursor",
          model_slug: "grok47med",
          started_at: "2026-11-12T10:00:00.000Z",
          finished_at: "2026-11-12T10:10:00.000Z",
          exit_code: 0,
        },
        null,
        2,
      ),
    );
    const manifestPath = path.join(tmp, "replay.yaml");
    fs.writeFileSync(
      manifestPath,
      `schema_version: harness-eval-replay-manifest-v1
manifest_revision: manifest-only
entries:
  - client_root: ${client}
    jsonl_paths: []
`,
    );

    replayBatchFromManifest({ manifestPath, storeRoot: store });
    const db = openEvalDatabase(path.join(store, "eval.sqlite"));
    const trialId = path.basename(client);
    const row = getTrialRow(db, trialId);
    assert.ok(row);
    assert.equal(row.input_tokens, null);
    assert.equal(row.wf_id, "WF-10");
    assert.equal(row.harness, "cursor");
    const cohort = buildCohortReport(db);
    assert.ok(cohort.by_wf_id["WF-10"]);
    assert.ok(cohort.by_wf_id["WF-10"].some((b) => b.harness === "cursor"));
    db.close();
  });
});
