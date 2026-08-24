import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import yaml from "js-yaml";
import {
  canonicalizeValue,
  formatYamlMetadata,
  RECORD_LIST_REGISTRY,
  writeCanonicalYamlAtomic,
} from "./yaml-canonicalizer.js";

const FIXTURES_DIR = path.join(import.meta.dirname, "..", "fixtures", "record-list-sort");

function loadFixture(name: string): unknown {
  const text = fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");
  return yaml.load(text);
}

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Recursively sort maps and eligible string lists with case-insensitive-primary ordering and original-value lexical tie-breaking while preserving scalar types, ordered-list order, object-list order, mixed-list order, and opaque text structure.
test("canonicalizes nested maps and eligible string lists without changing scalar types REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = {
    z: 3,
    nested: { beta: true, alpha: "x" },
    names: ["zeta", "alpha"],
    order: ["step-2", "step-1"],
    object_list: [{ z: 1 }, { a: 2 }],
    mixed: ["z", 1],
    nullable: null,
  };

  const result = canonicalizeValue(value);

  assert.deepEqual(Object.keys(result as object), [
    "mixed",
    "names",
    "nested",
    "nullable",
    "object_list",
    "order",
    "z",
  ]);
  assert.deepEqual((result as any).names, ["alpha", "zeta"]);
  assert.deepEqual((result as any).order, ["step-2", "step-1"]);
  assert.deepEqual((result as any).object_list, [{ z: 1 }, { a: 2 }]);
  assert.deepEqual((result as any).mixed, ["z", 1]);
  assert.equal(typeof (result as any).z, "number");
  assert.equal(typeof (result as any).nested.beta, "boolean");
  assert.equal((result as any).nullable, null);
});

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Compare Unicode-lowercased values first, then original values as a deterministic case-sensitive tie-breaker.
test("canonicalizes mixed-case phrase lists and map keys deterministically REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = {
    phrases: ["zebra", "Apple", "apple", "Banana"],
    order_phrases: ["zebra", "Apple"],
    keys: {
      zebra: "z",
      Apple: "A",
      apple: "a",
      Banana: "B",
    },
  };

  const result = canonicalizeValue(value) as any;

  assert.deepEqual(result.phrases, ["Apple", "apple", "Banana", "zebra"]);
  assert.deepEqual(result.order_phrases, ["zebra", "Apple"]);
  assert.deepEqual(Object.keys(result.keys), ["Apple", "apple", "Banana", "zebra"]);
});

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Protect workflow order lists for exact key, prefix, suffix, and combined ordered-key naming patterns.
test("preserves every ordered-list key variant REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = {
    order: ["b", "a"],
    order_steps: ["b", "a"],
    recommended_order: ["b", "a"],
    recommended_order_steps: ["b", "a"],
    ordinary: ["b", "a"],
  };

  const result = canonicalizeValue(value) as any;

  assert.deepEqual(result.order, ["b", "a"]);
  assert.deepEqual(result.order_steps, ["b", "a"]);
  assert.deepEqual(result.recommended_order, ["b", "a"]);
  assert.deepEqual(result.recommended_order_steps, ["b", "a"]);
  assert.deepEqual(result.ordinary, ["a", "b"]);
});

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Exclude block-scalar bodies and IMPL pseudo-code sidecars from recursive semantic normalization; preserve their internal text structure.
test("preserves opaque block-scalar bodies REQ-TIED_YAML_CANONICALIZATION", () => {
  const source = "body: |-\n  z: first\n  a: second\n";
  const parsed = yaml.load(source) as Record<string, unknown>;
  const result = canonicalizeValue(parsed) as Record<string, unknown>;

  assert.equal(result.body, "z: first\na: second");
});

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Return stable metadata describing the canonical profile and its preservation boundaries.
test("reports tied-yaml-canonical-v1 metadata REQ-TIED_YAML_CANONICALIZATION", () => {
  const metadata = formatYamlMetadata();
  assert.equal(metadata.profile_id, "tied-yaml-canonical-v1");
  assert.equal(metadata.scalar_style, "unwrapped");
  assert.ok(["default", "repository"].includes(metadata.style_source));
  assert.equal(
    metadata.recursive_key_order,
    "case-insensitive-primary locale-independent lexical with original-value tie-break",
  );
  assert.equal(metadata.ordered_list_key_pattern, "order|order_*|*_order|*_order_*");
  assert.equal(metadata.string_list_rule, "sort all-string lists except ordered-list keys");
  assert.equal(
    metadata.record_list_rule,
    "sort recognized mapping-record lists by registry stable fields; preserve unrecognized object/mixed lists and ordered-list keys",
  );
  assert.equal(metadata.scalar_policy, "preserve string, boolean, number, and null types");
  assert.equal(metadata.opaque_block_policy, "preserve block-scalar bodies and IMPL pseudo-code sidecars");
});

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Parse, canonicalize, serialize, and atomically replace one YAML file only after every operation succeeds.
test("writes atomically and preserves invalid input REQ-TIED_YAML_CANONICALIZATION", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tied-yaml-canonical-"));
  const filePath = path.join(directory, "record.yaml");
  const original = "z: [1, 2\n";
  fs.writeFileSync(filePath, original);

  const result = writeCanonicalYamlAtomic(filePath);

  assert.equal(result.ok, false);
  assert.equal(fs.readFileSync(filePath, "utf8"), original);
});

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Recognized record lists sort complete mapping records; optional fields stay attached.
test("sorts satisfaction_criteria with metric blocks REC-SAT-CRITERIA-MULTI REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = loadFixture("sat-criteria-multi.input.yaml") as Record<string, unknown>;
  const result = canonicalizeValue(value) as any;
  const criteria = result.satisfaction_criteria.map((item: any) => item.criterion);
  assert.deepEqual(criteria, ["Alpha criterion", "Zebra criterion"]);
  const alpha = result.satisfaction_criteria[0];
  assert.equal(alpha.metric.trimEnd(), "multi\nline\nmetric");
  const zebra = result.satisfaction_criteria[1];
  assert.equal(zebra.metric, "z metric");
});

test("sorts single-line satisfaction_criteria REC-SAT-CRITERIA-SINGLE REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = loadFixture("sat-criteria-single.input.yaml") as Record<string, unknown>;
  const result = canonicalizeValue(value) as any;
  assert.deepEqual(
    result.satisfaction_criteria.map((item: any) => item.criterion),
    ["Alpha", "Zebra"],
  );
});

test("sorts validation_criteria by method REC-VAL-CRITERIA REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = loadFixture("val-criteria.input.yaml") as Record<string, unknown>;
  const result = canonicalizeValue(value) as any;
  assert.deepEqual(
    result.validation_criteria.map((item: any) => item.method),
    ["Alpha test", "Zebra test"],
  );
  assert.equal(result.validation_criteria[0].coverage, "a coverage");
});

test("sorts alternatives_considered with nested lists REC-ALT-CONSIDERED REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = loadFixture("alt-considered.input.yaml") as Record<string, unknown>;
  const result = canonicalizeValue(value) as any;
  assert.deepEqual(
    result.alternatives_considered.map((item: any) => item.name),
    ["Alpha option", "Zebra option"],
  );
  assert.deepEqual(result.alternatives_considered[0].pros, ["simple"]);
});

test("record-list tie-break uses case-insensitive-primary ordering REC-TIE-BREAK REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = loadFixture("tie-break.input.yaml") as Record<string, unknown>;
  const result = canonicalizeValue(value) as any;
  assert.deepEqual(
    result.satisfaction_criteria.map((item: any) => item.criterion),
    ["Apple", "apple", "zebra"],
  );
});

test("preserves unrecognized object lists REC-UNRECOGNIZED-PRESERVE REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = loadFixture("unrecognized-preserve.input.yaml") as Record<string, unknown>;
  const result = canonicalizeValue(value) as any;
  assert.deepEqual(result.object_list, [{ z: 1 }, { a: 2 }]);
});

test("preserves record lists under ordered-list keys REC-ORDERED-KEY-PRESERVE REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = loadFixture("ordered-key-preserve.input.yaml") as Record<string, unknown>;
  const result = canonicalizeValue(value) as any;
  assert.deepEqual(
    result.execution_order.map((item: any) => item.criterion),
    ["Zebra", "Alpha"],
  );
  assert.deepEqual(
    result.order.map((item: any) => item.criterion),
    ["Zebra", "Alpha"],
  );
});

test("preserves record list order when sort field missing REC-MISSING-FIELD-SKIP REQ-TIED_YAML_CANONICALIZATION", () => {
  const value = loadFixture("missing-field-skip.input.yaml") as Record<string, unknown>;
  const result = canonicalizeValue(value) as any;
  assert.deepEqual(result.satisfaction_criteria.length, 3);
  assert.equal(result.satisfaction_criteria[0].criterion, "Beta");
  assert.equal(result.satisfaction_criteria[1].metric, "orphan metric");
});

test("record-list registry matches ARCH contract REQ-TIED_YAML_CANONICALIZATION", () => {
  assert.deepEqual(Object.keys(RECORD_LIST_REGISTRY).sort(), [
    "alternatives_considered",
    "satisfaction_criteria",
    "validation_criteria",
  ]);
});

test("wrapped style quotes strings and preserves typed scalar output REQ-TIED_YAML_STYLE_CONFIGURATION", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-yaml-wrapped-"));
  const tiedBasePath = path.join(projectRoot, "tied");
  fs.mkdirSync(tiedBasePath);
  const filePath = path.join(projectRoot, "record.yaml");
  const previousBasePath = process.env.TIED_BASE_PATH;
  try {
    fs.writeFileSync(path.join(projectRoot, ".tied-yaml.yaml"), "scalar_style: wrapped\n");
    fs.writeFileSync(filePath, "message: hello\nflag: false\ncount: 7\nempty: null\n");
    process.env.TIED_BASE_PATH = tiedBasePath;

    const result = writeCanonicalYamlAtomic(filePath);

    assert.equal(result.ok, true);
    if (!result.ok) return;
    const output = fs.readFileSync(filePath, "utf8");
    assert.match(output, /message: "hello"/);
    assert.match(output, /flag: false/);
    assert.match(output, /count: 7/);
    assert.match(output, /empty: null/);
    assert.equal(result.yaml_format.scalar_style, "wrapped");
    assert.equal(result.yaml_format.style_source, "repository");
    const parsed = yaml.load(output) as Record<string, unknown>;
    assert.equal(typeof parsed.flag, "boolean");
    assert.equal(typeof parsed.count, "number");
    assert.equal(parsed.empty, null);
  } finally {
    if (previousBasePath === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = previousBasePath;
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});

test("invalid style configuration preserves original bytes REQ-TIED_YAML_STYLE_CONFIGURATION", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-yaml-invalid-style-"));
  const tiedBasePath = path.join(projectRoot, "tied");
  fs.mkdirSync(tiedBasePath);
  const filePath = path.join(projectRoot, "record.yaml");
  const previousBasePath = process.env.TIED_BASE_PATH;
  const previousStyle = process.env.TIED_YAML_STYLE;
  const original = "message: hello\n";
  try {
    fs.writeFileSync(path.join(projectRoot, ".tied-yaml.yaml"), "scalar_style: invalid\n");
    fs.writeFileSync(filePath, original);
    process.env.TIED_BASE_PATH = tiedBasePath;
    process.env.TIED_YAML_STYLE = "wrapped";

    const result = writeCanonicalYamlAtomic(filePath);

    assert.equal(result.ok, false);
    assert.equal(fs.readFileSync(filePath, "utf8"), original);
  } finally {
    if (previousBasePath === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = previousBasePath;
    if (previousStyle === undefined) delete process.env.TIED_YAML_STYLE;
    else process.env.TIED_YAML_STYLE = previousStyle;
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});
