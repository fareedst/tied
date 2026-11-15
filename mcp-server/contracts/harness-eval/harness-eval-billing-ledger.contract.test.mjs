/**
 * [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] contract — billing ledger schema SC-HMEP-M3-01
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
  fs.readFileSync(path.join(__dirname, "harness-eval-billing-ledger.schema.json"), "utf8"),
);
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const ledgerPath = path.join(
  __dirname,
  "../../../docs/agent-harness-evaluation/harness-eval/billing/sample-ledger-v1.yaml",
);

test("sample-ledger-v1.yaml matches harness-eval-billing-ledger schema SC-HMEP-M3-01", () => {
  const doc = yaml.load(fs.readFileSync(ledgerPath, "utf8"));
  const ok = validate(doc);
  assert.ok(ok, JSON.stringify(validate.errors, null, 2));
  assert.equal(doc.schema_version, "harness-eval-billing-ledger-v1");
});
