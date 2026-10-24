#!/usr/bin/env node
/**
 * [REQ-CITDP_ORDERED_LIST_KEYS] [REQ-TIED_YAML_CANONICALIZATION]
 * Inventory YAML string lists; --check fails on ordered command batteries using legacy keys.
 * Usage: node scripts/audit-ordered-yaml-lists.mjs [--check] [--out path.jsonl] [root ...]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { isOrderedListKey } from "../mcp-server/dist/yaml-canonicalizer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const LEGACY_ORDERED_COMMAND_KEYS = new Set([
  "commands",
  "verification_commands",
  "integration_commands",
  "regression_commands",
]);

const SET_LIKE_KEYS = new Set([
  "completed",
  "cross_references",
  "depends_on",
  "dispositions",
  "eligibility_triggers_matched",
  "phases",
  "proof_boundaries",
  "tied_tokens_affected",
  "tied_tokens_new",
  "non_goals",
  "success_criteria",
  "abuse_cases",
  "clear_slugs",
  "deferred",
  "modules_or_boundaries",
]);

const ORDERED_COMMAND_PARENT_SUFFIXES = [
  "evidence",
  "adoption_evidence",
  "test_strategy",
  "execution_evidence.operator_evidence",
  "execution_evidence.close_out_evidence",
];

function looksLikeShellCommand(item) {
  if (typeof item !== "string") return false;
  return /^(npm |node |bash |cd |npx |ruby |scripts\/|tied_|yaml_|python3 )/.test(item) || item.includes(" --");
}

function isLexicallySorted(items) {
  if (items.length < 2) return true;
  if (!items.every((x) => typeof x === "string")) return false;
  const sorted = [...items].sort((a, b) => a.localeCompare(b));
  return items.every((v, i) => v === sorted[i]);
}

function parentPathString(pathKeys) {
  return pathKeys.join(".");
}

function isOrderedCommandContext(pathKeys, key) {
  const parent = parentPathString(pathKeys);
  if (!LEGACY_ORDERED_COMMAND_KEYS.has(key) && key !== "command_seq" && !key.endsWith("_command_seq")) {
    return false;
  }
  if (ORDERED_COMMAND_PARENT_SUFFIXES.includes(parent)) return true;
  if (parent.endsWith(".test_strategy")) return true;
  if (parent.endsWith(".verification") && parent.startsWith("execution_evidence.close_out_evidence")) return true;
  if (parent.endsWith("_evidence") && parent.includes("operator_evidence")) return true;
  return false;
}

function classifyStringList(pathKeys, key, items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  if (!items.every((x) => typeof x === "string")) return "heterogeneous";

  if (SET_LIKE_KEYS.has(key)) return "unordered_set";

  const shellCount = items.filter(looksLikeShellCommand).length;
  const inCommandContext = isOrderedCommandContext(pathKeys, key);

  if (inCommandContext || (LEGACY_ORDERED_COMMAND_KEYS.has(key) && shellCount > 0)) {
    return "ordered_command";
  }

  if (isOrderedListKey(key)) {
    if (shellCount > 0) return "ordered_command";
    return "ordered_sequence";
  }

  if (LEGACY_ORDERED_COMMAND_KEYS.has(key)) {
    return shellCount > 0 ? "ordered_command" : "uncertain";
  }

  return null;
}

function walk(value, pathKeys, filePath, rows) {
  if (Array.isArray(value)) return;
  if (typeof value !== "object" || value === null) return;
  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...pathKeys, key];
    if (Array.isArray(child)) {
      const semantic_class = classifyStringList(pathKeys, key, child);
      if (semantic_class) {
        rows.push({
          file: filePath,
          path: nextPath.join("."),
          key,
          semantic_class,
          ordered_key: isOrderedListKey(key),
          legacy_ordered_key: LEGACY_ORDERED_COMMAND_KEYS.has(key),
          length: child.length,
          lexically_sorted: isLexicallySorted(child),
          looks_like_shell: child.some(looksLikeShellCommand),
        });
      }
    } else if (typeof child === "object" && child !== null) {
      walk(child, nextPath, filePath, rows);
    }
  }
}

function collectYamlFiles(roots) {
  const files = [];
  for (const root of roots) {
    const abs = path.resolve(root);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isFile() && abs.endsWith(".yaml")) {
      files.push(abs);
      continue;
    }
    if (!stat.isDirectory()) continue;
    const stack = [abs];
    while (stack.length) {
      const dir = stack.pop();
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) stack.push(p);
        else if (ent.name.endsWith(".yaml") || ent.name.endsWith(".yml")) files.push(p);
      }
    }
  }
  return [...new Set(files)].sort();
}

function defaultRoots() {
  return [
    path.join(repoRoot, "tied-project/citdp"),
    path.join(repoRoot, "tied-project/working"),
    path.join(repoRoot, "tied-bundle/docs/citdp-record-template.yaml"),
    path.join(repoRoot, "docs"),
  ];
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const outIdx = args.indexOf("--out");
  let outPath = path.join(
    repoRoot,
    "tied-project/working/ORDERED-LIST-AUDIT-2026-10-23/ordered-list-audit.jsonl",
  );
  if (outIdx >= 0 && args[outIdx + 1]) outPath = path.resolve(args[outIdx + 1]);

  const filteredArgs = args.filter((a, i) => {
    if (a === "--check" || a === "--out") return false;
    if (i > 0 && args[i - 1] === "--out") return false;
    return true;
  });

  const roots = filteredArgs.length ? filteredArgs : defaultRoots();
  const yamlFiles = collectYamlFiles(roots);
  const rows = [];

  for (const filePath of yamlFiles) {
    const rel = path.relative(repoRoot, filePath);
    if (rel.startsWith("working/") && !rel.startsWith("tied-project/working/")) {
      continue;
    }
    let data;
    try {
      data = yaml.load(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      console.error("DIAGNOSTIC: skip parse error", rel, e.message);
      continue;
    }
    if (data && typeof data === "object") walk(data, [], rel, rows);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${rows.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
  console.log(`DEBUG: TRACE: wrote ${rows.length} row(s) to ${path.relative(repoRoot, outPath)}`);

  const violations = rows.filter(
    (r) => r.semantic_class === "ordered_command" && !r.ordered_key,
  );
  if (violations.length) {
    console.error("DIAGNOSTIC: ordered command lists with non-ordered keys:");
    for (const v of violations) {
      console.error(`  ${v.file} ${v.path} (${v.key})`);
    }
  }
  if (checkOnly && violations.length > 0) process.exit(1);
}

main();
