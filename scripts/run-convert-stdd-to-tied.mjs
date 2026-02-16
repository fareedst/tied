#!/usr/bin/env node
/**
 * Run STDD monolithic → TIED conversion (MCP converter logic) from the command line.
 * Reads monolithic-samples/*.md and writes YAML indexes + detail .yaml under tied-converted/.
 * [REQ-CONVERSION_TOOL] [IMPL-MCP_CONVERSION]
 *
 * Usage: from repo root, node scripts/run-convert-stdd-to-tied.mjs [--dry-run]
 * With --dry-run: only print tokens and paths; do not write files.
 */

import { convertMonolithicAll } from "../mcp-server/dist/convert/runner.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const requirementsPath = path.join(root, "monolithic-samples", "requirements.md");
const architecturePath = path.join(root, "monolithic-samples", "architecture-decisions.md");
const implementationPath = path.join(root, "monolithic-samples", "implementation-decisions.md");
const outputBasePath = path.join(root, "tied-converted");

const dryRun = process.argv.includes("--dry-run");

console.log("DEBUG: STDD → TIED conversion");
console.log("DEBUG: requirements_path =", requirementsPath);
console.log("DEBUG: architecture_path =", architecturePath);
console.log("DEBUG: implementation_path =", implementationPath);
console.log("DEBUG: output_base_path =", outputBasePath);
console.log("DEBUG: dry_run =", dryRun);

const result = convertMonolithicAll({
  requirements_path: requirementsPath,
  architecture_path: architecturePath,
  implementation_path: implementationPath,
  output_base_path: outputBasePath,
  dry_run: dryRun,
  overwrite: true,
  token_format: "both",
});

if (result.errors?.length) {
  console.error("DIAGNOSTIC: conversion errors:", result.errors);
  process.exitCode = 1;
}

if (result.requirements) {
  console.log("TRACE: requirements ok =", result.requirements.ok, "tokens =", result.requirements.tokens);
  if (result.requirements.index_path) console.log("TRACE: requirements index_path =", result.requirements.index_path);
  if (result.requirements.detail_paths?.length) console.log("TRACE: requirements detail_paths =", result.requirements.detail_paths.length);
}
if (result.architecture) {
  console.log("TRACE: architecture ok =", result.architecture.ok, "tokens =", result.architecture.tokens);
  if (result.architecture.index_path) console.log("TRACE: architecture index_path =", result.architecture.index_path);
}
if (result.implementation) {
  console.log("TRACE: implementation ok =", result.implementation.ok, "tokens =", result.implementation.tokens);
  if (result.implementation.index_path) console.log("TRACE: implementation index_path =", result.implementation.index_path);
}

console.log("DEBUG: conversion run complete.");
