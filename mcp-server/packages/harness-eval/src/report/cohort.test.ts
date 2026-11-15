import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { openEvalDatabase } from "../store/db.js";
import { upsertTrialSummary } from "../normalize/ingest.js";
import { applyTrialPricing } from "../pricing/apply.js";
import { loadPricingCatalog } from "../pricing/catalog.js";
import { buildCohortReport } from "./cohort.js";

import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");

describe("cohort report SC-HMEP-M2-05", () => {
  it("groups trials by wf_id and harness", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-cohort-"));
    const db = openEvalDatabase(path.join(tmp, "eval.sqlite"));
    const catalog = loadPricingCatalog(
      path.join(repoRoot, "docs/agent-harness-evaluation/harness-eval/pricing/list-price-v1.yaml"),
    );
    for (const harness of ["cursor", "claude"] as const) {
      const id = `t-${harness}`;
      upsertTrialSummary(
        db,
        {
          trial_id: id,
          input_tokens: 100,
          output_tokens: 50,
          reasoning_tokens: null,
          cache_read_input_tokens: null,
          cache_creation_input_tokens: null,
          completeness: "complete",
          observation_count: 1,
        },
        { harness, wf_id: "WF-10" },
      );
      applyTrialPricing(db, id, {
        completeness: "complete",
        input_tokens: 100,
        output_tokens: 50,
      }, "claude-sonnet-5-5", catalog);
    }
    const report = buildCohortReport(db);
    assert.ok(report.by_wf_id["WF-10"]);
    assert.equal(report.by_wf_id["WF-10"].length, 2);
    db.close();
  });
});
