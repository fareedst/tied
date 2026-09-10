import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  GRAMMAR_VERSION,
  GRAMMAR_VERSION_V2,
} from "./pseudocode-ir.js";
import {
  detectGrammarVersion,
  parsePseudocodeToIr,
  serializeIrProgram,
} from "./pseudocode-parser.js";

const analysisRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "analysis");
const fixtureDir = path.join(analysisRoot, "fixtures", "constraint-language");
const typedFlowFixtureDir = path.join(analysisRoot, "fixtures", "typed-flow");

type CorpusEntry = {
  id: string;
  file: string;
  expectV2: boolean;
  assertIr?: (source: string) => void;
};

const CORPUS: CorpusEntry[] = [
  {
    id: "01",
    file: "corpus-cl-01-v2-header-refinement.pseudocode.md",
    expectV2: true,
    assertIr: (source) => {
      const result = parsePseudocodeToIr(source);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      const proc = result.program.procedures.find((p) => p.name === "VALIDATE_ITEMS")!;
      const input = proc.contract.entries?.find((e) => e.field === "INPUT");
      assert.equal(input?.refinement, "length(items) > 0");
      assert.equal(input?.type_tag?.kind, "list");
      const post = proc.contract.entries?.find((e) => e.field === "POST");
      assert.equal(post?.refinement, "count >= 0");
    },
  },
  {
    id: "02",
    file: "corpus-cl-02-v2-summary-decl.pseudocode.md",
    expectV2: true,
    assertIr: (source) => {
      const result = parsePseudocodeToIr(source);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      const proc = result.program.procedures.find((p) => p.name === "PROCESS_ITEMS")!;
      assert.equal(proc.summaries?.length, 2);
      const callSummary = proc.summaries?.find((s) => s.kind === "call");
      assert.ok(callSummary);
      assert.ok(callSummary!.entries.some((e) => e.key === "mutates" && e.value === "items"));
      assert.ok(callSummary!.entries.some((e) => e.key === "aliases" && e.value === "output -> items"));
      const returnSummary = proc.summaries?.find((s) => s.kind === "return");
      assert.ok(returnSummary);
      assert.ok(returnSummary!.entries.some((e) => e.key === "ensures" && e.value === "count >= 0"));
    },
  },
  {
    id: "03",
    file: "corpus-cl-03-v2-alias-policy.pseudocode.md",
    expectV2: true,
    assertIr: (source) => {
      const result = parsePseudocodeToIr(source);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      const proc = result.program.procedures.find((p) => p.name === "ALIAS_EXAMPLE")!;
      assert.equal(proc.alias_policy?.entries.length, 2);
      assert.ok(proc.alias_policy!.entries.some((e) => e.rule === "output may alias input"));
      assert.ok(proc.alias_policy!.entries.some((e) => e.rule === "temp does not alias output"));
    },
  },
  {
    id: "04",
    file: "corpus-cl-04-v2-immutable-data.pseudocode.md",
    expectV2: true,
    assertIr: (source) => {
      const result = parsePseudocodeToIr(source);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      const proc = result.program.procedures.find((p) => p.name === "READ_CONFIG")!;
      const config = proc.contract.entries?.find((e) => e.field === "INPUT");
      assert.equal(config?.mutability, "immutable");
      assert.equal(config?.type_tag?.kind, "named");
      const scratch = proc.contract.entries?.find((e) => e.field === "DATA");
      assert.equal(scratch?.mutability, "mutable");
    },
  },
  {
    id: "05",
    file: "corpus-cl-05-v1-compat-no-header.pseudocode.md",
    expectV2: false,
    assertIr: (source) => {
      const result = parsePseudocodeToIr(source);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      assert.equal(result.program.grammar_version, GRAMMAR_VERSION);
      const proc = result.program.procedures.find((p) => p.name === "LEGACY")!;
      assert.equal(proc.summaries, undefined);
      assert.equal(proc.alias_policy, undefined);
      assert.equal(proc.contract.entries?.find((e) => e.field === "INPUT")?.refinement, undefined);
    },
  },
  {
    id: "06",
    file: "corpus-cl-06-v2-mixed-v1-constructs.pseudocode.md",
    expectV2: true,
    assertIr: (source) => {
      const result = parsePseudocodeToIr(source);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      const proc = result.program.procedures.find((p) => p.name === "MIXED_V2")!;
      assert.equal(proc.contract.entries?.length, 7);
      assert.equal(proc.contract.type_tags?.user_id?.kind, "scalar");
      assert.equal(proc.contract.values?.INPUT, "session description prose field");
    },
  },
];

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(fixtureDir, name), "utf8");
}

describe("pseudocode-grammar-v2 [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]", () => {
  it("loads constraint-language parse fixtures cl-01..06 (F1)", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const files = fs.readdirSync(fixtureDir).filter((name) => name.endsWith(".pseudocode.md"));
    assert.ok(files.length >= 6);
    assert.equal(CORPUS.length, 6);
  });

  it("detects v2 from preamble header and defaults to v1 when absent", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const v2Source = loadFixture("corpus-cl-01-v2-header-refinement.pseudocode.md");
    assert.equal(detectGrammarVersion(v2Source), GRAMMAR_VERSION_V2);
    const v1Source = loadFixture("corpus-cl-05-v1-compat-no-header.pseudocode.md");
    assert.equal(detectGrammarVersion(v1Source), GRAMMAR_VERSION);
  });

  it("ignores grammar_version_override outside qualification_mode", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const v1Source = loadFixture("corpus-cl-05-v1-compat-no-header.pseudocode.md");
    assert.equal(
      detectGrammarVersion(v1Source, { grammar_version_override: "v2" }),
      GRAMMAR_VERSION,
    );
  });

  it("accepts grammar_version_override in qualification_mode", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const v1Source = loadFixture("corpus-cl-05-v1-compat-no-header.pseudocode.md");
    assert.equal(
      detectGrammarVersion(v1Source, {
        grammar_version_override: "v2",
        qualification_mode: true,
      }),
      GRAMMAR_VERSION_V2,
    );
  });

  it("does not select v2 from file extension alone", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = "procedure X:\n  Contract:\n    INPUT: a\n    OUTPUT: b\n    PRE: a\n    POST: b\n    EFFECTS: pure\n  RETURN b";
    assert.equal(detectGrammarVersion(source), GRAMMAR_VERSION);
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.program.grammar_version, GRAMMAR_VERSION);
  });

  for (const entry of CORPUS) {
    it(`corpus-cl-${entry.id} parses with expected grammar version and IR fields`, () => {
      // [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
      const source = loadFixture(entry.file);
      const result = parsePseudocodeToIr(source);
      assert.equal(result.ok, true, `fixture ${entry.file} must parse`);
      if (!result.ok) return;
      assert.equal(
        result.program.grammar_version,
        entry.expectV2 ? GRAMMAR_VERSION_V2 : GRAMMAR_VERSION,
      );
      entry.assertIr?.(source);
    });
  }

  it("F8: typed-flow fixtures parse unchanged without v2 header", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] F8 regression vs typed-flow Phase 3
    const files = fs
      .readdirSync(typedFlowFixtureDir)
      .filter((name) => name.endsWith(".pseudocode.md"))
      .sort();
    assert.equal(files.length, 28);
    for (const file of files) {
      const source = fs.readFileSync(path.join(typedFlowFixtureDir, file), "utf8");
      const result = parsePseudocodeToIr(source);
      assert.equal(result.ok, true, `${file} must parse`);
      if (!result.ok) continue;
      assert.equal(result.program.grammar_version, GRAMMAR_VERSION, `${file} must stay v1`);
      assert.equal(result.program.procedures.every((p) => !p.summaries), true, `${file} no summaries`);
      assert.equal(result.program.procedures.every((p) => !p.alias_policy), true, `${file} no alias policy`);
    }
  });

  it("serializes v2 IR deterministically", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadFixture("corpus-cl-02-v2-summary-decl.pseudocode.md");
    const r1 = parsePseudocodeToIr(source);
    const r2 = parsePseudocodeToIr(source.replace(/\n/g, "\r\n"));
    assert.equal(r1.ok, true);
    assert.equal(r2.ok, true);
    if (!r1.ok || !r2.ok) return;
    assert.equal(serializeIrProgram(r1.program), serializeIrProgram(r2.program));
  });
});
