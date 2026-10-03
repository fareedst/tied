/**
 * [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Detect constraint-annotated procedures in a sidecar.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MCP_SERVER_ROOT } from "./constants.ts";

export async function sidecarHasConstraintAnnotation(
  sidecarPath: string,
): Promise<boolean> {
  const parserPath = join(MCP_SERVER_ROOT, "dist/analysis/pseudocode-parser.js");
  const constraintPath = join(
    MCP_SERVER_ROOT,
    "dist/analysis/pseudocode-constraint-language.js",
  );
  const [{ parsePseudocodeToIr }, { isConstraintAnnotatedProcedure }] = await Promise.all([
    import(parserPath),
    import(constraintPath),
  ]);
  const pseudocode = await readFile(sidecarPath, "utf8");
  const parsed = parsePseudocodeToIr(pseudocode);
  if (!parsed.ok) return false;
  const grammarVersion = parsed.program.grammar_version ?? "pseudocode-grammar.v1";
  return parsed.program.procedures.some((proc: { name: string }) =>
    isConstraintAnnotatedProcedure(proc, grammarVersion),
  );
}
