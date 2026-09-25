/**
 * [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER]
 * How: W4c parse optional gauntlet block and materialize probe run contract (default off).
 */

import { readCharterPolicy, readGauntletBlock } from "./charter-policy.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type GauntletProbe = {
  id: string;
  description: string;
  verified_by?: string;
};

export type GauntletRunPlan = {
  enabled: boolean;
  probes: GauntletProbe[];
  diagnostics: string[];
};

export function parseGauntletBlock(citdp: unknown): GauntletRunPlan {
  const policy = readCharterPolicy(citdp);
  const block = readGauntletBlock(citdp);
  const diagnostics: string[] = [];

  if (!policy.verificationCharter || !block) {
    return { enabled: false, probes: [], diagnostics };
  }

  const rawProbes = block.probes;
  if (!Array.isArray(rawProbes)) {
    diagnostics.push("gauntlet_missing_probes");
    return { enabled: false, probes: [], diagnostics };
  }

  const probes: GauntletProbe[] = [];
  for (const item of rawProbes) {
    if (!isRecord(item)) {
      diagnostics.push("gauntlet_invalid_probe");
      continue;
    }
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const description = typeof item.description === "string" ? item.description.trim() : "";
    if (!id || !description) {
      diagnostics.push("gauntlet_invalid_probe");
      continue;
    }
    probes.push({
      id,
      description,
      verified_by: typeof item.verified_by === "string" ? item.verified_by : undefined,
    });
  }

  if (probes.length === 0) {
    diagnostics.push("gauntlet_empty_probes");
    return { enabled: false, probes: [], diagnostics };
  }

  return { enabled: true, probes, diagnostics };
}
