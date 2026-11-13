import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { runCli } from "./main.js";
import { openEvalDatabase } from "../store/db.js";
import { upsertTrialSummary } from "../normalize/ingest.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");

describe("verify trial CLI SC-HMEP-M2-06", () => {
  it("binds suite scenario wf_id to trial row", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-cli-verify-"));
    const store = path.join(tmp, "store");
    fs.mkdirSync(path.join(store, "raw"), { recursive: true });
    const db = openEvalDatabase(path.join(store, "eval.sqlite"));
    fs.writeFileSync(path.join(store, "imports.jsonl"), "");
    upsertTrialSummary(
      db,
      {
        trial_id: "bind-1",
        input_tokens: null,
        output_tokens: null,
        reasoning_tokens: null,
        cache_read_input_tokens: null,
        cache_creation_input_tokens: null,
        completeness: "absent",
        observation_count: 0,
      },
      { harness: "claude", wf_id: "WF-10", exit_code: 0 },
    );
    db.close();
    const suite = path.join(
      repoRoot,
      "docs/demos/harness-eval/suites/engineering-suite-v1.yaml",
    );
    const code = runCli([
      "verify",
      "trial",
      "--trial-id",
      "bind-1",
      "--suite",
      suite,
      "--store",
      store,
    ]);
    assert.equal(code, 0);
  });
});
