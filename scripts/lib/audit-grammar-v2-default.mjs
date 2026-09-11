/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Compose bootstrap template inspection, Layer B/C smoke validation, and legacy-v1 classification.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { analyzeEssencePseudocode } from "../../mcp-server/dist/analysis/pseudocode-analyzer.js";
import { validateEssencePseudocode } from "../../mcp-server/dist/analysis/pseudocode-validator.js";
import {
  auditNewClientGrammar,
  classifySidecarVersion,
  evaluateGrammarV2HeaderDimension,
  extractCopyableSidecarTemplate,
} from "../../mcp-server/dist/analysis/pseudocode-grammar-v2-default.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..", "..");
export const SMOKE_SIDECAR_PATH = path.join(REPO_ROOT, "scripts", "fixtures", "grammar-v2-default-smoke.sidecar.md");
export const LEGACY_SIDECAR_PATH = path.join(
  REPO_ROOT,
  "tied",
  "implementation-decisions",
  "IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT-pseudocode.md",
);
export const CLIENT_TEMPLATE_REL = path.join("templates", "impl-essence-pseudocode-template.md");

const SMOKE_IMPL_TOKEN = "IMPL-GRAMMAR-V2-SMOKE";
const SMOKE_KNOWN_TOKENS = [
  "IMPL-GRAMMAR-V2-SMOKE",
  "ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT",
  "REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT",
];

export function readClientSidecarTemplate(clientRoot) {
  const templatePath = path.join(clientRoot, CLIENT_TEMPLATE_REL);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing client sidecar template: ${templatePath}`);
  }
  const templateFileBody = fs.readFileSync(templatePath, "utf8");
  return {
    templatePath,
    copyableBody: extractCopyableSidecarTemplate(templateFileBody),
  };
}

export function runLayerBReport(pseudocode, token, knownTokens = SMOKE_KNOWN_TOKENS) {
  const report = validateEssencePseudocode({
    token,
    pseudocode,
    known_tokens: knownTokens,
  });
  const errors = report.diagnostics.filter((item) => item.severity === "error");
  return {
    ok: report.ok && errors.length === 0,
    schema_version: report.schema_version,
    error_count: errors.length,
    diagnostics: errors.slice(0, 5),
  };
}

export function runLayerCReport(pseudocode, token, { constraintFlow = false } = {}) {
  const report = analyzeEssencePseudocode({
    token,
    pseudocode,
    known_tokens: SMOKE_KNOWN_TOKENS,
    gate_mode: true,
    constraint_flow: constraintFlow,
  });
  return {
    ok: report.ok === true,
    gate_mode_applied: report.gate_mode_applied === true,
    constraint_flow: constraintFlow,
    stage: report.ok === false ? report.stage : undefined,
    error: report.ok === false ? report.error : undefined,
  };
}

export function runLegacyCompatibilityReport(legacySidecarPath = LEGACY_SIDECAR_PATH) {
  const legacyBody = fs.readFileSync(legacySidecarPath, "utf8");
  const classification = classifySidecarVersion(legacyBody);
  return {
    compatible: classification.ok && classification.classification === "legacy_v1",
    classification: classification.ok ? classification.classification : undefined,
    error: classification.ok ? undefined : classification.error,
    sidecar_path: legacySidecarPath,
  };
}

/**
 * @param {string} clientRoot
 * @param {{ smokeSidecarPath?: string, legacySidecarPath?: string, constraintFlow?: boolean }} [options]
 */
export function runGrammarV2DefaultAudit(clientRoot, options = {}) {
  const smokeSidecarPath = options.smokeSidecarPath ?? SMOKE_SIDECAR_PATH;
  const legacySidecarPath = options.legacySidecarPath ?? LEGACY_SIDECAR_PATH;
  const constraintFlow = options.constraintFlow ?? false;

  const { templatePath, copyableBody } = readClientSidecarTemplate(clientRoot);
  const smokeBody = fs.readFileSync(smokeSidecarPath, "utf8");
  const layerB = runLayerBReport(smokeBody, SMOKE_IMPL_TOKEN);
  const layerC = runLayerCReport(smokeBody, SMOKE_IMPL_TOKEN, { constraintFlow });
  const legacyV1 = runLegacyCompatibilityReport(legacySidecarPath);

  const audit = auditNewClientGrammar({
    generatedSidecarBody: copyableBody,
    layerB: { ok: layerB.ok },
    layerC: { ok: layerC.ok, gate_mode_applied: layerC.gate_mode_applied },
    constraintFlow,
    legacyV1: { compatible: legacyV1.compatible, classification: legacyV1.classification },
  });

  return {
    schema_version: "grammar-v2-default-audit.v1",
    client_root: clientRoot,
    template_path: templatePath,
    smoke_sidecar_path: smokeSidecarPath,
    dimensions: {
      grammar_v2_header: evaluateGrammarV2HeaderDimension(copyableBody),
      layer_b: layerB,
      layer_c: layerC,
      constraint_flow: constraintFlow,
      legacy_v1_compatibility: legacyV1,
    },
    audit,
    ok: audit.ok,
  };
}
