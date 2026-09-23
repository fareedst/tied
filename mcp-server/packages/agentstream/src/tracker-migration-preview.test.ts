import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  checklistTestdataDirFromModule,
  goAgentstreamModuleDirFromModule,
  repoRootFromModule,
} from "./paths.js";
import {
  encodePreviewReport,
  previewTrackerMigration,
} from "./tracker-migration-preview.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
describe("tracker migration preview TS [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  const moduleDir = goAgentstreamModuleDirFromModule(import.meta.url);
  const repoRoot = repoRootFromModule(import.meta.url);
  const testdata = checklistTestdataDirFromModule(import.meta.url);

  function goPreview(def: string, track: string): TrackerMigrationPreviewReport {
    const out = execFileSync(
      "go",
      [
        "run",
        "-C",
        moduleDir,
        "./cmd/agentstream",
        "-c",
        def,
        "--checklist-tracker-preview",
        track,
      ],
      { encoding: "utf8", cwd: repoRoot },
    );
    return JSON.parse(out) as TrackerMigrationPreviewReport;
  }

  type TrackerMigrationPreviewReport = {
    schema_version: string;
    definition_slugs: string[];
    tracker_slugs: string[];
    missing_in_tracker: string[];
    extra_in_tracker: string[];
    stale_dispositions: unknown;
  };

  function normalizeReport(r: TrackerMigrationPreviewReport): string {
    return JSON.stringify({
      schema_version: r.schema_version,
      definition_slugs: r.definition_slugs,
      tracker_slugs: r.tracker_slugs,
      missing_in_tracker: r.missing_in_tracker,
      extra_in_tracker: r.extra_in_tracker,
      stale_dispositions: r.stale_dispositions,
    });
  }

  it("matches Go oracle for gate-writer-minimal golden tracker", () => {
    const def = path.join(testdata, "gate-fixture-checklist.yaml");
    const track = path.join(testdata, "gate-writer-minimal-tracker.yaml");
    assert.ok(fs.existsSync(def) && fs.existsSync(track));

    const goReport = goPreview(def, track);
    const tsReport = previewTrackerMigration(def, track);
    assert.equal(normalizeReport(tsReport), normalizeReport(goReport));
  });

  it("tied agentstream ts entry emits same JSON as Go for preview flags", () => {
    const def = path.join(testdata, "gate-fixture-checklist.yaml");
    const track = path.join(testdata, "gate-writer-minimal-tracker.yaml");
    const entry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "index.js",
    );
    assert.ok(fs.existsSync(entry), "build @tied/agentstream first");

    const tsOut = execFileSync(
      process.execPath,
      [entry, "-c", def, "--checklist-tracker-preview", track],
      { encoding: "utf8", cwd: repoRoot },
    );
    const goOut = execFileSync(
      "go",
      [
        "run",
        "-C",
        moduleDir,
        "./cmd/agentstream",
        "-c",
        def,
        "--checklist-tracker-preview",
        track,
      ],
      { encoding: "utf8", cwd: repoRoot },
    );
    assert.equal(tsOut, goOut);
  });

  it("encodePreviewReport uses trailing newline like Go json.Encoder", () => {
    const def = path.join(testdata, "gate-fixture-checklist.yaml");
    const track = path.join(testdata, "gate-writer-minimal-tracker.yaml");
    const report = previewTrackerMigration(def, track);
    assert.ok(encodePreviewReport(report).endsWith("\n"));
  });
});
