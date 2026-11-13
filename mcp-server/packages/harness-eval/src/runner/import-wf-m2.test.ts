import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { importWfClient, resolveManifestPath } from "./import-wf.js";
import { openEvalDatabase } from "../store/db.js";
import { getTrialRow } from "../store/query.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");

describe("import pricing SC-HMEP-M2-03", () => {
  it("applies list price when jsonl yields complete tokens", () => {
    process.env.TIED_STORE_ROOT = repoRoot;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-wf-m2-"));
    const store = path.join(tmp, "store");
    const client = path.join(tmp, "client");
    const manifestDir = path.dirname(resolveManifestPath(client));
    fs.mkdirSync(manifestDir, { recursive: true });
    const fixture = path.join(
      repoRoot,
      "mcp-server/packages/harness-eval/fixtures/stream-json/claude-success-verbose.jsonl",
    );
    const manifest = {
      schema: "wf-trial-orchestrator-run.v1",
      wf_id: "WF-02",
      harness: "claude",
      model_slug: "claude-sonnet-5-5",
      started_at: "2026-11-12T10:00:00.000Z",
      finished_at: "2026-11-12T10:05:00.000Z",
      exit_code: 0,
    };
    fs.writeFileSync(resolveManifestPath(client), JSON.stringify(manifest, null, 2));
    const { db: importDb } = importWfClient({
      clientRoot: client,
      trialId: "pricing-trial",
      jsonlPaths: [fixture],
      storeRoot: store,
    });
    importDb.close();
    const db = openEvalDatabase(path.join(store, "eval.sqlite"));
    const row = getTrialRow(db, "pricing-trial");
    assert.ok(row);
    assert.equal(row.completeness, "complete");
    assert.ok(row.harness_estimated_cost !== null);
    assert.ok(row.harness_estimated_cost! > 0);
    db.close();
  });
});
