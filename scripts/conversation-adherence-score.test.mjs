/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] W7-D1 RED tests for transcript dimension detectors.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  DIMENSION_IDS,
  parseTranscriptLines,
  scoreAllDimensions,
  scoreCallMentionWithoutExecution,
  scoreEarlyExitAtGate,
  scoreResponseStampLegacyPhrase,
  scoreResponseStampPresent,
  scoreResponseStampVersionMismatch,
} from "./lib/conversation-adherence-dimensions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, "fixtures/conversation-adherence");

describe("conversation-adherence dimensions [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("parses jsonl transcript lines with tool_use names", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "unified-closeout.jsonl"), "utf8");
    const turns = parseTranscriptLines(raw);
    assert.ok(turns.length >= 2);
    assert.ok(turns.some((t) => t.tools.includes("CallDynamicTool")));
  });

  it("flags early_exit_at_gate when gate success has no envelope validate", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "early-exit-at-gate.jsonl"), "utf8");
    const result = scoreEarlyExitAtGate(parseTranscriptLines(raw));
    assert.equal(result.denominator, 1);
    assert.equal(result.numerator, 1);
    assert.equal(result.flagged, true);
  });

  it("does not flag early_exit when close-out sync tools appear after gate", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "unified-closeout.jsonl"), "utf8");
    const result = scoreEarlyExitAtGate(parseTranscriptLines(raw));
    assert.equal(result.flagged, false);
  });

  it("flags call_mention_without_execution when CALL text lacks tool/script", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "call-mention-without-execution.jsonl"), "utf8");
    const result = scoreCallMentionWithoutExecution(parseTranscriptLines(raw));
    assert.ok(result.denominator >= 1);
    assert.equal(result.flagged, true);
  });

  it("returns all dimensions with denominators", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "unified-closeout.jsonl"), "utf8");
    const dims = scoreAllDimensions(parseTranscriptLines(raw), { expectedMethodologyVersion: "4.0.0" });
    assert.equal(dims.length, DIMENSION_IDS.length);
    assert.deepEqual(dims.map((d) => d.id), DIMENSION_IDS);
    for (const dim of dims) {
      assert.equal(typeof dim.numerator, "number");
      assert.equal(typeof dim.denominator, "number");
      assert.equal(dim.proof_boundary, "transcript_observation_only");
    }
  });

  it("scores response_stamp_present when first line lacks TIEDv stamp", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "early-exit-at-gate.jsonl"), "utf8");
    const result = scoreResponseStampPresent(parseTranscriptLines(raw));
    assert.ok(result.denominator >= 1);
    assert.equal(result.flagged, true);
  });

  it("does not flag response_stamp_present when stamp is correct", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "response-stamp-present.jsonl"), "utf8");
    const result = scoreResponseStampPresent(parseTranscriptLines(raw));
    assert.equal(result.flagged, false);
    assert.equal(result.numerator, 0);
  });

  it("flags response_stamp_version_mismatch against expected semver", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "response-stamp-version-mismatch.jsonl"), "utf8");
    const result = scoreResponseStampVersionMismatch(parseTranscriptLines(raw), "4.0.0");
    assert.equal(result.flagged, true);
    assert.equal(result.numerator, 1);
  });

  it("records legacy phrase as warn-only severity without blocking rollup tier", () => {
    const raw = fs.readFileSync(path.join(FIXTURES, "response-stamp-legacy-warn.jsonl"), "utf8");
    const result = scoreResponseStampLegacyPhrase(parseTranscriptLines(raw));
    assert.equal(result.flagged, true);
    assert.equal(result.severity, "warn");
  });
});
