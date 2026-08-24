import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectGoTestClassifier, parseGoTestEvidence } from "./go-evidence-adapter.js";

describe("PARSE_GO_TEST_EVIDENCE REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  // [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: normalize the supported Go testing.T and testify subset with locations.
  it("normalizes t.Errorf, t.Fatalf, and testify assertions with locations", () => {
    const result = parseGoTestEvidence({
      sourceRevision: "go-rev-1",
      testCaseId: "internal/divide/divide_test.go",
      source: [
        "func TestDivideSuccess(t *testing.T) {",
        "  got, err := Divide(6, 2)",
        "  if err != nil {",
        "    t.Fatalf(\"unexpected error: %v\", err)",
        "  }",
        "  if got != 3 {",
        "    t.Errorf(\"Divide(6, 2) = %d, want 3\", got)",
        "  }",
        "  _, err = Divide(1, 0)",
        "  if err == nil {",
        "    t.Errorf(\"Divide(1, 0) expected error, got nil\")",
        "  }",
        "  assert.Equal(t, 3, got)",
        "  require.NoError(t, err)",
        "}",
      ].join("\n"),
    });

    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.observations.map((item) => item.kind), [
      "failure",
      "behavior",
      "failure",
      "behavior",
      "precondition",
    ]);
    assert.equal(result.observations[1]?.value, "t.Errorf(\"Divide(6, 2) = %d, want 3\", got)");
    assert.equal(result.observations[1]?.source.line, 7);
    assert.equal(result.observations.every((item) => item.provenance === "go-test"), true);
  });

  it("fails closed for unsupported Go test constructs", () => {
    const result = parseGoTestEvidence({
      sourceRevision: "go-rev-1",
      source: [
        "func TestUnsupported(t *testing.T) {",
        "  assert.InDelta(t, 0.5, float64(got), 0.01)",
        "  if !cmp.Equal(got, want) {",
        "    // no t.Errorf",
        "  }",
        "}",
      ].join("\n"),
    });

    assert.equal(result.observations.length, 0);
    assert.ok(result.diagnostics.some((item) => item.code === "unsupported_adapter"));
  });

  it("detects Go test paths by _test.go suffix", () => {
    assert.equal(detectGoTestClassifier("internal/divide/divide_test.go"), true);
    assert.equal(detectGoTestClassifier("test/sample_divide_good_test.rb"), false);
  });
});
