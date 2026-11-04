/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS]
 * [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS]
 * Shared CITDP depth/gate resolution for envelope build and backfill (INFER_ENVELOPE_DEPTH_FROM_CITDP).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { resolveWorkingPath } from "../working-root.js";
import type { DepthTier } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function identityValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function relPath(projectRoot: string, absolute: string): string {
  return path.relative(projectRoot, absolute).split(path.sep).join("/");
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function adversarialSection(record: Record<string, unknown>): Record<string, unknown> | undefined {
  if (isRecord(record.adversarial_inquiry)) return record.adversarial_inquiry;
  const risk = isRecord(record.risk_analysis) ? record.risk_analysis : undefined;
  if (risk && isRecord(risk.adversarial_inquiry)) return risk.adversarial_inquiry;
  return undefined;
}

function depthFromRecord(record: Record<string, unknown>): DepthTier | undefined {
  const section = adversarialSection(record);
  const depth = identityValue(section?.depth_tier) ?? identityValue(record.depth_tier);
  if (depth === "minimal" || depth === "integrated" || depth === "strict_candidate") return depth;
  const risk = isRecord(record.risk_analysis) ? record.risk_analysis : undefined;
  const riskDepth = identityValue(risk?.depth_tier);
  if (riskDepth === "minimal" || riskDepth === "integrated" || riskDepth === "strict_candidate") {
    return riskDepth;
  }
  return undefined;
}

function gatePolicyFromRecord(record: Record<string, unknown>): string | undefined {
  const section = adversarialSection(record);
  return identityValue(section?.gate_policy) ?? identityValue(record.gate_policy);
}

function unwrapCitdpDocument(parsed: Record<string, unknown>): Record<string, unknown> {
  const keys = Object.keys(parsed);
  if (keys.length === 1) {
    const inner = parsed[keys[0]!];
    if (isRecord(inner)) return inner;
  }
  return parsed;
}

export async function resolveCitdpContext(
  projectRoot: string,
  requestToken: string,
): Promise<{ record: Record<string, unknown>; citdpPath: string } | null> {
  const workingDir = resolveWorkingPath(projectRoot, requestToken);
  const candidates: string[] = [
    path.join(workingDir, `CITDP-${requestToken}.yaml`),
    path.join(projectRoot, "tied", "citdp", `CITDP-${requestToken}.yaml`),
  ];
  try {
    const entries = await fs.readdir(workingDir);
    for (const name of entries) {
      if (name.startsWith("CITDP-") && name.endsWith(".yaml")) {
        candidates.unshift(path.join(workingDir, name));
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    const contents = await readOptional(candidate);
    if (!contents) continue;
    try {
      const parsed = yaml.load(contents) as unknown;
      if (!isRecord(parsed)) continue;
      return { record: unwrapCitdpDocument(parsed), citdpPath: relPath(projectRoot, candidate) };
    } catch {
      continue;
    }
  }
  return null;
}

export async function resolveDepthTierForBackfill(input: {
  projectRoot: string;
  requestToken: string;
  override?: DepthTier;
}): Promise<{ depthTier: DepthTier; gatePolicy?: string; citdpPath: string | null }> {
  if (input.override !== undefined) {
    return { depthTier: input.override, citdpPath: null };
  }
  const citdp = await resolveCitdpContext(input.projectRoot, input.requestToken);
  if (!citdp) {
    return { depthTier: "integrated", citdpPath: null };
  }
  return {
    depthTier: depthFromRecord(citdp.record) ?? "integrated",
    gatePolicy: gatePolicyFromRecord(citdp.record),
    citdpPath: citdp.citdpPath,
  };
}
