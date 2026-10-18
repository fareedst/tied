/**
 * [REQ-TIED_EASAR_RECOVERY] Slice 6 — recovery export MCP.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import yaml from "js-yaml";

import { buildEasarRecoveryExport } from "./recovery-export-mcp.js";
import { RECOVERY_PORTABLE_MAP_V1_SCHEMA } from "./recovery-export-v1.js";

describe("recovery-export-mcp [REQ-TIED_EASAR_RECOVERY]", () => {
  it("buildEasarRecoveryExport writes manifest under project root", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easar-export-mcp-"));
    const workingRel = "tied-project/working/REQ-TIED_EASAR_RECOVERY";
    const evidence = path.join(tmp, workingRel, "evidence");
    fs.mkdirSync(evidence, { recursive: true });
    fs.writeFileSync(
      path.join(evidence, "inventory.v1.json"),
      JSON.stringify({
        schema_version: "inventory.v1",
        request_token: "REQ-TIED_EASAR_RECOVERY",
        content_hash: "deadbeef",
      }),
    );

    const mapRel = `${workingRel}/evidence/recovery-portable-map.v1.yaml`;
    fs.writeFileSync(
      path.join(tmp, mapRel),
      yaml.dump({
        schema_version: RECOVERY_PORTABLE_MAP_V1_SCHEMA,
        request_token: "REQ-TIED_EASAR_RECOVERY",
        documented_gaps: ["grade-report.json"],
        slots: [
          {
            portable_path: "inventory.json",
            canonical_source: "evidence/inventory.v1.json",
            transform: "copy_json",
            required: true,
          },
        ],
      }),
    );

    const manifestRel = `${workingRel}/evidence/recovery-export-manifest.v1.json`;
    const result = buildEasarRecoveryExport({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      map_path: mapRel,
      project_root: tmp,
      manifest_output_path: manifestRel,
    });
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.ok(result.written_manifest_path?.includes("recovery-export-manifest.v1.json"));
    assert.ok(fs.existsSync(path.join(tmp, manifestRel)));
  });
});
