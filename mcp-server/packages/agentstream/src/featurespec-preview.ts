/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-FEATURESPEC] [REQ-GOAGENT-FEATURESPEC-BATCH]
 * --preview-feature-spec-batch-yaml stdout (Go featurespec.Preview parity).
 */
import type { FeatureSpecOptions } from "./featurespec-load-turns.js";
import { messagesFromFeatureSpecYaml } from "./featurespec-load-turns.js";

export function previewFeatureSpecBatch(
  path: string,
  opts?: FeatureSpecOptions,
): string {
  const msgs = messagesFromFeatureSpecYaml(path, opts);
  const n = msgs.length;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    parts.push(`=== prompt ${i + 1}/${n} ===\n`);
    parts.push(msgs[i]!);
    if (i < n - 1) {
      parts.push("\n---\n");
    } else {
      parts.push("\n");
    }
  }
  return parts.join("");
}
