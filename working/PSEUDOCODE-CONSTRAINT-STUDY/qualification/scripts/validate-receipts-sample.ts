#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Sample AJV validation for constraint-migration-receipt.v1.
 */
import { spawnSync } from "node:child_process";
import { REPO_ROOT } from "./lib/constants.ts";

const SCHEMA = "working/fleet-constraint-v2/constraint-migration-receipt.v1.schema.json";

export type ReceiptValidationResult = {
  ok: boolean;
  validated: string[];
  failures: Array<{ path: string; output: string }>;
};

export async function validateReceiptSample(
  receiptPaths: string[],
): Promise<ReceiptValidationResult> {
  const exemplarFirst = [
    ...receiptPaths.filter((p) => p.includes("exemplar-")),
    ...receiptPaths.filter((p) => !p.includes("exemplar-")),
  ];
  const sample = exemplarFirst.slice(0, 5);
  const failures: ReceiptValidationResult["failures"] = [];
  const validated: string[] = [];

  for (const receiptPath of sample) {
    const rel = receiptPath.startsWith(REPO_ROOT)
      ? receiptPath.slice(REPO_ROOT.length + 1)
      : receiptPath;
    const result = spawnSync(
      "npx",
      [
        "--yes",
        "ajv-cli",
        "validate",
        "-s",
        SCHEMA,
        "-d",
        rel,
        "--spec=draft2020",
        "--strict=false",
      ],
      { cwd: REPO_ROOT, encoding: "utf8" },
    );
    const output = `${result.stdout}${result.stderr}`.trim();
    if (result.status === 0 && output.includes("valid")) {
      validated.push(rel);
    } else {
      failures.push({ path: rel, output });
    }
  }

  return { ok: failures.length === 0 && validated.length > 0, validated, failures };
}

async function main(): Promise<void> {
  const paths = process.argv.slice(2);
  if (paths.length === 0) {
    console.error("Usage: validate-receipts-sample.ts <receipt.json> [...]");
    process.exit(1);
  }
  const result = await validateReceiptSample(paths);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

const invokedDirectly = process.argv[1]?.endsWith("validate-receipts-sample.ts");
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
