import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { openEvalDatabase } from "../store/db.js";
import { upsertTrialSummary } from "../normalize/ingest.js";
import { getTrialRow } from "../store/query.js";
import { findScenarioForWfId, runTrialVerifiers, allVerifiersPass } from "./trial.js";

describe("verifiers SC-HMEP-M2-04", () => {
  it("token_present fails when exit 0 but no observations", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-verify-"));
    const dbPath = path.join(tmp, "eval.sqlite");
    const db = openEvalDatabase(dbPath);
    upsertTrialSummary(
      db,
      {
        trial_id: "t-verify",
        input_tokens: null,
        output_tokens: null,
        reasoning_tokens: null,
        cache_read_input_tokens: null,
        cache_creation_input_tokens: null,
        completeness: "absent",
        observation_count: 0,
      },
      { harness: "cursor", wf_id: "WF-02", exit_code: 0 },
    );
    const trial = getTrialRow(db, "t-verify")!;
    const scenario = {
      scenario_id: "wf-02",
      prompt_workflow_ref: "PROMPT-WF-02",
      acceptance_checks: [{ id: "tokens", type: "token_present" }],
    };
    assert.ok(findScenarioForWfId([scenario], "WF-02"));
    const results = runTrialVerifiers(db, trial, scenario);
    const tokenCheck = results.find((r) => r.check_id === "tokens");
    assert.ok(tokenCheck);
    assert.equal(tokenCheck.pass, false);
    assert.equal(allVerifiersPass(results), false);
    db.close();
  });
});
