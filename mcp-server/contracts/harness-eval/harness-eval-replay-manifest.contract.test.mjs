/**
 * [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] contract — replay manifest schema
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
  fs.readFileSync(path.join(__dirname, "harness-eval-replay-manifest.schema.json"), "utf8"),
);
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const manifestPath = path.join(
  __dirname,
  "../../../docs/demos/harness-eval/replay/sample-replay-batch-v1.yaml",
);

test("sample-replay-batch-v1.yaml matches harness-eval-replay-manifest schema", () => {
  const doc = yaml.load(fs.readFileSync(manifestPath, "utf8"));
  const ok = validate(doc);
  assert.ok(ok, JSON.stringify(validate.errors, null, 2));
});
