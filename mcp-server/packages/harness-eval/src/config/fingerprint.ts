/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] D-CONFIG-FINGERPRINT
 */
import { createHash } from "node:crypto";

export function configurationFingerprint(input: Record<string, unknown>): string {
  const stable = {
    harness: input.harness ?? null,
    harness_version: input.harness_version ?? null,
    requested_model: input.requested_model ?? input.model_slug ?? null,
    effort: input.effort ?? input.model_effort ?? null,
    permission_policy: input.permission_policy ?? null,
    pricing_mode: input.pricing_mode ?? null,
    model_config: input.model_config ?? null,
  };
  const json = JSON.stringify(stable, Object.keys(stable).sort());
  return createHash("sha256").update(json, "utf8").digest("hex");
}
