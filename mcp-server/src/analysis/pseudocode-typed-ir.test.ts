import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractContractBinding,
  joinTypeFacts,
  parseTypeTag,
  serializeTypeTag,
  typeFactFromTag,
  typesCompatible,
} from "./pseudocode-typed-ir.js";

describe("pseudocode-typed-ir [REQ-PSEUDOCODE_TYPED_FLOW]", () => {
  it("round-trips scalar and nullable tags (F5)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const nullable = parseTypeTag("Result | null");
    assert.ok(nullable);
    assert.equal(nullable?.kind, "nullable");
    assert.equal(serializeTypeTag(nullable!), "Result | null");
  });

  it("extracts nested contract bindings (F1b/D13)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const binding = extractContractBinding("user_id: int");
    assert.equal(binding.name, "user_id");
    assert.equal(binding.type_tag?.kind, "scalar");
    const prose = extractContractBinding("user identifier for the session");
    assert.equal(prose.prose, true);
  });

  it("joins compatible facts and flags incompatible joins (F2)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const intA = typeFactFromTag({ kind: "scalar", tag: "int" });
    const intB = typeFactFromTag({ kind: "scalar", tag: "int" });
    const joined = joinTypeFacts(intA, intB);
    assert.equal(joined.incompatible, false);

    const strB = typeFactFromTag({ kind: "scalar", tag: "string" });
    const conflict = joinTypeFacts(intA, strB);
    assert.equal(conflict.incompatible, true);
    assert.equal(conflict.fact.status, "bottom");
  });

  it("checks nullable compatibility (F3)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const nullableInt = { kind: "nullable" as const, inner: { kind: "scalar" as const, tag: "int" as const } };
    const intTag = { kind: "scalar" as const, tag: "int" as const };
    assert.equal(typesCompatible(nullableInt, intTag), true);
    assert.equal(typesCompatible(intTag, nullableInt), false);
  });
});
