/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] VALIDATE_REGRESSION_BASELINE — SC-HMEP-M4-01; F-15
 */
import fs from "node:fs";
import yaml from "js-yaml";
import { validateSuiteIntegrity } from "../suite/integrity.js";

export interface BaselineMetricSpec {
  value: number;
  tolerance_pct?: number;
  tolerance_abs?: number;
}

export interface BaselineBind {
  wf_id: string;
  harness: string;
  model_slug?: string;
  trial_id?: string;
}

export interface BaselineExpectation {
  bind: BaselineBind;
  metrics: Record<string, BaselineMetricSpec | null>;
}

export interface RegressionBaselineDoc {
  schema_version: string;
  baseline_id: string;
  suite_ref?: string;
  content_integrity_sha256?: string;
  expectations: BaselineExpectation[];
}

export function parseRegressionBaselineFile(baselinePath: string): RegressionBaselineDoc {
  if (!fs.existsSync(baselinePath)) {
    throw new Error(`DEBUG: missing regression baseline ${baselinePath}`);
  }
  const doc = yaml.load(fs.readFileSync(baselinePath, "utf8")) as RegressionBaselineDoc;
  if (doc.schema_version !== "harness-eval-baseline-v1") {
    throw new Error(`DEBUG: unsupported baseline schema ${doc.schema_version}`);
  }
  if (!doc.baseline_id || !Array.isArray(doc.expectations)) {
    throw new Error("DEBUG: invalid baseline shape");
  }
  for (const exp of doc.expectations) {
    if (!exp.bind?.wf_id || !exp.bind?.harness) {
      throw new Error("DEBUG: baseline expectation missing bind.wf_id or bind.harness");
    }
  }
  return doc;
}

export function validateRegressionBaselineIntegrity(
  baselinePath: string,
): { ok: boolean; expected?: string; actual?: string } {
  const doc = parseRegressionBaselineFile(baselinePath) as unknown as Record<string, unknown>;
  return validateSuiteIntegrity(doc);
}
