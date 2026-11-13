import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { parseCursorStreamJsonFile } from "./parse-stream.js";

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "fixtures", "stream-json");

describe("cursor adapter SC-HMEP-M1-01", () => {
  it("emits observation when usage present", () => {
    const obs = parseCursorStreamJsonFile(path.join(FIXTURES, "cursor-success-with-usage.jsonl"));
    assert.equal(obs.length, 1);
    assert.equal(obs[0].input_tokens, 120);
  });

  it("does not fabricate tokens when usage missing", () => {
    const obs = parseCursorStreamJsonFile(path.join(FIXTURES, "cursor-success-no-usage.jsonl"));
    assert.equal(obs.length, 0);
  });
});
