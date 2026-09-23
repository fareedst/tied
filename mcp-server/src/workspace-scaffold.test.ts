import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN] — How: workspace build smoke for Phase 1 exit gate.
describe("workspace scaffold [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("leaves MCP stdio artifact at mcp-server/dist/index.js", () => {
    const entry = path.resolve("dist/index.js");
    assert.ok(
      fs.existsSync(entry),
      `missing ${entry}; run npm run build from mcp-server workspace root`,
    );
  });

  it("builds @tied/cli tied bin next to MCP dist", () => {
    const cliBin = path.resolve("packages/cli/dist/index.js");
    assert.ok(
      fs.existsSync(cliBin),
      `missing ${cliBin}; root build must compile @tied/cli`,
    );
  });
});
