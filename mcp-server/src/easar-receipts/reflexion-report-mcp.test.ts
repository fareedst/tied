import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { buildEasarReflexionReport } from "./reflexion-report-mcp.js";
import { REFLEXION_REPORT_V1_SCHEMA } from "./reflexion-report-v1.js";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS]
describe("buildEasarReflexionReport MCP [REQ-TIED_EASAR_RECOVERY]", () => {
  it("rejects missing obligation_report_ref", () => {
    const result = buildEasarReflexionReport({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      inquiry_run_id: "easar-slice4-verify-20261018",
      gate_allowed: true,
      obligation_report_ref: "",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /missing_obligation_report_ref/);
  });

  it("writes reflexion-report.v1 under working evidence path", () => {
    const projectRoot = path.resolve(process.cwd(), "..");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easar-reflex-"));
    const result = buildEasarReflexionReport({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      inquiry_run_id: "easar-slice4-verify-20261018",
      gate_allowed: true,
      obligation_report_ref:
        "tied-bundle/working/REQ-TIED_EASAR_RECOVERY/adversarial-inquiry/phase-verification/obligation-report.json",
      adversarial_ledger_ref:
        "tied-bundle/working/REQ-TIED_EASAR_RECOVERY/adversarial-inquiry/phase-verification/finding-ledger.jsonl",
      divergences: [
        {
          arch_token: "ARCH-TIED_EASAR_ARTIFACT_MODEL",
          summary: "Receipt versioning vs static TS/JS graph scope",
          graph_evidence_ref:
            "tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/code-graph-matrix-receipt.v1.json",
          severity: "info",
        },
      ],
      project_root: projectRoot,
      output_path: path.join(tmp, "reflexion-report.v1.json"),
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.schema_version, REFLEXION_REPORT_V1_SCHEMA);
    assert.equal(result.report.export_only, true);
    assert.ok(result.written_path?.includes("reflexion-report.v1.json"));
    const raw = JSON.parse(fs.readFileSync(path.join(tmp, "reflexion-report.v1.json"), "utf8"));
    assert.equal(raw.schema_version, REFLEXION_REPORT_V1_SCHEMA);
    assert.equal(raw.divergences.length, 1);
  });
});
