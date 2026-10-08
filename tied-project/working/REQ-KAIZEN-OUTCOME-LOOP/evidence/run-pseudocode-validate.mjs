import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const { allTools } = await import(path.join(root, "mcp-server/src/tools/index.ts"));
const pc = fs.readFileSync(
  path.join(root, "tied-project/implementation-decisions/IMPL-KAIZEN-OUTCOME-LOOP-pseudocode.md"),
  "utf8",
);
const tool = allTools.find((t) => t.name === "pseudocode_validate");
const result = await tool.handler({
  token: "IMPL-KAIZEN-OUTCOME-LOOP",
  pseudocode: pc,
  gate_mode: true,
  require_contracts: true,
});
const body = JSON.parse(result.content[0].text);
const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "pseudocode-validate-result.json");
fs.writeFileSync(outPath, JSON.stringify(body, null, 2));
console.log(JSON.stringify({ ok: body.ok, gate_mode_applied: body.gate_mode_applied, errors: (body.findings || []).filter((f) => f.severity === "error").length }));
