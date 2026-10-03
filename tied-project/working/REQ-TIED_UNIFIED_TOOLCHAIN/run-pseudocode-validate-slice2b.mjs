#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const tiedCli = path.join(repoRoot, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");
const pc = fs.readFileSync(
  path.join(repoRoot, "tied/implementation-decisions/IMPL-TIED_UNIFIED_TOOLCHAIN-pseudocode.md"),
  "utf8",
);
const out = execFileSync(
  tiedCli,
  [
    "pseudocode_validate",
    JSON.stringify({
      token: "IMPL-TIED_UNIFIED_TOOLCHAIN",
      require_contracts: true,
      pseudocode: pc,
    }),
  ],
  { encoding: "utf8", cwd: repoRoot },
);
const result = JSON.parse(out);
console.log(JSON.stringify({ ok: result.ok ?? result.valid, diagnostics: result.diagnostics?.length }, null, 2));
process.exit(result.ok === false || result.valid === false ? 1 : 0);
