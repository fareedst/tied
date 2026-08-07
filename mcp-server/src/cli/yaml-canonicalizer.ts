import fs from "node:fs";
import {
  canonicalizeYamlText,
  writeCanonicalYamlAtomic,
} from "../yaml-canonicalizer.js";

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Canonicalize or check each requested YAML path independently using the resolved repository style.
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const paths = args.filter((arg) => arg !== "--check" && !arg.startsWith("-"));
let exitCode = 0;

for (const filePath of paths) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    process.stderr.write(`yaml-canonicalizer: not a regular file: ${filePath}\n`);
    exitCode = 1;
    continue;
  }
  let result:
    | ReturnType<typeof writeCanonicalYamlAtomic>
    | { ok: true; text: string }
    | { ok: false; error: string };
  if (checkOnly) {
    try {
      result = canonicalizeYamlText(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      result = { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  } else {
    result = writeCanonicalYamlAtomic(filePath);
  }
  if (!result.ok) {
    process.stderr.write(`yaml-canonicalizer: ${filePath}: ${result.error}\n`);
    exitCode = 1;
  } else if (checkOnly && "text" in result && result.text !== fs.readFileSync(filePath, "utf8")) {
    process.stderr.write(`yaml-canonicalizer: ${filePath}: not in resolved canonical style\n`);
    exitCode = 1;
  }
}

process.exitCode = exitCode;
