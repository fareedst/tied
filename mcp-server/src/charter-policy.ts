/**
 * [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER]
 * How: Read optional DAE verification charter fields from CITDP record_identity (default off).
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordIdentity(citdp: unknown): Record<string, unknown> | undefined {
  if (!isRecord(citdp)) return undefined;
  return isRecord(citdp.record_identity) ? citdp.record_identity : undefined;
}

function identityString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export type CharterPolicy = {
  verificationCharter: boolean;
  mutationCache: boolean;
  mutationCacheThreshold: number;
  disjointVerifier: "off" | "required";
};

export function readCharterPolicy(citdp: unknown): CharterPolicy {
  const identity = recordIdentity(citdp);
  const verificationCharter = identity?.verification_charter === true;
  const mutationCache = verificationCharter && identity?.mutation_cache === true;
  const rawThreshold = identity?.mutation_cache_threshold;
  const mutationCacheThreshold =
    typeof rawThreshold === "number" && Number.isFinite(rawThreshold) ? rawThreshold : 0.75;
  const disjointRaw = identityString(identity?.disjoint_verifier);
  const disjointVerifier = disjointRaw === "required" ? "required" : "off";
  return {
    verificationCharter,
    mutationCache,
    mutationCacheThreshold,
    disjointVerifier,
  };
}

export function readGauntletBlock(citdp: unknown): Record<string, unknown> | undefined {
  if (!isRecord(citdp)) return undefined;
  if (isRecord(citdp.gauntlet)) return citdp.gauntlet;
  const identity = recordIdentity(citdp);
  if (identity && isRecord(identity.gauntlet)) return identity.gauntlet;
  return undefined;
}
