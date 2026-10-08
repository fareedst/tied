/**
 * [REQ-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] — MCP handler composition bindings.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { getFeedbackPath } from "../feedback.js";
import { allTools } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function tool(name: string) {
  const found = allTools.find((candidate) => candidate.name === name);
  assert.ok(found, `missing MCP tool ${name}`);
  return found;
}

function writeFeedbackYaml(basePath: string, entries: unknown[]): void {
  fs.mkdirSync(basePath, { recursive: true });
  fs.writeFileSync(getFeedbackPath(basePath), yaml.dump({ entries }, { lineWidth: -1, noRefs: true }), "utf8");
}

const FIXTURE_ROOT = path.join(__dirname, "../../test/fixtures");

describe("Kaizen feedback MCP composition [REQ-KAIZEN-FEEDBACK-MCP-WIRING]", () => {
  it("binds tied_feedback_analysis_digest to buildFeedbackDigest", async () => {
    const fixtureDir = path.join(FIXTURE_ROOT, "kaizen-feedback-analysis/recurrence_duplicate_groups");
    const feedback = JSON.parse(fs.readFileSync(path.join(fixtureDir, "feedback.json"), "utf8")) as {
      entries: unknown[];
    };
    const params = JSON.parse(fs.readFileSync(path.join(fixtureDir, "params.json"), "utf8")) as {
      cohort: Record<string, unknown>;
    };
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kmcp-digest-"));
    try {
      writeFeedbackYaml(root, feedback.entries);
      const response = await tool("tied_feedback_analysis_digest").handler({
        cohort: params.cohort,
        include_markdown: false,
        base_path: root,
      } as never);
      const parsed = JSON.parse(response.content[0].text) as {
        ok: boolean;
        digest?: { schema_version: string };
        projection_hash?: string;
      };
      assert.equal(parsed.ok, true);
      assert.equal(parsed.digest?.schema_version, "feedback-analysis.v1");
      assert.ok(parsed.projection_hash);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds tied_feedback_review_bridge to ReviewRequired without review", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kmcp-bridge-"));
    try {
      writeFeedbackYaml(root, [
        {
          id: "fb-bridge-1",
          type: "bug_report",
          title: "t",
          description: "d",
          created_at: "2026-06-01T10:00:00.000Z",
          duplicate_group: "dg-bridge",
        },
      ]);
      const digest = {
        schema_version: "feedback-analysis.v1",
        client_cohort: {
          compatibility_key: "k",
          denominator_fingerprint: "f",
          analysis_window: { start: null, end: null },
        },
        inputs: { manifest_ref: null, entries: 1, excluded: 0, unknown: 0 },
        observations: {
          by_kind: {},
          duplicate_groups: [{ duplicate_group: "dg-bridge", member_ids: ["fb-bridge-1"], first_seen: "2026-06-01T10:00:00.000Z" }],
          recurrence: [],
        },
        impact: { numerator: 1, denominator: 1, unknown: 0 },
        findings: [],
        countermeasures: [],
        review: { decision: "deferred_review", reviewer: null },
        excluded: [],
      };
      const response = await tool("tied_feedback_review_bridge").handler({
        digest,
        observation_group: "dg-bridge",
        base_path: root,
      } as never);
      const parsed = JSON.parse(response.content[0].text) as { ok: boolean; error?: string };
      assert.equal(parsed.ok, false);
      assert.equal(parsed.error, "ReviewRequired");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds tied_feedback_outcome_record to follow-up window errors", async () => {
    const shared = path.join(FIXTURE_ROOT, "kaizen-outcome-loop/_shared");
    const entries = JSON.parse(fs.readFileSync(path.join(shared, "operational-entries.json"), "utf8")) as unknown[];
    const window = JSON.parse(fs.readFileSync(path.join(shared, "follow-up-window.json"), "utf8")) as {
      start?: string;
      end?: string;
    };
    const params = JSON.parse(
      fs.readFileSync(path.join(FIXTURE_ROOT, "kaizen-outcome-loop/follow_up_window_closed/params.json"), "utf8"),
    ) as { payload: Record<string, unknown> };
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kmcp-outcome-"));
    try {
      writeFeedbackYaml(root, entries);
      const response = await tool("tied_feedback_outcome_record").handler({
        payload: params.payload,
        follow_up_window: window,
        base_path: root,
      } as never);
      const parsed = JSON.parse(response.content[0].text) as { ok: boolean; error?: string };
      assert.equal(parsed.ok, false);
      assert.equal(parsed.error, "FollowUpWindowClosed");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds tied_feedback_pilot_run to invalid cohort sizing", async () => {
    const fixtureDir = path.join(FIXTURE_ROOT, "kaizen-feedback-pilot/incompatible_cohort_size");
    const feedback = JSON.parse(fs.readFileSync(path.join(fixtureDir, "feedback.json"), "utf8")) as {
      entries: unknown[];
    };
    const params = JSON.parse(fs.readFileSync(path.join(fixtureDir, "params.json"), "utf8")) as {
      spec: Record<string, unknown>;
    };
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kmcp-pilot-"));
    try {
      writeFeedbackYaml(root, feedback.entries);
      const response = await tool("tied_feedback_pilot_run").handler({
        spec: params.spec,
        base_path: root,
      } as never);
      const parsed = JSON.parse(response.content[0].text) as { ok: boolean; error?: string };
      assert.equal(parsed.ok, false);
      assert.ok(parsed.error);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
