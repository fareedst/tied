/**
 * [REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE] [IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE]
 * [ARCH-TIED_PATH_DECLARED_COMPOSITION_MANDATE]
 * Path-declared composition mandate — read-only validator (receipt composition_tests via suffixes).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import fg from "fast-glob";
import yaml from "js-yaml";

import type { BindingInventoryRow } from "../analysis/binding-inventory.js";
import { classifyTestFile, classifyTestFileFine } from "./proof-test-classify.js";
import { countTestCasesInSource } from "./test-case-count.js";

export type PathDeclaredCompositionEnforcement = "advisory" | "blocking";

export type PathDeclaredCompositionValidateInput = {
  repo_root: string;
  binding_inventory_path?: string;
  binding_inventory_rows?: BindingInventoryRow[];
  composition_integration_required?: boolean;
  composition_integration_na?: boolean;
  exempt_reason?: string;
  enforcement?: PathDeclaredCompositionEnforcement;
  tracker_path?: string;
};

export type CompositionFileReceipt = {
  path: string;
  cases: number;
  proof_subtype: string;
};

export type PathDeclaredCompositionValidateResult = {
  schema_version: "path-declared-composition-validate.v1";
  ok: boolean;
  mandate_applies: boolean;
  satisfied: boolean;
  exempt: boolean;
  enforcement: PathDeclaredCompositionEnforcement;
  composition_tests: number;
  composition_files: CompositionFileReceipt[];
  diagnostics: string[];
  proof_boundary: string;
};

const PROOF_BOUNDARY =
  "Read-only path scan for composition_tests; does not certify binding runtime behavior or WF subcheck inference.";

async function loadBindingRows(input: PathDeclaredCompositionValidateInput): Promise<BindingInventoryRow[]> {
  if (input.binding_inventory_rows?.length) {
    return input.binding_inventory_rows;
  }
  if (!input.binding_inventory_path) return [];
  const abs = path.isAbsolute(input.binding_inventory_path)
    ? input.binding_inventory_path
    : path.join(input.repo_root, input.binding_inventory_path);
  const text = await readFile(abs, "utf8");
  const doc = yaml.load(text) as Record<string, unknown>;
  const raw = doc.bindings ?? doc.rows ?? doc.binding_inventory;
  if (!Array.isArray(raw)) return [];
  return raw as BindingInventoryRow[];
}

function compositionTestableBindings(rows: BindingInventoryRow[]): number {
  return rows.filter((row) => !row.e2e_only).length;
}

async function trackerRequiresComposition(repoRoot: string, trackerPath?: string): Promise<boolean> {
  if (!trackerPath) return false;
  const abs = path.isAbsolute(trackerPath) ? trackerPath : path.join(repoRoot, trackerPath);
  const text = await readFile(abs, "utf8");
  const doc = yaml.load(text) as Record<string, unknown>;
  const completed = doc.execution_evidence as Record<string, unknown> | undefined;
  const slugs = completed?.completed;
  if (Array.isArray(slugs) && slugs.includes("composition-integration")) {
    return true;
  }
  const steps = doc.steps as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(steps)) {
    const hit = steps.find((s) => s.slug === "composition-integration");
    if (hit && hit.disposition !== "not_applicable" && hit.disposition !== "waived") return true;
  }
  const metadata = doc.metadata as Record<string, unknown> | undefined;
  if (metadata?.composition_integration_in_scope === true) return true;
  return false;
}

async function scanCompositionFiles(repoRoot: string): Promise<{
  composition_tests: number;
  composition_files: CompositionFileReceipt[];
}> {
  const testFiles = await fg(["src/**/*.test.ts", "src/**/*.test.mjs"].map((p) => p.replace(/\\/g, "/")), {
    cwd: repoRoot,
    onlyFiles: true,
  });
  let composition_tests = 0;
  const composition_files: CompositionFileReceipt[] = [];
  for (const rel of testFiles) {
    const text = await readFile(path.join(repoRoot, rel), "utf8");
    const cases = countTestCasesInSource(text);
    if (classifyTestFile(rel) !== "composition") continue;
    composition_tests += cases;
    const fine = classifyTestFileFine(rel);
    composition_files.push({
      path: rel.replace(/\\/g, "/"),
      cases,
      proof_subtype: fine.subtype,
    });
  }
  return { composition_tests, composition_files };
}

/**
 * [IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE] [ARCH-TIED_PATH_DECLARED_COMPOSITION_MANDATE]
 * PRE: repo_root exists. POST: receipt with mandate_applies, satisfied, enforcement-aware ok.
 */
export async function validatePathDeclaredComposition(
  input: PathDeclaredCompositionValidateInput,
): Promise<PathDeclaredCompositionValidateResult> {
  const enforcement: PathDeclaredCompositionEnforcement = input.enforcement ?? "advisory";
  const diagnostics: string[] = [];

  if (input.composition_integration_na && input.exempt_reason?.trim()) {
    return {
      schema_version: "path-declared-composition-validate.v1",
      ok: true,
      mandate_applies: false,
      satisfied: true,
      exempt: true,
      enforcement,
      composition_tests: 0,
      composition_files: [],
      diagnostics: [`exempt:${input.exempt_reason.trim()}`],
      proof_boundary: PROOF_BOUNDARY,
    };
  }

  const bindingRows = await loadBindingRows(input);
  const bindingCount = compositionTestableBindings(bindingRows);
  const trackerHit = await trackerRequiresComposition(input.repo_root, input.tracker_path);
  const mandate_applies =
    input.composition_integration_required === true ||
    bindingCount >= 1 ||
    trackerHit;

  const { composition_tests, composition_files } = await scanCompositionFiles(input.repo_root);
  const satisfied = composition_tests > 0;
  const exempt = !mandate_applies;

  if (mandate_applies && !satisfied) {
    diagnostics.push(
      `mandate_unsatisfied:composition_tests=0 — use path suffixes (*.binding|*.integration|*.contract.test.ts) per proof-test-label taxonomy`,
    );
    if (bindingCount > 0) {
      diagnostics.push(`binding_inventory_rows:${bindingCount}`);
    }
  }

  const blockingFailure = mandate_applies && !satisfied && enforcement === "blocking";
  const ok = !blockingFailure;

  return {
    schema_version: "path-declared-composition-validate.v1",
    ok,
    mandate_applies,
    satisfied,
    exempt,
    enforcement,
    composition_tests,
    composition_files,
    diagnostics,
    proof_boundary: PROOF_BOUNDARY,
  };
}
