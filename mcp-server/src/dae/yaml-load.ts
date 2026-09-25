import fs from "node:fs";
import yaml from "js-yaml";

/** [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: shared YAML load helpers for gate/next composition. */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function loadYamlFile(absolutePath: string): unknown {
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`missing_file:${absolutePath}`);
  }
  return yaml.load(fs.readFileSync(absolutePath, "utf8"));
}

export function loadCitdpBodyFromFile(absolutePath: string): Record<string, unknown> {
  const raw = loadYamlFile(absolutePath);
  if (!isRecord(raw)) {
    throw new Error(`invalid_citdp:${absolutePath}`);
  }
  const keys = Object.keys(raw);
  if (keys.length === 1 && keys[0].startsWith("CITDP-")) {
    const inner = raw[keys[0]];
    if (!isRecord(inner)) {
      throw new Error(`invalid_citdp:${absolutePath}`);
    }
    return inner;
  }
  return raw;
}

export function loadTrackerFromFile(absolutePath: string): Record<string, unknown> {
  const raw = loadYamlFile(absolutePath);
  if (!isRecord(raw)) {
    throw new Error(`invalid_tracker:${absolutePath}`);
  }
  return raw;
}
