import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assessObservationCompleteness,
  mergeClaudeCumulativeSnapshots,
  usageObjectToFields,
} from "./accounting.js";

describe("accounting [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM]", () => {
  it("SC-HMEP-M1-04 flags reasoning superset of output as incomplete", () => {
    const fields = usageObjectToFields({
      input_tokens: 1,
      output_tokens: 5,
      output_tokens_details: { thinking_tokens: 20 },
    });
    assert.equal(assessObservationCompleteness(fields), "incomplete");
  });

  it("SC-HMEP-M1-04 mergeClaude uses max not sum", () => {
    const summary = mergeClaudeCumulativeSnapshots("t1", [
      { input_tokens: 80, output_tokens: 20, reasoning_tokens: null, cache_read_input_tokens: null, cache_creation_input_tokens: null },
      { input_tokens: 200, output_tokens: 90, reasoning_tokens: 15, cache_read_input_tokens: null, cache_creation_input_tokens: null },
    ]);
    assert.equal(summary.input_tokens, 200);
    assert.equal(summary.output_tokens, 90);
    assert.equal(summary.reasoning_tokens, 15);
  });
});
