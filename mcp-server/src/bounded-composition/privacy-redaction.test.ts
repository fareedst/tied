/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [REQ-TIED_BOUNDED_COMPOSITION]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { redactBoundedSecrets } from "./privacy-redaction.js";

describe("redactBoundedSecrets", () => {
  it("redacts canary secret patterns in summaries", () => {
    const result = redactBoundedSecrets({ note: "api_key: super-secret-value" });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.redacted, true);
    const value = result.value as { note: string };
    assert.match(value.note, /\[REDACTED\]/);
    assert.ok(!value.note.includes("super-secret-value"));
  });

  it("refuses unrestricted prompt_body fields", () => {
    const result = redactBoundedSecrets({ prompt_body: "hello" });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, "PrivacyRedactionFailure");
  });
});
