#!/usr/bin/env node
/**
 * [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] SC-CGH-06 frozen 4015 fixture gate replay.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const { allTools } = await import(path.join(storeRoot, "mcp-server/dist/tools/index.js"));
const handler = allTools.find((t) => t.name === "tied_gate_check")?.handler;
if (!handler) {
  console.error("missing tied_gate_check");
  process.exit(2);
}
const fixtureBase = path.join(
  storeRoot,
  "tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/fixtures",
);
const out = {};
for (const phase of ["verification", "close_out"]) {
  const result = await handler({
    request_token: "REQ-SEMVER_COMPARATOR",
    phase,
    tracker_path: path.join(fixtureBase, "disposable-tracker-1794984015.yaml"),
    citdp_path: path.join(fixtureBase, "product-citdp-1794984015.yaml"),
    project_root: storeRoot,
  });
  out[phase] = JSON.parse(result.content[0]?.text ?? "{}");
}
console.log(JSON.stringify(out, null, 2));