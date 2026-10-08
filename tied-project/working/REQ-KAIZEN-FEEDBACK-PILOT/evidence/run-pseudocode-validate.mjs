import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const { allTools } = await import(path.join(root, "mcp-server/src/tools/index.ts"));

const pseudoPath = path.join(
  root,
  "tied-project/implementation-decisions/IMPL-KAIZEN-FEEDBACK-PILOT-pseudocode.md",
);
const pseudocode = fs.readFileSync(pseudoPath, "utf8");

const tool = allTools.find((t) => t.name === "pseudocode_validate");
const result = await tool.handler({
  token: "IMPL-KAIZEN-FEEDBACK-PILOT",
  pseudocode,
  require_contracts: true,
  gate_mode: true,
});
const body = JSON.parse(result.content[0].text);
const outPath = path.join(here, "pseudocode-validate-result.json");
fs.writeFileSync(outPath, JSON.stringify(body, null, 2));
console.log(JSON.stringify({ ok: body.ok, error_count: body.errors?.length ?? 0 }));
