/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Canonical checklist slug registry loaded from agent-req-implementation-checklist.yaml.
 */

import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

export const PSEUDOCODE_GATE_SLUG = "gate-pseudocode-validation";

/** Main-step slugs that must complete before unit-test-red (pseudocode chain). */
export const PSEUDOCODE_CHAIN_SLUGS = [
  "catalog-pseudocode-contracts",
  "gate-pseudocode-validation",
  "persist-implementation-records",
  "test-strategy",
] as const;

let cachedSlugs: Set<string> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveDefaultChecklistPath(): string | undefined {
  let dir = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    const candidate = path.join(dir, "tied", "docs", "agent-req-implementation-checklist.yaml");
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-PSEUDOCODE_STATIC_ANALYSIS] — How: load step and sub_procedure slugs from canonical checklist YAML.
export function loadCanonicalChecklistSlugs(checklistPath?: string): Set<string> {
  if (cachedSlugs && !checklistPath) return cachedSlugs;
  const resolved = checklistPath ?? resolveDefaultChecklistPath();
  if (!resolved) {
    return new Set<string>();
  }
  const doc = yaml.load(readFileSync(resolved, "utf8")) as Record<string, unknown>;
  const slugs = new Set<string>();
  if (Array.isArray(doc.steps)) {
    for (const step of doc.steps) {
      if (isRecord(step) && typeof step.slug === "string" && step.slug.trim()) {
        slugs.add(step.slug.trim());
      }
    }
  }
  if (Array.isArray(doc.sub_procedures)) {
    for (const sub of doc.sub_procedures) {
      if (isRecord(sub) && typeof sub.slug === "string" && sub.slug.trim()) {
        slugs.add(sub.slug.trim());
      }
    }
  }
  if (!checklistPath) cachedSlugs = slugs;
  return slugs;
}

export function resetCanonicalChecklistSlugCache(): void {
  cachedSlugs = null;
}
