/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * Bounded secret redaction for trajectory summaries (operator_local default).
 */

const CANARY_SECRET_PATTERNS: RegExp[] = [
  /\bsk-[a-zA-Z0-9]{8,}\b/u,
  /\bBearer\s+[a-zA-Z0-9._-]{8,}\b/u,
  /\bapi[_-]?key\s*[:=]\s*\S+/iu,
];

export type PrivacyRedactionResult =
  | { ok: true; value: unknown; redacted: boolean }
  | { ok: false; code: "PrivacyRedactionFailure"; detail: string };

function redactString(input: string): { text: string; redacted: boolean } {
  let text = input;
  let redacted = false;
  for (const pattern of CANARY_SECRET_PATTERNS) {
    if (pattern.test(text)) {
      text = text.replace(pattern, "[REDACTED]");
      redacted = true;
    }
  }
  return { text, redacted };
}

export function redactBoundedSecrets(value: unknown): PrivacyRedactionResult {
  if (typeof value === "string") {
    const { text, redacted } = redactString(value);
    return { ok: true, value: text, redacted };
  }
  if (Array.isArray(value)) {
    let anyRedacted = false;
    const next: unknown[] = [];
    for (const item of value) {
      const result = redactBoundedSecrets(item);
      if (!result.ok) return result;
      if (result.redacted) anyRedacted = true;
      next.push(result.value);
    }
    return { ok: true, value: next, redacted: anyRedacted };
  }
  if (value !== null && typeof value === "object") {
    let anyRedacted = false;
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === "prompt_body" || key === "raw_output_body") {
        return {
          ok: false,
          code: "PrivacyRedactionFailure",
          detail: `Forbidden unrestricted field: ${key}`,
        };
      }
      const result = redactBoundedSecrets(nested);
      if (!result.ok) return result;
      if (result.redacted) anyRedacted = true;
      next[key] = result.value;
    }
    return { ok: true, value: next, redacted: anyRedacted };
  }
  return { ok: true, value, redacted: false };
}
