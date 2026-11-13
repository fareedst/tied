/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] VALIDATE_SUITE_INTEGRITY — SC-HMEP-M1-05
 */
import { createHash } from "node:crypto";

export function computeSuiteIntegrityBody(doc: Record<string, unknown>): string {
  const clone = { ...doc };
  delete clone.content_integrity_sha256;
  const keys = Object.keys(clone).sort();
  const stable: Record<string, unknown> = {};
  for (const k of keys) {
    stable[k] = clone[k];
  }
  return JSON.stringify(stable);
}

export function computeSuiteIntegritySha256(doc: Record<string, unknown>): string {
  return createHash("sha256").update(computeSuiteIntegrityBody(doc), "utf8").digest("hex");
}

export function validateSuiteIntegrity(doc: Record<string, unknown>): {
  ok: boolean;
  expected?: string;
  actual?: string;
} {
  const declared = doc.content_integrity_sha256;
  if (typeof declared !== "string" || declared.trim() === "") {
    return { ok: false, actual: String(declared) };
  }
  const computed = computeSuiteIntegritySha256(doc);
  return {
    ok: declared === computed,
    expected: declared,
    actual: computed,
  };
}
