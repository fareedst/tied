/**
 * [REQ-TIED_EASAR_RECOVERY] Slice 6 — recovery export map + manifest (RED/GREEN).
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import yaml from "js-yaml";

import { REFLEXION_REPORT_V1_SCHEMA, type ReflexionReportV1 } from "./reflexion-report-v1.js";
import {
  buildRecoveryExportManifestV1,
  loadRecoveryPortableMapFromFile,
  parseRecoveryPortableMapV1,
  RECOVERY_EXPORT_MANIFEST_V1_SCHEMA,
  RECOVERY_PORTABLE_MAP_V1_SCHEMA,
  reflexionToVerificationReportExport,
} from "./recovery-export-v1.js";

describe("recovery-export-v1 [REQ-TIED_EASAR_RECOVERY]", () => {
  it("parseRecoveryPortableMapV1 rejects invalid transform", () => {
    const result = parseRecoveryPortableMapV1({
      schema_version: RECOVERY_PORTABLE_MAP_V1_SCHEMA,
      request_token: "REQ-TIED_EASAR_RECOVERY",
      slots: [
        {
          portable_path: "inventory.json",
          canonical_source: "evidence/inventory.v1.json",
          transform: "not_a_transform",
        },
      ],
      documented_gaps: [],
    });
    assert.equal(result.ok, false);
  });

  it("reflexionToVerificationReportExport keeps export_only and no ledger merge", () => {
    const reflexion: ReflexionReportV1 = {
      schema_version: REFLEXION_REPORT_V1_SCHEMA,
      request_token: "REQ-TIED_EASAR_RECOVERY",
      inquiry_run_id: "easar-slice4-verify-20261018",
      gate_allowed: true,
      obligation_report_ref: "tied-bundle/working/REQ-TIED_EASAR_RECOVERY/adversarial-inquiry/phase-verification/obligation-report.json",
      divergences: [{ arch_token: "ARCH-X", summary: "sample", severity: "info" }],
      export_only: true,
    };
    const report = reflexionToVerificationReportExport(reflexion);
    assert.equal(report.export_only, true);
    assert.equal(report.divergences_count, 1);
    assert.equal(report.source_reflexion_schema, "reflexion-report.v1");
  });

  it("buildRecoveryExportManifestV1 produces stable content_hash and documented gaps", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easar-export-"));
    const working = path.join(tmp, "working", "REQ-TIED_EASAR_RECOVERY");
    fs.mkdirSync(path.join(working, "evidence"), { recursive: true });
    fs.writeFileSync(
      path.join(working, "evidence", "inventory.v1.json"),
      JSON.stringify({ schema_version: "inventory.v1", request_token: "REQ-TIED_EASAR_RECOVERY", content_hash: "abc" }),
    );
    fs.writeFileSync(path.join(working, "PLAN.md"), "# Plan\n\nSlice table\n");

    const mapPath = path.join(working, "evidence", "recovery-portable-map.v1.yaml");
    const mapDoc = {
      schema_version: RECOVERY_PORTABLE_MAP_V1_SCHEMA,
      request_token: "REQ-TIED_EASAR_RECOVERY",
      documented_gaps: ["component-catalog.yaml", "claims.jsonl"],
      slots: [
        {
          portable_path: "inventory.json",
          canonical_source: "evidence/inventory.v1.json",
          transform: "copy_json",
          required: true,
        },
        {
          portable_path: "scope.md",
          canonical_source: "PLAN.md",
          transform: "markdown_excerpt",
          required: true,
        },
      ],
    };
    fs.writeFileSync(mapPath, yaml.dump(mapDoc));

    const loaded = loadRecoveryPortableMapFromFile(mapPath);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) {
      return;
    }

    const built = buildRecoveryExportManifestV1({
      map: loaded.map,
      map_path: "working/REQ-TIED_EASAR_RECOVERY/evidence/recovery-portable-map.v1.yaml",
      project_root: tmp,
      working_root: path.join("working", "REQ-TIED_EASAR_RECOVERY"),
    });
    assert.equal(built.ok, true);
    if (!built.ok) {
      return;
    }
    assert.equal(built.manifest.schema_version, RECOVERY_EXPORT_MANIFEST_V1_SCHEMA);
    assert.equal(built.manifest.export_only, true);
    assert.ok(built.manifest.gaps.includes("component-catalog.yaml"));
    assert.ok(built.manifest.entries.length >= 2);
    const first = built.manifest.content_hash;
    const second = buildRecoveryExportManifestV1({
      map: loaded.map,
      map_path: "working/REQ-TIED_EASAR_RECOVERY/evidence/recovery-portable-map.v1.yaml",
      project_root: tmp,
      working_root: path.join("working", "REQ-TIED_EASAR_RECOVERY"),
    });
    assert.equal(second.ok, true);
    if (second.ok) {
      assert.equal(second.manifest.content_hash, first);
    }
  });
});
