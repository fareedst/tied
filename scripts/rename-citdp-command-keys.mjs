#!/usr/bin/env node
/**
 * [REQ-CITDP_ORDERED_LIST_KEYS] Migrate deprecated CITDP command list keys to *_seq names.
 * Usage: node scripts/rename-citdp-command-keys.mjs [--check] [root ...]
 * Requires: npm run build --prefix mcp-server
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { transformCitdpOrderedListKeys } from "../mcp-server/dist/citdp-ordered-keys.js";
import { writeCanonicalValueAtomic } from "../mcp-server/dist/yaml-canonicalizer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function isRecord(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function transformDocument(data, filename) {
  if (filename === "citdp-record-template.yaml") {
    return transformCitdpOrderedListKeys(data);
  }
  if (!isRecord(data)) return data;
  const keys = Object.keys(data);
  if (keys.length === 1 && keys[0].startsWith("CITDP-")) {
    return { [keys[0]]: transformCitdpOrderedListKeys(data[keys[0]]) };
  }
  if ("evidence" in data || "test_strategy" in data) {
    return transformCitdpOrderedListKeys(data);
  }
  return data;
}

function shouldProcess(filePath) {
  const base = path.basename(filePath);
  if (base === "citdp-record-template.yaml") return true;
  if (base === "citdp.yaml") return true;
  if (base === "citdp-inline.yaml") return true;
  if (base === "citdp-record-body.yaml") return true;
  if (base.startsWith("CITDP-") && base.endsWith(".yaml")) return true;
  return false;
}

function collectFiles(roots) {
  const files = [];
  for (const root of roots) {
    const abs = path.resolve(root);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      if (shouldProcess(abs)) files.push(abs);
      continue;
    }
    const stack = [abs];
    while (stack.length) {
      const dir = stack.pop();
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) stack.push(p);
        else if (shouldProcess(p)) files.push(p);
      }
    }
  }
  return [...new Set(files)].sort();
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const roots = args.filter((a) => a !== "--check");
  const defaultRoots = [
    path.join(repoRoot, "tied-project/citdp"),
    path.join(repoRoot, "tied-project/working"),
    path.join(repoRoot, "working"),
    path.join(repoRoot, "tied-bundle/docs/citdp-record-template.yaml"),
  ];
  const targets = collectFiles(roots.length ? roots : defaultRoots);
  let changed = 0;
  for (const filePath of targets) {
    const before = fs.readFileSync(filePath, "utf8");
    let data;
    try {
      data = yaml.load(before);
    } catch (e) {
      console.error("DIAGNOSTIC: skip parse error", filePath, e.message);
      continue;
    }
    const afterData = transformDocument(data, path.basename(filePath));
    if (JSON.stringify(afterData) === JSON.stringify(data)) continue;
    changed += 1;
    console.log(checkOnly ? "would change:" : "changed:", path.relative(repoRoot, filePath));
    if (!checkOnly) {
      const result = writeCanonicalValueAtomic(filePath, afterData);
      if (!result.ok) {
        console.error("DIAGNOSTIC: write failed", filePath, result.error);
        process.exitCode = 1;
      }
    }
  }
  console.log(
    `DEBUG: TRACE: ${changed} file(s) ${checkOnly ? "need migration" : "migrated"} of ${targets.length} scanned`,
  );
  if (checkOnly && changed > 0) process.exit(1);
}

main();
