/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * Deterministic Stage 7 graders — read-only; no LLM-as-judge.
 */

import fs from "node:fs";
import path from "node:path";

import { validateEasarEngagementFacet } from "./engagement-facet.js";
import type { ValidationCaseV1, ValidationCasesDocumentV1 } from "./validation-cases-v1.js";
import {
  buildValidationResultsV1,
  type ValidationResultsV1,
  type ValidationTaskResultV1,
} from "./validation-results-v1.js";

function resolveProjectPath(projectRoot: string, relative: string): string {
  const normalized = relative.replace(/\\/g, "/");
  return path.isAbsolute(normalized) ? normalized : path.join(projectRoot, normalized);
}

function readJsonFile(absolute: string): unknown {
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
}

function getByDotPath(obj: unknown, dotPath: string): unknown {
  let current: unknown = obj;
  for (const segment of dotPath.split(".")) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function loadMcpToolNames(projectRoot: string): string[] {
  const indexPath = resolveProjectPath(projectRoot, "mcp-server/src/tools/index.ts");
  const text = fs.readFileSync(indexPath, "utf8");
  const names: string[] = [];
  const re = /name:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    names.push(match[1]);
  }
  return names.sort((a, b) => a.localeCompare(b));
}

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY]
export function gradeValidationCase(
  projectRoot: string,
  testCase: ValidationCaseV1,
  context?: { mcp_tool_names?: string[] },
): ValidationTaskResultV1 {
  const base: ValidationTaskResultV1 = {
    task_id: testCase.task_id,
    grader: testCase.grader,
    pass: false,
  };
  try {
    switch (testCase.grader) {
      case "receipt_field": {
        const receiptPath = String(testCase.inputs.receipt_path ?? "");
        const fieldPath = String(testCase.inputs.field_path ?? "");
        const absolute = resolveProjectPath(projectRoot, receiptPath);
        const json = readJsonFile(absolute);
        const actual = getByDotPath(json, fieldPath);
        const expected = testCase.expected.value;
        const pass = actual === expected;
        return {
          ...base,
          pass,
          detail: pass ? undefined : `expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`,
          evidence_ref: receiptPath,
        };
      }
      case "test_file_assertion": {
        const filePath = String(testCase.inputs.file_path ?? "");
        const absolute = resolveProjectPath(projectRoot, filePath);
        if (testCase.expected.exists === true) {
          const pass = fs.existsSync(absolute);
          return { ...base, pass, evidence_ref: filePath };
        }
        const contains = String(testCase.expected.contains ?? "");
        const text = fs.readFileSync(absolute, "utf8");
        const pass = text.includes(contains);
        return {
          ...base,
          pass,
          detail: pass ? undefined : `missing substring ${contains}`,
          evidence_ref: filePath,
        };
      }
      case "mcp_tool_registry": {
        const toolName = String(testCase.expected.tool_name ?? "");
        const names = context?.mcp_tool_names ?? loadMcpToolNames(projectRoot);
        const pass = names.includes(toolName);
        return {
          ...base,
          pass,
          detail: pass ? undefined : `tool ${toolName} not in registry`,
          evidence_ref: "mcp-server/src/tools/index.ts",
        };
      }
      case "symbol_ref": {
        const filePath = String(testCase.inputs.file_path ?? "");
        const symbol = String(testCase.expected.symbol ?? "");
        const absolute = resolveProjectPath(projectRoot, filePath);
        const text = fs.readFileSync(absolute, "utf8");
        const pass = text.includes(symbol);
        return {
          ...base,
          pass,
          detail: pass ? undefined : `symbol ${symbol} not found`,
          evidence_ref: filePath,
        };
      }
      case "source_graph_trace": {
        const indexPath = String(testCase.inputs.index_path ?? "");
        const fieldPath = String(testCase.inputs.field_path ?? "");
        const absolute = resolveProjectPath(projectRoot, indexPath);
        const json = readJsonFile(absolute);
        const actual = getByDotPath(json, fieldPath);
        const expected = testCase.expected.value;
        const pass = actual === expected;
        return {
          ...base,
          pass,
          detail: pass ? undefined : `expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`,
          evidence_ref: indexPath,
        };
      }
      case "engagement_facet": {
        const tracker = testCase.inputs.tracker;
        const result = validateEasarEngagementFacet(tracker);
        const expectOk = testCase.expected.ok === true;
        const expectDiagnostic = String(testCase.expected.diagnostic ?? "");
        if (expectOk) {
          return { ...base, pass: result.ok, detail: result.diagnostics.join(",") };
        }
        const pass = !result.ok && result.diagnostics.includes(expectDiagnostic);
        return {
          ...base,
          pass,
          detail: result.diagnostics.join(","),
          evidence_ref: "mcp-server/src/easar-receipts/engagement-facet.ts",
        };
      }
      default:
        return { ...base, detail: "unknown_grader" };
    }
  } catch (error) {
    return {
      ...base,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export type RunEasarValidationSuiteInput = {
  document: ValidationCasesDocumentV1;
  project_root: string;
  cases_path: string;
  git_rev: string;
  evidence_refs?: string[];
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — RUN_EASAR_VALIDATION_SUITE_V1
export function runEasarValidationSuiteV1(input: RunEasarValidationSuiteInput): ValidationResultsV1 {
  const mcp_tool_names = loadMcpToolNames(input.project_root);
  const tasks = input.document.cases.map((testCase) =>
    gradeValidationCase(input.project_root, testCase, { mcp_tool_names }),
  );
  return buildValidationResultsV1({
    request_token: input.document.request_token,
    git_rev: input.git_rev,
    cases_path: input.cases_path,
    evidence_refs: input.evidence_refs ?? [],
    tasks,
  });
}
