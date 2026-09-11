#!/usr/bin/env node
/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * Run grammar v2 audit for one evaluation-corpus row (post-session / operator helper).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import {
  corpusProjects,
  grammarV2HeaderExpectPass,
  runCorpusGrammarV2Audit,
} from "./lib/corpus-grammar-v2-replay.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STDD_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const get = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : undefined;
  };
  return {
    corpusPath: path.resolve(get("--corpus") ?? "working/evaluation/evaluation-corpus.v1.yaml"),
    clientAlias: get("--client-alias"),
    projectRoot: get("--project-root") ? path.resolve(get("--project-root")) : undefined,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const corpus = yaml.load(readFileSync(args.corpusPath, "utf8"));
  const projects = corpusProjects(corpus);
  let row;
  if (args.projectRoot) {
    row = projects.find((item) => path.resolve(String(item.project_root)) === args.projectRoot);
  } else if (args.clientAlias) {
    row = projects.find((item) => String(item.client_alias) === args.clientAlias);
  }
  if (!row) {
    console.error("ERROR: no matching corpus row");
    process.exit(2);
  }
  if (!grammarV2HeaderExpectPass(row)) {
    console.log(JSON.stringify({ ok: true, skipped: true, reason: "grammar_v2_header_expect_not_pass" }));
    return;
  }
  const result = runCorpusGrammarV2Audit(row, { stdRoot: STDD_ROOT, writeArtifact: true });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exit(1);
  }
}

main();
