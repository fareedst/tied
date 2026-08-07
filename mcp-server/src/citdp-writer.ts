/**
 * Write CITDP YAML records under tied/citdp/ ([PROC-CITDP] persistence).
 */

import fs from "node:fs";
import path from "node:path";
import { getBasePath } from "./yaml-loader.js";
import { writeCanonicalValueAtomic, type YamlFormatMetadata } from "./yaml-canonicalizer.js";

const CITDP_FILENAME = /^CITDP-[A-Za-z0-9_.-]+\.yaml$/;

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
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-MODULE_VALIDATION]
    // How: Apply the resolved repository scalar style through the shared canonical writer.
    const filePath = path.join(dir, filename);
    const result = writeCanonicalValueAtomic(filePath, { [topKey]: params.record });
    if (!result.ok) return result;
    return { ok: true, path: filePath, yaml_format: result.yaml_format };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
