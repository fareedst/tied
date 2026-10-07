/**
 * [REQ-KAIZEN-SOURCE-NORMALIZATION] [ARCH-KAIZEN_SOURCE_NORMALIZATION] [IMPL-KAIZEN_SOURCE_NORMALIZATION]
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  defaultObservationKindFromSourceType,
  inferFeedbackEntryTypeFromObservationKind,
  rejectNonOperatorLocalPrivacy,
  resolveFeedbackEntryType,
  validateOtherQualifierRequired,
} from "./feedback-source-normalization.js";

describe("inferFeedbackEntryTypeFromObservationKind [IMPL-KAIZEN_SOURCE_NORMALIZATION]", () => {
  it("maps defect-like kinds to bug_report", () => {
    assert.equal(inferFeedbackEntryTypeFromObservationKind("incident"), "bug_report");
    assert.equal(inferFeedbackEntryTypeFromObservationKind("failed_test"), "bug_report");
  });
  it("maps friction kinds to methodology_improvement", () => {
    assert.equal(inferFeedbackEntryTypeFromObservationKind("waiting"), "methodology_improvement");
    assert.equal(inferFeedbackEntryTypeFromObservationKind("other"), "methodology_improvement");
  });
});

describe("resolveFeedbackEntryType [REQ-KAIZEN-SOURCE-NORMALIZATION]", () => {
  it("caller entry_type always wins over kind inference", () => {
    const resolved = resolveFeedbackEntryType({
      callerEntryType: "feature_request",
      observationKind: "waiting",
    });
    assert.equal(resolved.entryType, "feature_request");
    assert.equal(resolved.entryTypeOmitted, false);
  });
  it("infers bug_report when entry_type omitted and kind is failed_test", () => {
    const resolved = resolveFeedbackEntryType({ observationKind: "failed_test" });
    assert.equal(resolved.entryType, "bug_report");
    assert.equal(resolved.entryTypeOmitted, true);
  });
  it("defaults to methodology_improvement when both omitted", () => {
    const resolved = resolveFeedbackEntryType({});
    assert.equal(resolved.entryType, "methodology_improvement");
    assert.equal(resolved.entryTypeOmitted, true);
  });
});

describe("source_type default kinds [REQ-KAIZEN-SOURCE-NORMALIZATION]", () => {
  it("fixture table: incident, test_failure, metric, user_report", () => {
    assert.equal(defaultObservationKindFromSourceType("incident"), "incident");
    assert.equal(defaultObservationKindFromSourceType("test_failure"), "failed_test");
    assert.equal(defaultObservationKindFromSourceType("metric"), "missing_information");
    assert.equal(defaultObservationKindFromSourceType("user_report"), "other");
  });
});

describe("privacy tier at adapter boundary [REQ-KAIZEN-SOURCE-NORMALIZATION]", () => {
  it("rejects shareable_hashed when declared", () => {
    const result = rejectNonOperatorLocalPrivacy("shareable_hashed");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "InvalidPrivacyTier");
  });
  it("allows omitted tier", () => {
    assert.equal(rejectNonOperatorLocalPrivacy(undefined).ok, true);
  });
});

describe("other_qualifier for user_report friction [REQ-KAIZEN-SOURCE-NORMALIZATION]", () => {
  it("requires qualifier when kind is other", () => {
    const missing = validateOtherQualifierRequired("other", {});
    assert.equal(missing.ok, false);
    const ok = validateOtherQualifierRequired("other", { other_qualifier: "user_report" });
    assert.equal(ok.ok, true);
  });
});
