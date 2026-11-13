import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { upsertTrialSummary } from "../normalize/ingest.js";
import { openEvalDatabase } from "./db.js";
import { crossHarnessSummaryJson } from "./query.js";

describe("query SC-HMEP-M1-08", () => {
  it("aggregates cursor and claude trials", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-query-"));
    const db = openEvalDatabase(path.join(tmp, "eval.sqlite"));
    const base = {
      output_tokens: 10,
      reasoning_tokens: null,
      cache_read_input_tokens: null,
      cache_creation_input_tokens: null,
      completeness: "complete" as const,
      observation_count: 1,
    };
    upsertTrialSummary(db, { trial_id: "c1", input_tokens: 100, ...base }, { harness: "cursor" });
    upsertTrialSummary(db, { trial_id: "h1", input_tokens: 50, ...base }, { harness: "claude" });
    const json = JSON.parse(crossHarnessSummaryJson(db));
    assert.equal(json.by_harness.cursor.trial_count, 1);
    assert.equal(json.by_harness.claude.trial_count, 1);
    assert.equal(json.by_harness.cursor.input_tokens, 100);
    db.close();
  });
});
