/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] CLI dispatch mirroring MCP tools
 */

import { processCertificationMcpTools } from "../tools/process-certification-mcp-tools.js";

async function main(): Promise<void> {
  const [, , action, ...rest] = process.argv;
  const tool = processCertificationMcpTools.find((t) => {
    const slug = t.name.replace(/^tied_certification_/, "").replace(/_/g, "-");
    return action === slug || action === t.name;
  });
  if (!tool) {
    console.error(
      "Usage: tied certification <spec-validate|conformance-evaluate|capability-evaluate|independent-assess|adaptive-experiment-run|readiness-report-compose|assessor-pack-generate> …",
    );
    process.exit(2);
  }
  const payload = rest.length > 0 ? JSON.parse(rest.join(" ")) : {};
  const result = await tool.handler(payload as never);
  const text = result.content[0]?.text ?? "{}";
  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
