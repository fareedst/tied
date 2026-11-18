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
let cachedDisposableSlugs: Set<string> | null = null;

const DEFAULT_DISPOSABLE_TEMPLATE_REL = path.join(
  "tied-bundle",
  "templates",
  "wf-trial-minimal-checklist-tracker.yaml",
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveDefaultChecklistPath(): string | undefined {
  let dir = process.cwd();
  for (let i = 0; i < 12; i += 1) {
    for (const rel of [
      path.join("tied-bundle", "docs", "agent-req-implementation-checklist.yaml"),
      path.join("tied", "docs", "agent-req-implementation-checklist.yaml"),
    ]) {
      const candidate = path.join(dir, rel);
      if (existsSync(candidate)) return candidate;
    }
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

function envPath(key: string): string | undefined {
  const raw = process.env[key];
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  return raw.trim();
}

function emitDisposableTemplateDiagnostic(tier: string, resolved: string): void {
  process.stderr.write(
    `DIAGNOSTIC: disposable_template_resolution=${tier} path=${resolved}\n`,
  );
}

// [IMPL-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [ARCH-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] — How: resolve slim template client bundle → store → cwd.
function resolveDefaultDisposableChecklistTemplatePath(): string | undefined {
  const explicit = envPath("TIED_DISPOSABLE_CHECKLIST_TEMPLATE");
  if (explicit && existsSync(explicit)) {
    emitDisposableTemplateDiagnostic("explicit", explicit);
    return explicit;
  }

  const clientBundle = envPath("TIED_CLIENT_BUNDLE_PATH");
  if (clientBundle) {
    const candidate = path.join(clientBundle, DEFAULT_DISPOSABLE_TEMPLATE_REL);
    if (existsSync(candidate)) {
      emitDisposableTemplateDiagnostic("client_bundle", candidate);
      return candidate;
    }
  }

  const storeRoot = envPath("TIED_STORE_ROOT");
  if (storeRoot) {
    const candidate = path.join(storeRoot, DEFAULT_DISPOSABLE_TEMPLATE_REL);
    if (existsSync(candidate)) {
      emitDisposableTemplateDiagnostic("store_bundle", candidate);
      return candidate;
    }
  }

  let dir = process.cwd();
  for (let i = 0; i < 12; i += 1) {
    const candidate = path.join(dir, DEFAULT_DISPOSABLE_TEMPLATE_REL);
    if (existsSync(candidate)) {
      emitDisposableTemplateDiagnostic("cwd_walk", candidate);
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

function slugsFromChecklistStepsDoc(doc: Record<string, unknown>): Set<string> {
  const slugs = new Set<string>();
  if (Array.isArray(doc.steps)) {
    for (const step of doc.steps) {
      if (isRecord(step) && typeof step.slug === "string" && step.slug.trim()) {
        slugs.add(step.slug.trim());
      }
    }
  }
  return slugs;
}

// [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [ARCH-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] — How: parse slim WF trial template step slugs for disposable registry union.
export function loadWfTrialDisposableChecklistSlugs(templatePath?: string): Set<string> {
  if (cachedDisposableSlugs && !templatePath) return cachedDisposableSlugs;
  const resolved = templatePath ?? resolveDefaultDisposableChecklistTemplatePath();
  if (!resolved) {
    return new Set<string>();
  }
  const doc = yaml.load(readFileSync(resolved, "utf8")) as Record<string, unknown>;
  const slugs = slugsFromChecklistStepsDoc(doc);
  if (!templatePath) cachedDisposableSlugs = slugs;
  return slugs;
}

export function resetWfTrialDisposableChecklistSlugCache(): void {
  cachedDisposableSlugs = null;
}

// [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] — How: union methodology + disposable slugs when tracker carries workflow_trial_disposable.
export function resolveCanonicalSlugRegistryForTracker(tracker: unknown): Set<string> {
  const base = loadCanonicalChecklistSlugs();
  if (!isRecord(tracker) || tracker.workflow_trial_disposable !== true) {
    return base;
  }
  const disposable = loadWfTrialDisposableChecklistSlugs();
  if (disposable.size === 0) return base;
  return new Set([...base, ...disposable]);
}
