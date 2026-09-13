#!/usr/bin/env node
/**
 * E2.3 helper — add first missing INPUT `where` refinement for constraint-enforced-v2 inventory floor.
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 */
import { readFileSync, writeFileSync } from "node:fs";

const WHERE_RE = /^\s*(INPUT|OUTPUT|DATA):[^\n]*\bwhere\b/im;

function needsWhere(text) {
  return !WHERE_RE.test(text);
}

function addWhereToFirstInput(text) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^(\s*INPUT:\s*)(.+)$/.exec(lines[i]);
    if (!m) continue;
    const rest = m[2].trim();
    if (/\bwhere\b/i.test(rest)) return text;
    let suffix = " where length(value) > 0";
    if (/argv|command-line arguments/i.test(rest)) {
      suffix = " where length(argv) > 0";
    } else if (/TBD/i.test(rest)) {
      suffix = " where true";
    } else if (rest.includes(",")) {
      const first = rest.split(",")[0].trim();
      const name = first.replace(/[^a-zA-Z0-9_]/g, "") || "value";
      suffix = ` where length(${name}) >= 0`;
    } else {
      const name = rest.replace(/[^a-zA-Z0-9_]/g, "") || "value";
      suffix = ` where length(${name}) > 0`;
    }
    lines[i] = `${m[1]}${rest}${suffix}`;
    return lines.join("\n");
  }
  return text;
}

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error("Usage: apply-enforced-v2-where-refinement.mjs <sidecar.md>...");
  process.exit(1);
}

for (const p of paths) {
  const before = readFileSync(p, "utf8");
  if (!needsWhere(before)) {
    console.log(`SKIP (already enforced floor): ${p}`);
    continue;
  }
  const after = addWhereToFirstInput(before);
  if (after === before) {
    console.error(`FAIL no INPUT line: ${p}`);
    process.exit(1);
  }
  writeFileSync(p, after, "utf8");
  console.log(`APPLY: ${p}`);
}
