import fs from "node:fs";
import yaml from "js-yaml";
import type { HarnessEvalSuiteDoc } from "../types.js";

export function loadSuiteFile(path: string): HarnessEvalSuiteDoc {
  const raw = fs.readFileSync(path, "utf8");
  const doc = yaml.load(raw) as HarnessEvalSuiteDoc;
  if (!doc || typeof doc !== "object") {
    throw new Error(`DEBUG: invalid suite YAML ${path}`);
  }
  return doc;
}
