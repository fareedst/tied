import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { parseClaudeStreamJsonFile } from "./parse-stream.js";

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "fixtures", "stream-json");

describe("claude adapter SC-HMEP-M1-02", () => {
  it("uses cumulative max from resume fixture", () => {
    const obs = parseClaudeStreamJsonFile(path.join(FIXTURES, "claude-resume-cumulative.jsonl"));
    assert.equal(obs.length, 1);
    assert.equal(obs[0].input_tokens, 200);
    assert.equal(obs[0].output_tokens, 90);
    assert.equal(obs[0].reasoning_tokens, 15);
  });
});
