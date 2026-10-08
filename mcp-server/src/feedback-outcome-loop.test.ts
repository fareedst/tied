/**
 * [REQ-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN-OUTCOME-LOOP] [IMPL-KAIZEN-OUTCOME-LOOP]
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";
import { getFeedbackPath, loadFeedback } from "./feedback.js";
import type { OperationalFeedbackEntry } from "./feedback-promotion.js";
import {
  fileContentSha256,
  runOutcomeLoop,
  type FollowUpWindow,
  type OutcomeObservationPayload,
  type RunOutcomeLoopParams,
} from "./feedback-outcome-loop.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, "..", "test", "fixtures", "kaizen-outcome-loop");
const SHARED = path.join(FIXTURE_ROOT, "_shared");

const FIXTURE_NAMES = [
  "missing_baseline",
  "inconclusive_insufficient_evidence",
  "regression_to_analysis",
  "evidence_link_integrity",
  "follow_up_window_closed",
  "follow_up_window_not_open",
  "store_immutability",
] as const;

function loadSharedEntries(): OperationalFeedbackEntry[] {
  return JSON.parse(
    fs.readFileSync(path.join(SHARED, "operational-entries.json"), "utf8"),
  ) as OperationalFeedbackEntry[];
}

function loadSharedWindow(): FollowUpWindow {
  return JSON.parse(fs.readFileSync(path.join(SHARED, "follow-up-window.json"), "utf8")) as FollowUpWindow;
}

function entriesMap(entries: OperationalFeedbackEntry[]): Map<string, OperationalFeedbackEntry> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

function loadFixture(name: string): {
  params: Record<string, unknown>;
  expected: Record<string, unknown>;
} {
  const dir = path.join(FIXTURE_ROOT, name);
  return {
    params: JSON.parse(fs.readFileSync(path.join(dir, "params.json"), "utf8")) as Record<string, unknown>,
    expected: JSON.parse(fs.readFileSync(path.join(dir, "expected.json"), "utf8")) as Record<string, unknown>,
  };
}

function tmpProjectRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "kaizen-outcome-loop-"));
}

function seedFeedback(projectRoot: string, entries: OperationalFeedbackEntry[]): void {
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.writeFileSync(
    getFeedbackPath(projectRoot),
    yaml.dump({ entries }, { lineWidth: -1, noRefs: true }),
    "utf8",
  );
}

function seedTiedSampleYaml(projectRoot: string): string {
  const tiedDir = path.join(projectRoot, "tied-project");
  fs.mkdirSync(tiedDir, { recursive: true });
  const sampleYaml = path.join(tiedDir, "requirements.yaml");
  fs.writeFileSync(sampleYaml, "REQ-KAIZEN-OUTCOME-LOOP:\n  status: Planned\n", "utf8");
  return sampleYaml;
}

function outcomeObservationCount(projectRoot: string, entryId: string): number {
  const data = loadFeedback(projectRoot);
  const entry = data.entries.find((e) => e.id === entryId);
  const ctx = entry?.context;
  if (!ctx || !Array.isArray(ctx.outcome_observations)) return 0;
  return ctx.outcome_observations.length;
}

function runSingleFixture(
  name: string,
  projectRoot: string,
  entries: OperationalFeedbackEntry[],
  follow_up_window: FollowUpWindow,
): ReturnType<typeof runOutcomeLoop> {
  const fx = loadFixture(name);
  const params = fx.params;
  const payload = params.payload as OutcomeObservationPayload;
  const loopParams: RunOutcomeLoopParams = {
    payload,
    projectRoot,
    entriesById: entriesMap(entries),
    follow_up_window,
  };
  return runOutcomeLoop(loopParams);
}

describe("feedback-outcome-loop golden fixtures [REQ-KAIZEN-OUTCOME-LOOP]", () => {
  for (const name of FIXTURE_NAMES) {
    it(`fixture: ${name}`, () => {
      const fx = loadFixture(name);
      const entries = loadSharedEntries();
      const window = loadSharedWindow();
      const projectRoot = tmpProjectRoot();
      seedFeedback(projectRoot, entries);
      const sampleYaml = seedTiedSampleYaml(projectRoot);
      const feedbackBefore = fileContentSha256(getFeedbackPath(projectRoot));
      const yamlBefore = fileContentSha256(sampleYaml);
      const obsBefore = outcomeObservationCount(projectRoot, fx.params.entry_id as string);

      try {
        const result = runSingleFixture(name, projectRoot, entries, window);

        if (fx.expected.ok === false) {
          assert.equal(result.ok, false);
          if (!result.ok) assert.equal(result.error, fx.expected.error);
          if (fx.expected.feedback_unchanged) {
            assert.equal(fileContentSha256(getFeedbackPath(projectRoot)), feedbackBefore);
            assert.equal(outcomeObservationCount(projectRoot, fx.params.entry_id as string), obsBefore);
          }
          return;
        }

        assert.equal(result.ok, true, JSON.stringify(result));
        if (!result.ok) return;

        if (fx.expected.outcome) assert.equal(result.outcome, fx.expected.outcome);
        if (fx.expected.baseline_ref) assert.equal(result.baseline_ref, fx.expected.baseline_ref);

        if (fx.expected.regression_routing_required) {
          assert.ok(result.regression_routing);
          assert.equal(result.regression_routing?.route, fx.expected.regression_route);
          assert.equal(result.regression_routing?.observation_group, fx.expected.observation_group);
          assert.equal(result.regression_routing?.entry_id, fx.expected.entry_id);
        }

        if (fx.expected.observation_persisted) {
          assert.ok(result.observation_id);
          assert.equal(outcomeObservationCount(projectRoot, fx.params.entry_id as string), obsBefore + 1);
        }

        if (fx.expected.tied_project_yaml_unchanged || fx.expected.requirements_yaml_unchanged) {
          assert.equal(fileContentSha256(sampleYaml), yamlBefore);
        }

        if (fx.expected.feedback_changed) {
          assert.notEqual(fileContentSha256(getFeedbackPath(projectRoot)), feedbackBefore);
        }
      } finally {
        fs.rmSync(projectRoot, { recursive: true, force: true });
      }
    });
  }

  it("fixture: outcome_transitions", () => {
    const fx = loadFixture("outcome_transitions");
    const entries = loadSharedEntries();
    const window = loadSharedWindow();
    const projectRoot = tmpProjectRoot();
    seedFeedback(projectRoot, entries);
    seedTiedSampleYaml(projectRoot);
    const runs = fx.params.runs as Array<{
      entry_id: string;
      payload: OutcomeObservationPayload;
      expected: { ok: boolean; outcome: string };
    }>;

    try {
      let obsBefore = outcomeObservationCount(projectRoot, "fb-outcome-lead");
      for (const run of runs) {
        const result = runOutcomeLoop({
          payload: run.payload,
          projectRoot,
          entriesById: entriesMap(entries),
          follow_up_window: window,
        });
        assert.equal(result.ok, run.expected.ok, JSON.stringify(result));
        if (result.ok) {
          assert.equal(result.outcome, run.expected.outcome);
          obsBefore += 1;
          assert.equal(outcomeObservationCount(projectRoot, run.entry_id), obsBefore);
        }
      }
      assert.equal(
        outcomeObservationCount(projectRoot, "fb-outcome-lead"),
        fx.expected.observation_count_delta,
      );
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it("MissingEntry when entry id is unknown", () => {
    const projectRoot = tmpProjectRoot();
    seedFeedback(projectRoot, loadSharedEntries());
    try {
      const result = runOutcomeLoop({
        payload: {
          entry_id: "fb-missing",
          outcome: "improved",
          observed_at: "2026-09-15T12:00:00.000Z",
          evidence_links: ["baseline://x"],
        },
        projectRoot,
        entriesById: new Map(),
        follow_up_window: loadSharedWindow(),
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error, "MissingEntry");
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});
