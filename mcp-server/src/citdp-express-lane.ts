/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * How: W2c validate CITDP size, gate_profile, and express_lane charter rules.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export const CITDP_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type CitdpSize = (typeof CITDP_SIZES)[number];

export type CitdpDaeFieldValidation = {
  ok: boolean;
  diagnostics: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readDaeConfig(projectRoot: string): Record<string, unknown> | undefined {
  const configPath = path.join(projectRoot, ".tied-yaml.yaml");
  if (!fs.existsSync(configPath)) {
    return undefined;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    if (!isRecord(raw) || !isRecord(raw.dae)) {
      return undefined;
    }
    return raw.dae;
  } catch {
    return undefined;
  }
}

function expressLaneCharterAllows(
  citdp: Record<string, unknown>,
  projectRoot?: string,
): boolean {
  if (citdp.express_lane_charter === true) {
    return true;
  }
  const identity = isRecord(citdp.record_identity) ? citdp.record_identity : undefined;
  if (identity?.express_lane_charter === true) {
    return true;
  }
  if (projectRoot) {
    const dae = readDaeConfig(projectRoot);
    if (dae?.express_lane_charter === true) {
      return true;
    }
  }
  return false;
}

export function validateCitdpDaeSizingFields(
  citdp: Record<string, unknown>,
  options?: { project_root?: string },
): CitdpDaeFieldValidation {
  const diagnostics: string[] = [];
  const sizeRaw = citdp.size ?? (isRecord(citdp.record_identity) ? citdp.record_identity.size : undefined);
  const size = typeof sizeRaw === "string" ? sizeRaw.trim().toUpperCase() : undefined;

  if (sizeRaw !== undefined && sizeRaw !== null && sizeRaw !== "") {
    if (!size || !CITDP_SIZES.includes(size as CitdpSize)) {
      diagnostics.push("invalid_citdp_size");
    }
  }

  const gateProfile = citdp.gate_profile;
  if (gateProfile !== undefined && gateProfile !== null) {
    if (!isRecord(gateProfile)) {
      diagnostics.push("malformed_gate_profile");
    } else {
      const front = gateProfile.front;
      const verify = gateProfile.verify;
      if (front !== undefined && front !== "auto" && front !== "bundled") {
        diagnostics.push("invalid_gate_profile_front");
      }
      if (
        verify !== undefined
        && verify !== "light"
        && verify !== "standard"
        && verify !== "heavy"
        && verify !== "auto"
      ) {
        diagnostics.push("invalid_gate_profile_verify");
      }
    }
  }

  const expressLane = citdp.express_lane === true;
  if (expressLane) {
    if (size !== "XS") {
      diagnostics.push("express_lane_requires_size_xs");
    }
    if (!expressLaneCharterAllows(citdp, options?.project_root)) {
      diagnostics.push("express_lane_charter_not_allowed");
    }
  }

  return { ok: diagnostics.length === 0, diagnostics: [...new Set(diagnostics)] };
}
