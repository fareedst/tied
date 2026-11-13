/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] RESOLVE_HARNESS_EVAL_STORE_ROOT
 */
import fs from "node:fs";
import path from "node:path";

export function resolveStoreRoot(cliStore?: string): string {
  const fromCli = cliStore?.trim();
  if (fromCli) {
    return path.resolve(fromCli);
  }
  const env = process.env.HARNESS_EVAL_STORE?.trim();
  if (env) {
    return path.resolve(env);
  }
  const storeRoot = process.env.TIED_STORE_ROOT?.trim() || process.cwd();
  return path.join(storeRoot, "tied-bundle", "reports", "harness-eval");
}

export function ensureStoreLayout(storeRoot: string): {
  rawDir: string;
  dbPath: string;
  importsLog: string;
} {
  const rawDir = path.join(storeRoot, "raw");
  fs.mkdirSync(rawDir, { recursive: true });
  const dbPath = path.join(storeRoot, "eval.sqlite");
  const importsLog = path.join(storeRoot, "imports.jsonl");
  return { rawDir, dbPath, importsLog };
}
