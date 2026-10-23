import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalizeForStorage,
  prettyCanonicalJson,
  safeStringifyJson,
  sortStringSet,
} from "./storage-dump.js";

// [IMPL-TIED_YAML_CANONICALIZER] [REQ-TIED_YAML_CANONICALIZATION]
test("safeStringifyJson is stable across double emission JSON-STABLE", () => {
  const value = { z: 1, names: ["b", "a"], tdd_sequence: ["step-2", "step-1"] };
  const first = safeStringifyJson(value);
  const second = safeStringifyJson(JSON.parse(first.slice(0, -1)));
  assert.equal(first, second);
});

test("sortStringSet sorts lexically SET-SORT", () => {
  assert.deepEqual(sortStringSet(["Zebra", "alpha", "Beta"]), ["alpha", "Beta", "Zebra"]);
});

test("canonicalizeForStorage sorts cross_references SET-SORT", () => {
  const result = canonicalizeForStorage({ cross_references: ["z", "a"] }) as Record<string, unknown>;
  assert.deepEqual(result.cross_references, ["a", "z"]);
});

test("prettyCanonicalJson matches safeStringifyJson body without trailing newline", () => {
  const value = { b: 2, a: 1 };
  assert.equal(prettyCanonicalJson(value), safeStringifyJson(value).trimEnd());
});
