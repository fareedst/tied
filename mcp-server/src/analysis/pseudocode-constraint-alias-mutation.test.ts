import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildCallGraph } from "./pseudocode-call-graph.js";
import { buildCfg } from "./pseudocode-cfg.js";
import { runConstraintAnalysis } from "./pseudocode-constraint-language.js";
import { enforceAliasMutationPolicy } from "./pseudocode-constraint-alias-mutation.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { DEFAULT_TYPED_FLOW_BUDGETS, runTypedFlowAnalysis } from "./pseudocode-typed-flow.js";

const analysisRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "analysis");
const fixtureDir = path.join(analysisRoot, "fixtures", "constraint-language");
const typedFlowFixtureDir = path.join(analysisRoot, "fixtures", "typed-flow");

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(fixtureDir, name), "utf8");
}

function analyzeWithAliasMutation(source: string) {
  const parsed = parsePseudocodeToIr(source);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("parse failed");
  const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
  const callGraph = buildCallGraph(parsed.program, DEFAULT_BUDGETS);
  const typed = runTypedFlowAnalysis(parsed.program, cfg.section, DEFAULT_TYPED_FLOW_BUDGETS);
  const aliasMut = enforceAliasMutationPolicy(parsed.program);
  const constraint = runConstraintAnalysis(parsed.program, callGraph.section, cfg.section, typed.section);
  return { parsed, typed, aliasMut, constraint };
}

describe("pseudocode-constraint-alias-mutation [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]", () => {
  it("loads cl-17..cl-21 alias/mutation corpus fixtures", () => {
    // [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const files = fs.readdirSync(fixtureDir).filter((name) => name.endsWith(".pseudocode.md"));
    assert.ok(files.length >= 21);
  });

  it("cl-17: CL-2 emits MUTATION_VIOLATION on proven immutable mutation", () => {
    // [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-2 case 8
    const { aliasMut, constraint } = analyzeWithAliasMutation(
      loadFixture("corpus-cl-17-mutation-violation.pseudocode.md"),
    );
    assert.ok(
      aliasMut.diagnostics.some((d) => d.code === "MUTATION_VIOLATION" && d.severity === "warning"),
    );
    assert.ok(
      constraint.section.diagnostics.some((d) => d.code === "MUTATION_VIOLATION"),
    );
    assert.ok(aliasMut.alias_mut_violations >= 1);
  });

  it("cl-18: immutable respected — no MUTATION_VIOLATION", () => {
    // [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const { aliasMut } = analyzeWithAliasMutation(loadFixture("corpus-cl-18-mutation-pass.pseudocode.md"));
    assert.equal(
      aliasMut.diagnostics.some((d) => d.code === "MUTATION_VIOLATION"),
      false,
    );
  });

  it("cl-19: declared alias policy violation emits ALIAS_VIOLATION", () => {
    // [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const { aliasMut } = analyzeWithAliasMutation(
      loadFixture("corpus-cl-19-alias-policy-violation.pseudocode.md"),
    );
    assert.ok(
      aliasMut.diagnostics.some((d) => d.code === "ALIAS_VIOLATION" && d.severity === "warning"),
    );
  });

  it("cl-20: CL-3 aliasing without ALIAS POLICY yields alias_policy_absent unknown", () => {
    // [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-3 case 11
    const { aliasMut } = analyzeWithAliasMutation(
      loadFixture("corpus-cl-20-alias-policy-absent-unknown.pseudocode.md"),
    );
    assert.ok(aliasMut.unknowns.some((u) => u.cause === "alias_policy_absent"));
    assert.equal(
      aliasMut.diagnostics.some((d) => d.code === "ALIAS_VIOLATION"),
      false,
    );
  });

  it("cl-21: v1 prose immutable — no MUTATION_VIOLATION", () => {
    // [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const { aliasMut } = analyzeWithAliasMutation(
      loadFixture("corpus-cl-21-v1-immutable-prose-unknown.pseudocode.md"),
    );
    assert.equal(
      aliasMut.diagnostics.some((d) => d.code === "MUTATION_VIOLATION"),
      false,
    );
  });

  it("F8 regression: df-08/df-11 typed-flow unchanged; constraint pass no MUTATION_VIOLATION on v1", () => {
    // [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    for (const file of [
      "corpus-df-08-immutable-mutation.pseudocode.md",
      "corpus-df-11-aliasing.pseudocode.md",
    ]) {
      const source = fs.readFileSync(path.join(typedFlowFixtureDir, file), "utf8");
      const { typed, aliasMut } = analyzeWithAliasMutation(source);
      assert.equal(
        aliasMut.diagnostics.some((d) => d.code === "MUTATION_VIOLATION"),
        false,
        file,
      );
      if (file.includes("df-11")) {
        assert.ok(typed.section.unknowns.length >= 1, `${file} typed-flow unknown preserved`);
      }
    }
  });
});
