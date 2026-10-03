/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] W3 prompt-type advisory
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { advisePromptTypes } from "./prompt-type-advisory.js";
import { heuristicInferPromptTypes } from "./prompt-type-heuristic.js";
import { LEAF_PROMPT_TYPES } from "./prompt-type-taxonomy.js";

describe("REQ-TIED_JEV_DECISION_COPROCESSOR W3 prompt-type advisory", () => {
  it("heuristicInferPromptTypes detects slash build-plan", () => {
    assert.deepEqual(heuristicInferPromptTypes("/build-plan W2 for Jev"), ["build-plan"]);
  });

  it("heuristicInferPromptTypes preserves explicit sequence order", () => {
    assert.deepEqual(
      heuristicInferPromptTypes("run refine-plan then build-plan on linked plan"),
      ["refine-plan", "build-plan"],
    );
  });

  it("heuristicInferPromptTypes maps non-tied-plan", () => {
    assert.deepEqual(heuristicInferPromptTypes("non-tied-plan add logging only"), [
      "non-tied-plan",
    ]);
  });

  it("heuristicInferPromptTypes avoids bare debug when non-tied-debug named", () => {
    assert.deepEqual(heuristicInferPromptTypes("non-tied-debug flaky test"), [
      "non-tied-debug",
    ]);
  });

  it("every leaf type is matchable by an explicit token fixture", () => {
    for (const type of LEAF_PROMPT_TYPES) {
      const found = heuristicInferPromptTypes(`please use ${type} for this task`);
      assert.ok(found.includes(type));
    }
  });

  it("advisePromptTypes uses heuristic when Jev skipped", async () => {
    const log = await advisePromptTypes("/build-plan W3", { apiKey: undefined });
    assert.equal(log.jev_skipped, true);
    assert.deepEqual(log.suggested_prompt_types, ["build-plan"]);
    assert.equal(log.tied_applicability, "full");
    assert.ok(log.envelope_hint.includes("prompt-type: build-plan"));
  });

  it("advisePromptTypes records disagreement when Jev primary diverges", async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          model: "jev-1.13.0",
          answers: {
            primary_prompt_type: {
              type: "choice",
              choice: "question",
              confidence: 0.8,
            },
            tied_applicability: {
              type: "choice",
              choice: "minimal",
            },
            needs_linked_plan: { type: "noul", noul: 0.1 },
          },
        }),
        { status: 200 },
      );

    const log = await advisePromptTypes("/build-plan W3", {
      apiKey: "test",
      fetchImpl,
      traceEnv: { TIED_JEV_DECISION_PROVIDER: "remote" },
    });
    assert.deepEqual(log.heuristic_prompt_types, ["build-plan"]);
    assert.equal(log.jev_prompt_types[0], "question");
    assert.deepEqual(log.suggested_prompt_types, ["build-plan"]);
    assert.equal(log.agrees, false);
  });

  it("advisePromptTypes never returns unknown prompt types", async () => {
    const log = await advisePromptTypes("question about YAML", { apiKey: undefined });
    for (const t of log.suggested_prompt_types) {
      assert.ok((LEAF_PROMPT_TYPES as readonly string[]).includes(t));
    }
  });
});
