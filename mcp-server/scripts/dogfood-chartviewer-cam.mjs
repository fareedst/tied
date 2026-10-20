#!/usr/bin/env node
/**
 * Dogfood [REQ-TIED_EDPC_CLIENT_ASSESSMENT] against Chart Viewer EDPC close-out (read-only).
 * Usage: node scripts/dogfood-chartviewer-cam.mjs [chartviewer_repo_root]
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "js-yaml";

import { composeEdpcClientAssessment } from "../dist/edpc/client-assessment-compose.js";
import { renderEdpcClientAssessmentMarkdown } from "../dist/edpc/client-assessment-render.js";
import { validateEdpcClientAssessment } from "../dist/edpc/client-assessment-validate.js";

const cvRoot =
  process.argv[2] ?? "/Users/fareed/Documents/persante/repos/261016/chartviewer";
const req = "REQ-CHARTVIEWER-BROWNFIELD_EDPC_COMPREHENSION";
const base = join(cvRoot, "tied-project/working", req);

const charter = YAML.load(
  readFileSync(join(base, "evidence/reports/assessment-charter.v1.yaml"), "utf8"),
);
const context = YAML.load(
  readFileSync(join(base, "evidence/reports/assessment-context.v1.yaml"), "utf8"),
);
const publish_manifest = JSON.parse(
  readFileSync(join(base, "evidence/edpc/edpc-publish-manifest.v1.json"), "utf8"),
);
const ledgerDoc = YAML.load(
  readFileSync(join(base, "evidence/edpc/claims-ledger.v1.yaml"), "utf8"),
);
const claims_ledger = (ledgerDoc.claims ?? []).map((c) => ({
  claim_id: c.claim_id,
  claim_class: c.claim_class ?? c.classification,
  text: c.statement ?? c.text,
}));

const receipt_exists = (p) => existsSync(join(cvRoot, p));

const validation = validateEdpcClientAssessment({
  charter,
  assessment_context: context,
  publish_manifest,
  receipt_exists,
});
console.log("validate:", validation.ok ? "ok" : "fail", validation.diagnostics);

const composed = composeEdpcClientAssessment({
  charter,
  assessment_context: context,
  publish_manifest,
  claims_ledger,
  receipt_exists,
});
console.log("compose:", composed.ok ? "ok" : "fail", composed.diagnostics);
if (!composed.ok) process.exit(1);

const camPath = join(base, "evidence/reports/assessment-model.v1.yaml");
writeFileSync(camPath, YAML.dump(composed.cam, { lineWidth: 120 }), "utf8");
console.log("wrote", camPath);

const rendered = renderEdpcClientAssessmentMarkdown(composed.cam);
if (!rendered.ok || !rendered.markdown) {
  console.error("render fail", rendered.diagnostics);
  process.exit(1);
}
const renderPath = join(base, "evidence/reports/technical-summary-platform-render.v1.md");
writeFileSync(renderPath, rendered.markdown, "utf8");
console.log("wrote", renderPath, "bytes", rendered.markdown.length);
