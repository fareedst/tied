/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: LINT_CLIENT_TIED_YAML — glob all tied YAML files recursively under client cwd; canonicalize each file.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { sayErr } from "./console.mjs";

export function collectYamlFiles(rootDir, relativeDir = "tied") {
  const base = path.join(rootDir, relativeDir);
  if (!fs.existsSync(base)) {
    return [];
  }
  const out = [];
  walkYaml(base, out);
  return out.sort();
}

function walkYaml(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkYaml(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".yaml")) {
      out.push(full);
    }
  }
}

export function lintClientTiedYaml({ clientDir, sourceRoot, nodeExec = process.execPath, spawn = spawnSync }) {
  const canonicalizer = path.join(sourceRoot, "mcp-server", "dist", "cli", "yaml-canonicalizer.js");
  if (!fs.existsSync(canonicalizer)) {
    sayErr(`lint: built canonicalizer not found: ${canonicalizer}`);
    sayErr("Run: cd mcp-server && npm install && npm run build");
    return { ok: false, code: 1, step: "lint" };
  }

  const files = collectYamlFiles(clientDir);
  for (const file of files) {
    const result = spawn(nodeExec, [canonicalizer, file], {
      cwd: clientDir,
      encoding: "utf8",
      stdio: "pipe",
    });
    if (result.status !== 0) {
      sayErr(`lint failed: ${file}`);
      if (result.stderr) {
        sayErr(result.stderr.trim());
      }
      return { ok: false, code: result.status ?? 1, step: "lint", file };
    }
  }
  return { ok: true, code: 0, step: "lint", fileCount: files.length };
}
