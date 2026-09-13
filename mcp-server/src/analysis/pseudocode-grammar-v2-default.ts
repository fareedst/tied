/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * Summary: New-project grammar v2 default selection for generated sidecar bodies.
 */
import { PROCEDURE_HEADING_PATTERN } from "./pseudocode-shared.js";

export const GRAMMAR_V2_HEADER_LINE = "Grammar-Version: v2";

export type BootstrapMode = "new_client" | (string & {});

export type SelectNewProjectGrammarDefaultError = "TemplateUnavailable" | "BootstrapWriteFailed";

export type SelectNewProjectGrammarDefaultResult =
  | { ok: true; body: string }
  | { ok: false; error: SelectNewProjectGrammarDefaultError };

export type SidecarVersionClassification = "explicit_v2" | "legacy_v1";

export type ClassifySidecarVersionError = "InvalidVersionHeader";

export type ClassifySidecarVersionResult =
  | { ok: true; classification: SidecarVersionClassification }
  | { ok: false; error: ClassifySidecarVersionError };

export type GrammarV2HeaderDimension = "pass" | "fail";

export type GrammarV2AuditLayerBReport = {
  ok: boolean;
};

export type GrammarV2AuditLayerCReport = {
  ok: boolean;
  gate_mode_applied: boolean;
};

export type GrammarV2AuditLegacyReport = {
  compatible: boolean;
  classification?: SidecarVersionClassification;
};

export type GrammarV2AuditInput = {
  generatedSidecarBody: string;
  layerB: GrammarV2AuditLayerBReport;
  layerC: GrammarV2AuditLayerCReport;
  constraintFlow: boolean;
  legacyV1: GrammarV2AuditLegacyReport;
};

export type GrammarV2AuditError =
  | "GeneratedHeaderMissing"
  | "LayerBFailed"
  | "LayerCFailed"
  | "LegacyCompatibilityFailed";

export type GrammarV2AuditResult =
  | {
      ok: true;
      dimensions: {
        grammar_v2_header: GrammarV2HeaderDimension;
        layer_b: GrammarV2AuditLayerBReport;
        layer_c: GrammarV2AuditLayerCReport;
        constraint_flow: false;
        legacy_v1_compatibility: "pass" | "fail";
      };
    }
  | { ok: false; error: GrammarV2AuditError };

export type GrammarV2BootstrapEnforcementDimension = "pass" | "fail";

export type GrammarV2BootstrapEnforcementInput = {
  generatedSidecarBody: string;
  layerB: GrammarV2AuditLayerBReport;
  layerC: GrammarV2AuditLayerCReport;
  constraintFlowExpectation: boolean;
  legacyV1: GrammarV2AuditLegacyReport;
  gateStage: string;
};

export type GrammarV2BootstrapEnforcementError =
  | GrammarV2AuditError
  | "GateStageNotG4"
  | "HeaderOnlyBootstrapFalsification";

export type GrammarV2BootstrapEnforcementResult =
  | {
      ok: true;
      dimensions: {
        grammar_v2_header: GrammarV2HeaderDimension;
        bootstrap_enforcement: GrammarV2BootstrapEnforcementDimension;
        layer_b: GrammarV2AuditLayerBReport;
        layer_c: GrammarV2AuditLayerCReport;
        constraint_flow_expectation: true;
        legacy_v1_compatibility: "pass" | "fail";
      };
    }
  | { ok: false; error: GrammarV2BootstrapEnforcementError };

const G4_GATE_STAGE = "G4";

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * How: True when gate promotion stage is G4 (Phase 5 bootstrap enforcement applies).
 */
export function isGateStageG4OrLater(gateStage: string | null | undefined): boolean {
  if (gateStage == null || gateStage.trim() === "") {
    return false;
  }
  if (gateStage === G4_GATE_STAGE) {
    return true;
  }
  const match = /^G(\d+)$/.exec(gateStage.trim());
  if (!match) {
    return false;
  }
  return Number.parseInt(match[1], 10) >= 4;
}

const GRAMMAR_V2_HEADER_RE = /^\s*Grammar-Version:\s*v2\s*$/i;
const GRAMMAR_VERSION_HEADER_ANY_RE = /^\s*Grammar-Version:\s*(.+)\s*$/i;

function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("#") || trimmed.startsWith("<!--");
}

function findH1LineIndex(lines: string[]): number {
  for (let i = 0; i < lines.length; i += 1) {
    if (/^#\s+/.test(lines[i]) && !/^##\s+/.test(lines[i])) {
      return i;
    }
  }
  return -1;
}

function findFirstProcedureIndex(lines: string[]): number {
  for (let i = 0; i < lines.length; i += 1) {
    if (PROCEDURE_HEADING_PATTERN.test(lines[i])) {
      return i;
    }
  }
  return lines.length;
}

function hasGrammarV2HeaderInPreamble(lines: string[], preambleEnd: number): boolean {
  for (let i = 0; i < preambleEnd; i += 1) {
    if (GRAMMAR_V2_HEADER_RE.test(lines[i])) {
      return true;
    }
  }
  return false;
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Return the first non-comment preamble line after the H1 (or null when absent).
 */
export function firstNonCommentPreambleLine(body: string): string | null {
  const lines = body.split(/\r?\n/);
  const h1Idx = findH1LineIndex(lines);
  const start = h1Idx >= 0 ? h1Idx + 1 : 0;
  const preambleEnd = findFirstProcedureIndex(lines);

  for (let i = start; i < preambleEnd; i += 1) {
    const line = lines[i];
    if (!line.trim() || isCommentLine(line)) {
      continue;
    }
    return line.trim();
  }
  return null;
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Require the explicit v2 header only on newly generated sidecars; preserve legacy bodies unchanged.
 */
export function selectNewProjectGrammarDefault(
  templateBody: string | null | undefined,
  bootstrapMode: BootstrapMode,
): SelectNewProjectGrammarDefaultResult {
  if (templateBody == null || templateBody.trim() === "") {
    return { ok: false, error: "TemplateUnavailable" };
  }

  if (bootstrapMode !== "new_client") {
    return { ok: true, body: templateBody };
  }

  const lines = templateBody.split(/\r?\n/);
  const h1Idx = findH1LineIndex(lines);
  const procIdx = findFirstProcedureIndex(lines);

  if (hasGrammarV2HeaderInPreamble(lines, procIdx)) {
    return { ok: true, body: templateBody };
  }

  let insertAt = h1Idx >= 0 ? h1Idx + 1 : 0;
  while (insertAt < procIdx && lines[insertAt].trim() === "") {
    insertAt += 1;
  }

  const nextLines = [...lines];
  nextLines.splice(insertAt, 0, GRAMMAR_V2_HEADER_LINE, "");
  return { ok: true, body: nextLines.join("\n") };
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Classify the header boundary without rewriting the sidecar or enabling constraint analysis.
 */
export function classifySidecarVersion(sidecarBody: string): ClassifySidecarVersionResult {
  const lines = sidecarBody.split(/\r?\n/);
  const preambleEnd = findFirstProcedureIndex(lines);

  for (let i = 0; i < preambleEnd; i += 1) {
    const line = lines[i];
    if (GRAMMAR_V2_HEADER_RE.test(line)) {
      return { ok: true, classification: "explicit_v2" };
    }
    const unsupported = line.match(GRAMMAR_VERSION_HEADER_ANY_RE);
    if (unsupported) {
      return { ok: false, error: "InvalidVersionHeader" };
    }
  }

  return { ok: true, classification: "legacy_v1" };
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Header dimension passes only when the generated sidecar has the exact v2 header line.
 */
export function evaluateGrammarV2HeaderDimension(sidecarBody: string): GrammarV2HeaderDimension {
  return firstNonCommentPreambleLine(sidecarBody) === GRAMMAR_V2_HEADER_LINE ? "pass" : "fail";
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Emit independent audit dimensions without conflating header presence with Layer B, Layer C, or runtime proof.
 */
export function auditNewClientGrammar(input: GrammarV2AuditInput): GrammarV2AuditResult {
  const grammarHeader = evaluateGrammarV2HeaderDimension(input.generatedSidecarBody);
  if (grammarHeader !== "pass") {
    return { ok: false, error: "GeneratedHeaderMissing" };
  }
  if (!input.layerB.ok) {
    return { ok: false, error: "LayerBFailed" };
  }
  if (!input.layerC.ok || !input.layerC.gate_mode_applied) {
    return { ok: false, error: "LayerCFailed" };
  }
  if (input.constraintFlow) {
    return { ok: false, error: "LayerCFailed" };
  }
  if (!input.legacyV1.compatible) {
    return { ok: false, error: "LegacyCompatibilityFailed" };
  }

  return {
    ok: true,
    dimensions: {
      grammar_v2_header: grammarHeader,
      layer_b: input.layerB,
      layer_c: input.layerC,
      constraint_flow: false,
      legacy_v1_compatibility: input.legacyV1.compatible ? "pass" : "fail",
    },
  };
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * How: G4+ bootstrap audit — header pass alone cannot satisfy bootstrap_enforcement; Layer C must run with constraint_flow expectation.
 */
export function auditConstraintEnforcedBootstrap(
  input: GrammarV2BootstrapEnforcementInput,
): GrammarV2BootstrapEnforcementResult {
  if (!isGateStageG4OrLater(input.gateStage)) {
    return { ok: false, error: "GateStageNotG4" };
  }

  const grammarHeader = evaluateGrammarV2HeaderDimension(input.generatedSidecarBody);
  if (grammarHeader !== "pass") {
    return { ok: false, error: "GeneratedHeaderMissing" };
  }
  if (!input.layerB.ok) {
    return { ok: false, error: "LayerBFailed" };
  }
  if (!input.constraintFlowExpectation) {
    return { ok: false, error: "HeaderOnlyBootstrapFalsification" };
  }
  if (!input.layerC.ok || !input.layerC.gate_mode_applied) {
    return { ok: false, error: "LayerCFailed" };
  }
  if (!input.legacyV1.compatible) {
    return { ok: false, error: "LegacyCompatibilityFailed" };
  }

  return {
    ok: true,
    dimensions: {
      grammar_v2_header: grammarHeader,
      bootstrap_enforcement: "pass",
      layer_b: input.layerB,
      layer_c: input.layerC,
      constraint_flow_expectation: true,
      legacy_v1_compatibility: input.legacyV1.compatible ? "pass" : "fail",
    },
  };
}

/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Extract the copyable sidecar body from the canonical template wrapper.
 */
export function extractCopyableSidecarTemplate(templateFileBody: string): string {
  const parts = templateFileBody.split("\n---\n");
  if (parts.length <= 1) {
    return templateFileBody.trimStart();
  }
  return parts.slice(1).join("\n---\n").trimStart();
}
