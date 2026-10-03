#!/usr/bin/env node
/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] CLI wrapper for stale layout lint (test-all / CI).
 */
import { runStaleLayoutLintCli, DEFAULT_REPO_ROOT } from "./lib/lint-stale-layout.mjs";
import path from "node:path";

const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_REPO_ROOT;
process.exit(runStaleLayoutLintCli(repoRoot));
