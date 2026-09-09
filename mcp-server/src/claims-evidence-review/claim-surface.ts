import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  CLAIM_SURFACE_SCHEMA,
  MAX_CLAIMS,
  MAX_FIELD_LENGTH,
  type ClaimRecord,
  type ClaimSurface,
} from "./types.js";

export type FreezeClaimSurfaceError =
  | { kind: "PathOutsideBoundary" }
  | { kind: "InvalidSchema"; message: string }
  | { kind: "DuplicateClaimId"; id: string }
  | { kind: "OversizedInput" };

export type FrozenClaimSurface = {
  surface: ClaimSurface;
  contentHash: string;
  frozenPath: string;
};

function isWithinBoundary(resolved: string, boundaryRoot: string): boolean {
  const normalizedBoundary = path.resolve(boundaryRoot);
  const normalizedTarget = path.resolve(resolved);
  const relative = path.relative(normalizedBoundary, normalizedTarget);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function validateClaim(record: ClaimRecord, index: number): string | null {
  if (!record.id?.trim()) return `claim[${index}] missing id`;
  if (record.id.length > 256) return `claim[${index}] id oversized`;
  if (!record.text?.trim()) return `claim[${index}] missing text`;
  if (record.text.length > MAX_FIELD_LENGTH) return `claim[${index}] text oversized`;
  if (!record.source?.trim()) return `claim[${index}] missing source`;
  if (!record.scope?.trim()) return `claim[${index}] missing scope`;
  return null;
}

function normalizeSurface(raw: unknown): ClaimSurface {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("InvalidSchema: expected object");
  }
  const value = raw as Record<string, unknown>;
  if (value.schemaVersion !== CLAIM_SURFACE_SCHEMA) {
    throw new Error(`InvalidSchema: expected ${CLAIM_SURFACE_SCHEMA}`);
  }
  const claims = value.claims;
  if (!Array.isArray(claims)) throw new Error("InvalidSchema: claims must be array");
  if (claims.length > MAX_CLAIMS) throw new Error("OversizedInput: too many claims");
  const normalizedClaims = claims.map((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`InvalidSchema: claim[${index}] not object`);
    }
    const row = entry as Record<string, unknown>;
    const claim: ClaimRecord = {
      id: String(row.id ?? ""),
      text: String(row.text ?? ""),
      source: String(row.source ?? ""),
      scope: String(row.scope ?? ""),
    };
    if (row.materialityHint !== undefined) claim.materialityHint = String(row.materialityHint);
    if (row.requiresRuntimeProof === true) claim.requiresRuntimeProof = true;
    const error = validateClaim(claim, index);
    if (error) throw new Error(`InvalidSchema: ${error}`);
    return claim;
  });
  normalizedClaims.sort((left, right) => left.id.localeCompare(right.id));
  const ids = new Set<string>();
  for (const claim of normalizedClaims) {
    if (ids.has(claim.id)) throw new Error(`DuplicateClaimId: ${claim.id}`);
    ids.add(claim.id);
  }
  return {
    schemaVersion: CLAIM_SURFACE_SCHEMA,
    revision: String(value.revision ?? ""),
    sourceRevision: String(value.sourceRevision ?? ""),
    requestToken: String(value.requestToken ?? ""),
    claims: normalizedClaims,
  };
}

// [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
// Accept only caller-selected frozen fixture within declared input boundary.
export function freezeClaimSurface(input: {
  claimSurfacePath: string;
  inputBoundaryRoot: string;
}): { ok: true; frozen: FrozenClaimSurface } | { ok: false; error: FreezeClaimSurfaceError } {
  const resolvedPath = path.resolve(input.claimSurfacePath);
  const boundaryRoot = path.resolve(input.inputBoundaryRoot);
  if (!isWithinBoundary(resolvedPath, boundaryRoot)) {
    return { ok: false, error: { kind: "PathOutsideBoundary" } };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: { kind: "InvalidSchema", message } };
  }
  let surface: ClaimSurface;
  try {
    surface = normalizeSurface(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("DuplicateClaimId")) {
      const id = message.split(": ").slice(1).join(": ") || "unknown";
      return { ok: false, error: { kind: "DuplicateClaimId", id } };
    }
    if (message.includes("OversizedInput")) {
      return { ok: false, error: { kind: "OversizedInput" } };
    }
    return { ok: false, error: { kind: "InvalidSchema", message } };
  }
  const canonical = JSON.stringify(surface);
  const contentHash = crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
  return {
    ok: true,
    frozen: { surface, contentHash, frozenPath: resolvedPath },
  };
}

export function parseClaimSurfaceJson(raw: unknown): ClaimSurface {
  return normalizeSurface(raw);
}
