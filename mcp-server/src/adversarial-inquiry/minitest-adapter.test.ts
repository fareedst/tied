import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMinitestAssertions } from "./minitest-adapter.js";

describe("PARSE_MINITEST_ASSERTIONS REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("normalizes the supported Ruby Minitest assertion subset with locations", () => {
    const result = parseMinitestAssertions({
      sourceRevision: "ruby-rev-1",
      source: [
        "require \"minitest/autorun\"",
        "class ValidatorTest < Minitest::Test",
        "  def test_values",
        "    assert value",
        "    assert_equal expected, value",
        "    assert_empty errors",
        "    assert_raises(ArgumentError) { validate(nil) }",
        "    refute invalid",
        "  end",
        "end",
      ].join("\n"),
    });

    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.observations.map((item) => item.kind), [
      "behavior",
      "behavior",
      "behavior",
      "failure",
      "behavior",
    ]);
    assert.equal(result.observations[1]?.value, "assert_equal expected, value");
    assert.equal(result.observations[3]?.value, "assert_raises(ArgumentError)");
    assert.equal(result.observations[0]?.source.line, 4);
    assert.equal(result.observations.every((item) => item.blockRevision === "ruby-rev-1"), true);
  });

  it("fails closed for unsupported assertion constructs", () => {
    const result = parseMinitestAssertions({
      sourceRevision: "ruby-rev-1",
      source: "assert_includes values, expected\nexpect(value).must_equal expected\n",
    });

    assert.equal(result.observations.length, 0);
    assert.deepEqual(result.diagnostics.map((item) => item.code), [
      "unsupported_adapter",
      "unsupported_adapter",
    ]);
  });
});
