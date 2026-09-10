import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseCallArgExpressions,
  parseExpression,
  splitCallArgs,
} from "./pseudocode-expression-parser.js";

describe("pseudocode-expression-parser [REQ-PSEUDOCODE_TYPED_FLOW]", () => {
  it("parses literals, refs, and binary operators (F4)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const parsed = parseExpression("count + 1");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.expr.kind, "binary");
    if (parsed.expr.kind !== "binary") return;
    assert.equal(parsed.expr.op, "+");
    assert.equal(parsed.expr.left.kind, "ref");
    assert.equal(parsed.expr.right.kind, "literal");
  });

  it("parses field and index access (F5)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const field = parseExpression("record.field");
    assert.equal(field.ok, true);
    const index = parseExpression("items[0]");
    assert.equal(index.ok, true);
  });

  it("parses is-not-null guards (F3)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const parsed = parseExpression("user is not null");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.expr.kind, "is_not_null");
  });

  it("returns unsupported for opaque prose (F7)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const parsed = parseExpression("user is authorized for this resource and quota ok");
    assert.equal(parsed.ok, false);
    if (parsed.ok) return;
    assert.equal(parsed.reason, "unsupported");
  });

  it("splits and parses CALL args (F6)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const args = splitCallArgs('1, "bad", nested(x)');
    assert.deepEqual(args, ["1", '"bad"', "nested(x)"]);
    const exprs = parseCallArgExpressions(args);
    assert.equal(exprs[0]?.kind, "literal");
    assert.equal(exprs[1]?.kind, "literal");
    assert.equal(exprs[2], null);
  });
});
