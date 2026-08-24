/**
 * Write CITDP YAML records under tied/citdp/ ([PROC-CITDP] persistence).
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { getBasePath } from "./yaml-loader.js";
import { writeCanonicalValueAtomic, type YamlFormatMetadata } from "./yaml-canonicalizer.js";
import {
  validateCitdpOpenRecord,
  type AdversarialDepth,
} from "./checklist-validator.js";

const CITDP_FILENAME = /^CITDP-[A-Za-z0-9_.-]+\.yaml$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function identityValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function adversarialSection(citdp: Record<string, unknown>): Record<string, unknown> | undefined {
  if (isRecord(citdp.adversarial_inquiry)) return citdp.adversarial_inquiry;
  const risk = isRecord(citdp.risk_analysis) ? citdp.risk_analysis : undefined;
  if (risk && isRecord(risk.adversarial_inquiry)) return risk.adversarial_inquiry;
  return undefined;
}

function adversarialSectionPath(citdp: Record<string, unknown>): "adversarial_inquiry" | "risk_analysis.adversarial_inquiry" | undefined {
  if (isRecord(citdp.adversarial_inquiry)) return "adversarial_inquiry";
  const risk = isRecord(citdp.risk_analysis) ? citdp.risk_analysis : undefined;
  if (risk && isRecord(risk.adversarial_inquiry)) return "risk_analysis.adversarial_inquiry";
  return undefined;
}

function readExistingRecord(filePath: string, topKey: string): Record<string, unknown> | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const data = yaml.load(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
    const inner = data[topKey];
    return isRecord(inner) ? inner : undefined;
  } catch {
    return undefined;
  }
}

function existingDepthTier(record: Record<string, unknown> | undefined): AdversarialDepth | undefined {
  if (!record) return undefined;
  const section = adversarialSection(record);
  return identityValue(section?.depth_tier) as AdversarialDepth | undefined;
}

function existingPriorDepthTier(record: Record<string, unknown> | undefined): AdversarialDepth | undefined {
  if (!record) return undefined;
  const section = adversarialSection(record);
  return identityValue(section?.prior_depth_tier) as AdversarialDepth | undefined;
}

function recordActivation(record: Record<string, unknown>): unknown {
  if (record.activation !== undefined) return record.activation;
  const completionCriteria = record.completion_criteria;
  if (
    typeof completionCriteria === "object"
    && completionCriteria !== null
    && !Array.isArray(completionCriteria)
  ) {
    return (completionCriteria as Record<string, unknown>).activation;
  }
  return undefined;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: preserve prior_depth_tier on overwrite when incoming omits it.
function mergePriorDepthTier(
  incoming: Record<string, unknown>,
  existing: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const preserved = existingPriorDepthTier(existing);
  if (!preserved) return incoming;
  const sectionPath = adversarialSectionPath(incoming);
  if (!sectionPath) return incoming;
  const section = adversarialSection(incoming);
  if (!section || identityValue(section.prior_depth_tier)) return incoming;

  const merged = structuredClone(incoming);
  if (sectionPath === "adversarial_inquiry") {
    merged.adversarial_inquiry = { ...section, prior_depth_tier: preserved };
    return merged;
  }
  const risk = isRecord(merged.risk_analysis) ? { ...merged.risk_analysis } : {};
  risk.adversarial_inquiry = { ...section, prior_depth_tier: preserved };
  merged.risk_analysis = risk;
  return merged;
}

export function writeCitdpRecord(params: {
  filename: string;
  record: Record<string, unknown>;
  top_level_key?: string;
}): { ok: true; path: string; yaml_format: YamlFormatMetadata } | { ok: false; error: string } {
  if (/[/\\]/.test(params.filename)) {
    return { ok: false, error: "filename must be a basename only (no path segments)" };
  }
  const filename = path.basename(params.filename);
  if (!CITDP_FILENAME.test(filename)) {
    return {
      ok: false,
      error: "filename must be a basename matching CITDP-*.yaml (no path segments)",
    };
  }
  const stem = filename.replace(/\.yaml$/i, "");
  const topKey = (params.top_level_key ?? stem).trim();
  if (!topKey || topKey.includes("/") || topKey.includes("..")) {
    return { ok: false, error: "top_level_key must be a single safe YAML map key" };
  }

  const base = getBasePath();
  const dir = path.join(base, "citdp");
  const filePath = path.join(dir, filename);
  const existingRecord = readExistingRecord(filePath, topKey);
  const mergedRecord = mergePriorDepthTier(params.record, existingRecord);

  // [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: open-record validation for persistence; progression gates stay separate.
  if ("risk_analysis" in mergedRecord || "adversarial_inquiry" in mergedRecord) {
    const openRecord = validateCitdpOpenRecord({
      citdp: mergedRecord,
      activation: recordActivation(mergedRecord),
      existingDepthTier: existingDepthTier(existingRecord),
    });
    if (!openRecord.ok) {
      return { ok: false, error: `invalid adversarial CITDP: ${openRecord.diagnostics.join(", ")}` };
    }
  }

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-MODULE_VALIDATION]
    // How: Apply the resolved repository scalar style through the shared canonical writer.
    const result = writeCanonicalValueAtomic(filePath, { [topKey]: mergedRecord });
    if (!result.ok) return result;
    return { ok: true, path: filePath, yaml_format: result.yaml_format };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
