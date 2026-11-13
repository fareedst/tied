import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { openEvalDatabase } from "../store/db.js";
import { countObservationsForTrial, insertObservations, upsertTrialSummary } from "./ingest.js";

describe("ingest SC-HMEP-M1-03", () => {
  it("re-import same origin_id is idempotent", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-ingest-"));
    const db = openEvalDatabase(path.join(tmp, "eval.sqlite"));
    const trialId = "trial-idem";
    upsertTrialSummary(
      db,
      {
        trial_id: trialId,
        input_tokens: 1,
        output_tokens: 2,
        reasoning_tokens: null,
        cache_read_input_tokens: null,
        cache_creation_input_tokens: null,
        completeness: "complete",
        observation_count: 1,
      },
      { harness: "cursor" },
    );
    const obs = [
      {
        origin_id: "origin-a",
        harness: "cursor" as const,
        source_path: "/tmp/x.jsonl",
        line_no: 1,
        event_type: "result",
        input_tokens: 10,
        output_tokens: 5,
        reasoning_tokens: null,
        cache_read_input_tokens: null,
        cache_creation_input_tokens: null,
        completeness: "complete" as const,
      },
    ];
    assert.equal(insertObservations(db, trialId, obs), 1);
    assert.equal(insertObservations(db, trialId, obs), 0);
    assert.equal(countObservationsForTrial(db, trialId), 1);
    db.close();
  });
});
