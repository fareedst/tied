import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  REFLEXION_REPORT_V1_SCHEMA,
  synthesizeReflexionReportV1FromInputs,
} from "./reflexion-report-v1.js";

const RUN_ID = "easar-slice4-verify-20261018";
const OBLIGATION_REF =
  "tied-bundle/working/REQ-TIED_EASAR_RECOVERY/adversarial-inquiry/phase-verification/obligation-report.json";
const LEDGER_REF =
  "tied-bundle/working/REQ-TIED_EASAR_RECOVERY/adversarial-inquiry/phase-verification/finding-ledger.jsonl";
const GRAPH_REF =
  "tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/code-graph-matrix-receipt.v1.json";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL]
describe("EASAR reflexion choreography [REQ-TIED_EASAR_RECOVERY]", () => {
  it("synthesizes export-only report from obligation ref and gate_allowed without ledger merge", () => {
    const built = synthesizeReflexionReportV1FromInputs({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      inquiry_run_id: RUN_ID,
      gate_allowed: true,
      obligation_report_ref: OBLIGATION_REF,
      adversarial_ledger_ref: LEDGER_REF,
      divergences: [
        {
          arch_token: "ARCH-TIED_EASAR_ARTIFACT_MODEL",
          summary:
            "ARCH receipt-versioning decision assumes versioned evidence; graph index remains TS/JS static (row #4 dogfood).",
          graph_evidence_ref: GRAPH_REF,
          severity: "info",
        },
      ],
    });
    assert.equal(built.ok, true);
    if (!built.ok) return;
    const { report } = built;
    assert.equal(report.schema_version, REFLEXION_REPORT_V1_SCHEMA);
    assert.equal(report.export_only, true);
    assert.equal(report.inquiry_run_id, RUN_ID);
    assert.equal(report.obligation_report_ref, OBLIGATION_REF);
    assert.equal(report.adversarial_ledger_ref, LEDGER_REF);
    assert.equal(report.divergences.length, 1);
    assert.ok(!JSON.stringify(report.divergences).includes("finding-ledger"));
  });
});
