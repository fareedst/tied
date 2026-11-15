/**
 * [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] contract — suite schema
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, "harness-eval-suite.schema.json"), "utf8"),
);
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const suitePath = path.join(
  __dirname,
  "../../../docs/agent-harness-evaluation/harness-eval/suites/engineering-suite-v1.yaml",
);

test("engineering-suite-v1.yaml matches harness-eval-suite schema", () => {
  const doc = yaml.load(fs.readFileSync(suitePath, "utf8"));
  const ok = validate(doc);
  assert.ok(ok, JSON.stringify(validate.errors, null, 2));
});
